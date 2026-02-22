import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { startOfDay, subDays, format } from "date-fns";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbUrl = process.env.DATABASE_URL ??
    `file:${path.resolve(__dirname, "../prisma/dev.db")}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });
function calculateStreak(logs) {
    const kept = logs
        .filter((l) => l.kept)
        .map((l) => startOfDay(new Date(l.date)))
        .sort((a, b) => b.getTime() - a.getTime());
    if (kept.length === 0)
        return 0;
    let streak = 0;
    let check = startOfDay(new Date());
    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
    if (!isSameDay(kept[0], check) && !isSameDay(kept[0], subDays(check, 1)))
        return 0;
    if (isSameDay(kept[0], check)) {
        streak = 1;
        check = subDays(check, 1);
        for (let i = 1; i < kept.length; i++) {
            if (isSameDay(kept[i], check)) {
                streak++;
                check = subDays(check, 1);
            }
            else
                break;
        }
    }
    else {
        check = kept[0];
        for (let i = 0; i < kept.length; i++) {
            if (isSameDay(kept[i], check)) {
                streak++;
                check = subDays(check, 1);
            }
            else
                break;
        }
    }
    return streak;
}
const server = new McpServer({
    name: "personal-dashboard",
    version: "1.0.0",
});
// ─── TOOLS ────────────────────────────────────────────────────────────────────
server.tool("get_dashboard_summary", "Get a summary of today's and this week's activity across all areas", {}, async () => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = subDays(todayStart, 7);
    const [meals, workouts, sessions, habits] = await Promise.all([
        prisma.mealLog.findMany({ where: { date: { gte: todayStart } } }),
        prisma.workoutSession.findMany({ where: { date: { gte: weekStart } } }),
        prisma.learningSession.findMany({ where: { date: { gte: weekStart } } }),
        prisma.habit.findMany({
            include: { logs: { where: { date: { gte: weekStart } }, orderBy: { date: "desc" } } },
        }),
    ]);
    const todayCalories = meals.reduce((s, m) => s + (m.calories ?? 0), 0);
    const habitData = habits.map((h) => ({
        name: h.name,
        type: h.type,
        streak: calculateStreak(h.logs.map((l) => ({ date: l.date, kept: l.kept }))),
        todayKept: h.logs.some((l) => l.date >= todayStart && l.kept),
    }));
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    date: format(now, "yyyy-MM-dd"),
                    diet: {
                        todayMeals: meals.length,
                        todayCalories,
                    },
                    exercise: {
                        sessionsThisWeek: workouts.length,
                        totalMinutesThisWeek: workouts.reduce((s, w) => s + w.durationMin, 0),
                    },
                    learning: {
                        sessionsThisWeek: sessions.length,
                        totalMinutesThisWeek: sessions.reduce((s, s2) => s + s2.durationMin, 0),
                    },
                    habits: habitData,
                }, null, 2),
            },
        ],
    };
});
server.tool("log_meal", "Log a meal to the diet tracker", {
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    description: z.string().describe("What was eaten"),
    calories: z.number().optional().describe("Calorie count"),
    protein: z.number().optional().describe("Protein in grams"),
    carbs: z.number().optional().describe("Carbs in grams"),
    fat: z.number().optional().describe("Fat in grams"),
    notes: z.string().optional(),
}, async ({ mealType, description, calories, protein, carbs, fat, notes }) => {
    const now = new Date();
    const meal = await prisma.mealLog.create({
        data: {
            date: now,
            mealType,
            description,
            calories: calories ?? null,
            protein: protein ?? null,
            carbs: carbs ?? null,
            fat: fat ?? null,
            notes: notes ?? null,
            calendarEvent: {
                create: {
                    title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${description}`,
                    start: now,
                    end: now,
                    allDay: true,
                    area: "DIET",
                    color: "#22c55e",
                },
            },
        },
    });
    return { content: [{ type: "text", text: `Logged meal: ${meal.id}` }] };
});
server.tool("log_workout", "Log a workout session", {
    name: z.string().describe("Workout name, e.g. 'Upper body push'"),
    type: z.enum(["strength", "cardio", "mobility", "sport"]),
    durationMin: z.number().describe("Duration in minutes"),
    notes: z.string().optional(),
}, async ({ name, type, durationMin, notes }) => {
    const now = new Date();
    const workout = await prisma.workoutSession.create({
        data: {
            date: now,
            name,
            type,
            durationMin,
            notes: notes ?? null,
            calendarEvent: {
                create: {
                    title: `${name} (${durationMin}min)`,
                    start: now,
                    end: new Date(now.getTime() + durationMin * 60 * 1000),
                    allDay: false,
                    area: "EXERCISE",
                    color: "#3b82f6",
                },
            },
        },
    });
    return { content: [{ type: "text", text: `Logged workout: ${workout.id}` }] };
});
server.tool("log_learning_session", "Log a learning/study session", {
    category: z.enum(["CODING", "READING", "FINANCE", "OTHER"]),
    title: z.string().describe("What you studied"),
    durationMin: z.number().describe("Duration in minutes"),
    resource: z.string().optional().describe("URL or book title"),
    notes: z.string().optional(),
}, async ({ category, title, durationMin, resource, notes }) => {
    const now = new Date();
    const session = await prisma.learningSession.create({
        data: {
            date: now,
            category,
            title,
            durationMin,
            resource: resource ?? null,
            notes: notes ?? null,
            calendarEvent: {
                create: {
                    title: `${category}: ${title}`,
                    start: now,
                    end: new Date(now.getTime() + durationMin * 60 * 1000),
                    allDay: false,
                    area: "LEARNING",
                    color: "#a855f7",
                },
            },
        },
    });
    return { content: [{ type: "text", text: `Logged session: ${session.id}` }] };
});
server.tool("get_habits", "Get all habits with their current streaks", {}, async () => {
    const habits = await prisma.habit.findMany({
        include: {
            logs: {
                orderBy: { date: "desc" },
                take: 90,
            },
        },
    });
    const result = habits.map((h) => ({
        id: h.id,
        name: h.name,
        type: h.type,
        streak: calculateStreak(h.logs.map((l) => ({ date: l.date, kept: l.kept }))),
        totalLogs: h.logs.length,
        keptCount: h.logs.filter((l) => l.kept).length,
    }));
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("check_habit", "Mark a habit as kept or missed for today", {
    habitId: z.string().describe("The habit ID (use get_habits to find IDs)"),
    kept: z.boolean().describe("True if kept, false if missed"),
    notes: z.string().optional(),
}, async ({ habitId, kept, notes }) => {
    const today = startOfDay(new Date());
    const habit = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit)
        return { content: [{ type: "text", text: "Habit not found" }] };
    await prisma.habitLog.upsert({
        where: { habitId_date: { habitId, date: today } },
        update: { kept, notes: notes ?? null },
        create: {
            habitId,
            date: today,
            kept,
            notes: notes ?? null,
            calendarEvent: {
                create: {
                    title: `${habit.name}: ${kept ? "✓ Kept" : "✗ Missed"}`,
                    start: today,
                    end: today,
                    allDay: true,
                    area: "HABITS",
                    color: kept ? "#f97316" : "#ef4444",
                },
            },
        },
    });
    return {
        content: [{ type: "text", text: `Habit "${habit.name}" marked as ${kept ? "kept" : "missed"} for today` }],
    };
});
server.tool("get_calendar_events", "Get calendar events for a date range", {
    from: z.string().describe("Start date in YYYY-MM-DD format"),
    to: z.string().describe("End date in YYYY-MM-DD format"),
}, async ({ from, to }) => {
    const events = await prisma.calendarEvent.findMany({
        where: {
            start: { gte: new Date(from) },
            end: { lte: new Date(to + "T23:59:59") },
        },
        orderBy: { start: "asc" },
    });
    return { content: [{ type: "text", text: JSON.stringify(events, null, 2) }] };
});
server.tool("get_trends", "Get weekly/monthly summary statistics", {
    period: z.enum(["week", "month"]).default("week"),
}, async ({ period }) => {
    const days = period === "week" ? 7 : 30;
    const since = subDays(startOfDay(new Date()), days);
    const [meals, workouts, sessions, habitLogs] = await Promise.all([
        prisma.mealLog.findMany({ where: { date: { gte: since } } }),
        prisma.workoutSession.findMany({ where: { date: { gte: since } } }),
        prisma.learningSession.findMany({ where: { date: { gte: since } } }),
        prisma.habitLog.findMany({ where: { date: { gte: since } }, include: { habit: true } }),
    ]);
    const avgCalories = meals.filter((m) => m.calories).length > 0
        ? Math.round(meals.reduce((s, m) => s + (m.calories ?? 0), 0) /
            meals.filter((m) => m.calories).length)
        : null;
    const habitStats = habitLogs.reduce((acc, log) => {
        if (!acc[log.habitId]) {
            acc[log.habitId] = { name: log.habit.name, kept: 0, missed: 0 };
        }
        if (log.kept)
            acc[log.habitId].kept++;
        else
            acc[log.habitId].missed++;
        return acc;
    }, {});
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    period,
                    diet: {
                        totalMeals: meals.length,
                        avgCaloriesPerMeal: avgCalories,
                        totalCalories: meals.reduce((s, m) => s + (m.calories ?? 0), 0),
                    },
                    exercise: {
                        totalSessions: workouts.length,
                        totalMinutes: workouts.reduce((s, w) => s + w.durationMin, 0),
                        byType: workouts.reduce((acc, w) => {
                            acc[w.type] = (acc[w.type] ?? 0) + 1;
                            return acc;
                        }, {}),
                    },
                    learning: {
                        totalSessions: sessions.length,
                        totalMinutes: sessions.reduce((s, s2) => s + s2.durationMin, 0),
                        byCategory: sessions.reduce((acc, s) => {
                            acc[s.category] = (acc[s.category] ?? 0) + s.durationMin;
                            return acc;
                        }, {}),
                    },
                    habits: Object.values(habitStats),
                }, null, 2),
            },
        ],
    };
});
// ─── START SERVER ─────────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Personal Dashboard MCP server running on stdio");
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
