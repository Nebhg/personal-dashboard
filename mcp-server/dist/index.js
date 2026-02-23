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
    `file:${path.resolve(__dirname, "../../prisma/dev.db")}`;
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
server.tool("get_recipes", "Get all recipes from the recipe library with ingredients and macro info", {}, async () => {
    const recipes = await prisma.recipe.findMany({
        include: {
            ingredients: { orderBy: { order: "asc" } },
            steps: { orderBy: { stepNum: "asc" } },
        },
        orderBy: { name: "asc" },
    });
    const result = recipes.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        prepTimeMins: r.prepTimeMins,
        cookTimeMins: r.cookTimeMins,
        servings: r.servings,
        macros: { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat },
        ingredients: r.ingredients.map((i) => ({ name: i.name, amount: i.amount })),
        steps: r.steps.map((s) => ({ step: s.stepNum, text: s.text })),
    }));
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("get_workout_plans", "Get all workout plan templates with their exercise tables", {}, async () => {
    const plans = await prisma.workoutPlan.findMany({
        include: { exercises: { orderBy: { order: "asc" } } },
        orderBy: { name: "asc" },
    });
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = plans.map((p) => {
        let scheduledDays = [];
        try {
            scheduledDays = JSON.parse(p.scheduledDays);
        }
        catch {
            scheduledDays = [];
        }
        return {
            id: p.id,
            name: p.name,
            description: p.description,
            scheduledDays: scheduledDays.map((d) => DAY_NAMES[d]).join(", ") || "None",
            exercises: p.exercises.map((ex) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                weightKg: ex.weightKg,
                restSec: ex.restSec,
                notes: ex.notes,
            })),
        };
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
server.tool("create_workout_plan", "Create a new workout plan template with exercises and which days of the week it's scheduled", {
    name: z.string().describe("Plan name, e.g. 'Push Day A'"),
    description: z.string().optional(),
    scheduledDays: z.array(z.number().int().min(0).max(6)).describe("Days of week to schedule this plan (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)"),
    exercises: z.array(z.object({
        name: z.string().describe("Exercise name, e.g. 'Bench Press'"),
        sets: z.number().int().optional(),
        reps: z.number().int().optional(),
        weightKg: z.number().optional(),
        restSec: z.number().int().optional().describe("Rest period in seconds"),
        notes: z.string().optional().describe("e.g. 'RPE 8', 'to failure'"),
    })).describe("List of exercises for this plan"),
}, async ({ name, description, scheduledDays, exercises }) => {
    const plan = await prisma.workoutPlan.create({
        data: {
            name,
            description: description ?? null,
            scheduledDays: JSON.stringify(scheduledDays ?? []),
            exercises: {
                create: exercises.map((ex, i) => ({
                    name: ex.name,
                    sets: ex.sets ?? null,
                    reps: ex.reps ?? null,
                    weightKg: ex.weightKg ?? null,
                    restSec: ex.restSec ?? null,
                    notes: ex.notes ?? null,
                    order: i,
                })),
            },
        },
        include: { exercises: true },
    });
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayStr = scheduledDays.map((d) => DAY_NAMES[d]).join(", ");
    return {
        content: [{
                type: "text",
                text: `Created workout plan "${plan.name}" (${plan.id}) scheduled on: ${dayStr || "no days set"}. ${plan.exercises.length} exercises added.`,
            }],
    };
});
server.tool("create_recipe", "Add a new recipe to the recipe library with ingredients, steps, and nutritional info", {
    name: z.string().describe("Recipe name"),
    description: z.string().optional(),
    prepTimeMins: z.number().int().optional(),
    cookTimeMins: z.number().int().optional(),
    servings: z.number().int().optional(),
    calories: z.number().int().optional().describe("Calories per serving"),
    protein: z.number().int().optional().describe("Protein in grams per serving"),
    carbs: z.number().int().optional().describe("Carbs in grams per serving"),
    fat: z.number().int().optional().describe("Fat in grams per serving"),
    notes: z.string().optional(),
    ingredients: z.array(z.object({
        name: z.string(),
        amount: z.string().optional().describe("e.g. '200g', '1 cup', '2 tbsp'"),
    })).optional(),
    steps: z.array(z.string()).optional().describe("Ordered cooking steps"),
}, async ({ name, description, prepTimeMins, cookTimeMins, servings, calories, protein, carbs, fat, notes, ingredients, steps }) => {
    const recipe = await prisma.recipe.create({
        data: {
            name,
            description: description ?? null,
            prepTimeMins: prepTimeMins ?? null,
            cookTimeMins: cookTimeMins ?? null,
            servings: servings ?? null,
            calories: calories ?? null,
            protein: protein ?? null,
            carbs: carbs ?? null,
            fat: fat ?? null,
            notes: notes ?? null,
            ingredients: {
                create: (ingredients ?? []).map((ing, i) => ({
                    name: ing.name,
                    amount: ing.amount ?? null,
                    order: i,
                })),
            },
            steps: {
                create: (steps ?? []).map((text, i) => ({
                    stepNum: i + 1,
                    text,
                })),
            },
        },
    });
    return {
        content: [{
                type: "text",
                text: `Created recipe "${recipe.name}" (${recipe.id})${calories ? ` — ${calories} kcal per serving` : ""}. It is now visible in the recipe library.`,
            }],
    };
});
server.tool("set_meal_plan_entry", "Set or update a planned meal for a specific day and meal slot in the weekly meal plan", {
    dayOfWeek: z.number().int().min(0).max(6).describe("0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat"),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    recipeId: z.string().optional().describe("Recipe ID from get_recipes — use this to link a recipe from the library"),
    description: z.string().optional().describe("Free-text description if not using a recipe, e.g. 'Greek yoghurt with berries'"),
}, async ({ dayOfWeek, mealType, recipeId, description }) => {
    if (!recipeId && !description) {
        return { content: [{ type: "text", text: "Error: provide either recipeId or description" }] };
    }
    const entry = await prisma.mealPlanEntry.upsert({
        where: { dayOfWeek_mealType: { dayOfWeek, mealType } },
        update: { recipeId: recipeId ?? null, description: recipeId ? null : (description ?? null) },
        create: {
            dayOfWeek,
            mealType,
            recipeId: recipeId ?? null,
            description: recipeId ? null : (description ?? null),
        },
        include: { recipe: { select: { name: true } } },
    });
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const meal = entry.recipe?.name ?? description;
    return {
        content: [{
                type: "text",
                text: `Set ${mealType} on ${DAY_NAMES[dayOfWeek]} → "${meal}". Visible in the Meal Plan grid on the dashboard.`,
            }],
    };
});
server.tool("get_weekly_schedule", "Get the full weekly schedule: which workout plans are on which days, and what meals are planned each day", {}, async () => {
    const [plans, mealPlanEntries] = await Promise.all([
        prisma.workoutPlan.findMany({
            include: { exercises: { orderBy: { order: "asc" } } },
            orderBy: { name: "asc" },
        }),
        prisma.mealPlanEntry.findMany({
            include: { recipe: { select: { name: true, calories: true, protein: true, carbs: true, fat: true } } },
            orderBy: { dayOfWeek: "asc" },
        }),
    ]);
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun display
    const schedule = DISPLAY_ORDER.map((dow) => {
        const workouts = plans
            .filter((p) => {
            try {
                return JSON.parse(p.scheduledDays).includes(dow);
            }
            catch {
                return false;
            }
        })
            .map((p) => ({
            plan: p.name,
            exercises: p.exercises.map((ex) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                weightKg: ex.weightKg ? `${ex.weightKg}kg` : null,
            })),
        }));
        const meals = mealPlanEntries
            .filter((e) => e.dayOfWeek === dow)
            .map((e) => ({
            mealType: e.mealType,
            meal: e.recipe?.name ?? e.description,
            calories: e.recipe?.calories ?? null,
        }));
        return { day: DAY_NAMES[dow], workouts, meals };
    });
    return { content: [{ type: "text", text: JSON.stringify(schedule, null, 2) }] };
});
server.tool("create_schedule_block", "Add a time block to the calendar (gym session, work, sleep, learning time, commute, etc.)", {
    title: z.string().describe("Block title, e.g. 'Morning gym', 'Deep work', 'Sleep'"),
    category: z.enum(["GYM", "LEARNING", "SLEEP", "WORK", "COMMUTE", "PERSONAL"]),
    start: z.string().describe("ISO 8601 datetime, e.g. 2026-02-23T07:00:00"),
    end: z.string().describe("ISO 8601 datetime, e.g. 2026-02-23T08:30:00"),
    allDay: z.boolean().default(false),
    notes: z.string().optional(),
}, async ({ title, category, start, end, allDay, notes }) => {
    const CATEGORY_COLORS = {
        GYM: "#3b82f6",
        LEARNING: "#a855f7",
        SLEEP: "#64748b",
        WORK: "#0ea5e9",
        COMMUTE: "#f59e0b",
        PERSONAL: "#ec4899",
    };
    const color = CATEGORY_COLORS[category] ?? "#6366f1";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const block = await prisma.scheduleBlock.create({
        data: {
            title,
            start: startDate,
            end: endDate,
            allDay,
            category,
            color,
            notes: notes ?? null,
            calendarEvent: {
                create: {
                    title,
                    start: startDate,
                    end: endDate,
                    allDay,
                    area: "SCHEDULE",
                    color,
                    description: notes ?? null,
                },
            },
        },
    });
    return { content: [{ type: "text", text: `Created schedule block: ${block.id} — ${title} (${category})` }] };
});
server.tool("get_upcoming_schedule", "Get scheduled time blocks for the next N days", {
    days: z.number().default(7).describe("Number of days ahead to look (default 7)"),
}, async ({ days }) => {
    const now = startOfDay(new Date());
    const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const blocks = await prisma.scheduleBlock.findMany({
        where: { start: { gte: now, lte: until } },
        orderBy: { start: "asc" },
    });
    const result = blocks.map((b) => ({
        id: b.id,
        title: b.title,
        category: b.category,
        start: format(b.start, "yyyy-MM-dd HH:mm"),
        end: format(b.end, "yyyy-MM-dd HH:mm"),
        allDay: b.allDay,
        notes: b.notes,
    }));
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
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
