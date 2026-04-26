import * as dotenv from "dotenv";
import * as path from "path";
// Load .env.local first (dashboard OAuth creds), then .env as fallback
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient, type InValue } from "@libsql/client";
import { startOfDay, subDays, format } from "date-fns";
import { randomUUID } from "crypto";
import * as fs from "fs";
import { google } from "googleapis";

const TRACKER_MD_PATH = path.join(process.env.HOME ?? "~", "career_tracker", "tracker.md");

const STAGE_LABELS: Record<string, string> = {
  APPLIED: "Applied", SCREEN: "Talent Screen", TECHNICAL: "Technical",
  FINAL: "Final Round", OFFER: "Offer", REJECTED: "Rejected", GHOSTED: "Ghosted",
};

async function regenerateTrackerMd(): Promise<void> {
  try {
    const result = await db.execute(`SELECT * FROM "JobApplication" ORDER BY
      CASE stage WHEN 'FINAL' THEN 1 WHEN 'TECHNICAL' THEN 2 WHEN 'SCREEN' THEN 3
      WHEN 'APPLIED' THEN 4 WHEN 'OFFER' THEN 5 ELSE 6 END, updatedAt DESC`);

    const today = format(new Date(), "yyyy-MM-dd");
    const active = result.rows.filter((r) => !["REJECTED","GHOSTED"].includes(r.stage as string));
    const closed = result.rows.filter((r) => ["REJECTED","GHOSTED"].includes(r.stage as string));

    const sections: string[] = [`# Career Tracker — Last updated: ${today}`, "", "---", "", "## ACTIVE PIPELINE", ""];
    for (const a of active) {
      const role = a.role ? ` — ${a.role}` : " — [Role TBC]";
      sections.push(`### ${a.firm}${role}`);
      sections.push(`- **Stage:** ${STAGE_LABELS[a.stage as string] ?? a.stage}`);
      sections.push(`- **Applied:** ${a.appliedDate ? format(new Date(a.appliedDate as string), "yyyy-MM-dd") : "Unknown"}`);
      sections.push(`- **Last action:** ${a.lastAction ?? "—"}`);
      sections.push(`- **Next action:** ${a.nextAction ?? "—"}`);
      sections.push(`- **Prep needed:** ${a.prepNeeded ? "YES" : "NO"}${a.prepNotes ? ` — ${a.prepNotes}` : ""}`);
      sections.push(`- **Notes:** ${a.notes ?? "—"}`);
      sections.push("", "---", "");
    }

    sections.push("## CLOSED / INACTIVE", "");
    for (const a of closed) {
      const role = a.role ?? "[Role TBC]";
      sections.push(`- ${a.firm} — ${role} (${STAGE_LABELS[a.stage as string] ?? a.stage})`);
    }
    sections.push("", "---", "", `## LOG`, "", `- ${today} — Tracker regenerated from dashboard DB`);

    // Preserve existing log entries if file exists
    if (fs.existsSync(TRACKER_MD_PATH)) {
      const existing = fs.readFileSync(TRACKER_MD_PATH, "utf-8");
      const logMatch = existing.match(/## LOG\n([\s\S]*)/);
      if (logMatch) {
        const oldLog = logMatch[1].trim();
        sections[sections.length - 1] = `- ${today} — Tracker regenerated from dashboard DB`;
        sections.push(...oldLog.split("\n").filter((l) => l.trim() && !l.includes("Tracker regenerated")));
      }
    }

    fs.writeFileSync(TRACKER_MD_PATH, sections.join("\n"), "utf-8");
  } catch (e) {
    console.error("Failed to regenerate tracker.md:", e);
  }
}

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const db = createClient({ url: dbUrl });

function uid(): string {
  return randomUUID();
}

function calculateStreak(logs: { date: string | Date; kept: boolean }[]): number {
  const kept = logs
    .filter((l) => l.kept)
    .map((l) => startOfDay(new Date(l.date as string)))
    .sort((a, b) => b.getTime() - a.getTime());

  if (kept.length === 0) return 0;

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const check0 = startOfDay(new Date());
  if (!isSameDay(kept[0], check0) && !isSameDay(kept[0], subDays(check0, 1))) return 0;

  let streak = 0;
  let check = check0;

  if (isSameDay(kept[0], check)) {
    streak = 1;
    check = subDays(check, 1);
    for (let i = 1; i < kept.length; i++) {
      if (isSameDay(kept[i], check)) { streak++; check = subDays(check, 1); }
      else break;
    }
  } else {
    check = kept[0];
    for (let i = 0; i < kept.length; i++) {
      if (isSameDay(kept[i], check)) { streak++; check = subDays(check, 1); }
      else break;
    }
  }
  return streak;
}

const server = new McpServer({
  name: "personal-dashboard",
  version: "1.0.0",
});

// ─── TOOLS ────────────────────────────────────────────────────────────────────

server.tool(
  "get_dashboard_summary",
  "Get a summary of today's and this week's activity across all areas",
  {},
  async () => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = subDays(todayStart, 7);

    const [mealsRes, workoutsRes, sessionsRes, habitsRes, habitLogsRes] = await Promise.all([
      db.execute({ sql: `SELECT * FROM "MealLog" WHERE date >= ?`, args: [todayStart.toISOString()] }),
      db.execute({ sql: `SELECT * FROM "WorkoutSession" WHERE date >= ?`, args: [weekStart.toISOString()] }),
      db.execute({ sql: `SELECT * FROM "LearningSession" WHERE date >= ?`, args: [weekStart.toISOString()] }),
      db.execute({ sql: `SELECT * FROM "Habit"`, args: [] }),
      db.execute({ sql: `SELECT * FROM "HabitLog" WHERE date >= ?`, args: [weekStart.toISOString()] }),
    ]);

    const meals = mealsRes.rows;
    const workouts = workoutsRes.rows;
    const sessions = sessionsRes.rows;
    const habits = habitsRes.rows;
    const habitLogs = habitLogsRes.rows;

    const todayCalories = meals.reduce((s, m) => s + ((m.calories as number) ?? 0), 0);

    const habitData = habits.map((h) => {
      const logs = habitLogs
        .filter((l) => l.habitId === h.id)
        .map((l) => ({ date: l.date as string, kept: Boolean(l.kept) }));
      return {
        name: h.name,
        type: h.type,
        streak: calculateStreak(logs),
        todayKept: logs.some((l) => new Date(l.date) >= todayStart && l.kept),
      };
    });

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          date: format(now, "yyyy-MM-dd"),
          diet: { todayMeals: meals.length, todayCalories },
          exercise: {
            sessionsThisWeek: workouts.length,
            totalMinutesThisWeek: workouts.reduce((s, w) => s + (w.durationMin as number), 0),
          },
          learning: {
            sessionsThisWeek: sessions.length,
            totalMinutesThisWeek: sessions.reduce((s, s2) => s + (s2.durationMin as number), 0),
          },
          habits: habitData,
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "log_meal",
  "Log a meal to the diet tracker",
  {
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    description: z.string().describe("What was eaten"),
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    notes: z.string().optional(),
  },
  async ({ mealType, description, calories, protein, carbs, fat, notes }) => {
    const now = new Date();
    const mealId = uid();
    const eventId = uid();
    const isoNow = now.toISOString();

    await db.batch([
      {
        sql: `INSERT INTO "MealLog" (id, date, mealType, description, calories, protein, carbs, fat, notes, recipeId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
        args: [mealId, isoNow, mealType, description, calories ?? null, protein ?? null, carbs ?? null, fat ?? null, notes ?? null, isoNow, isoNow],
      },
      {
        sql: `INSERT INTO "CalendarEvent" (id, title, start, end, allDay, area, color, description, mealLogId, workoutSessionId, learningSessionId, habitLogId, scheduleBlockId, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, 'DIET', '#22c55e', NULL, ?, NULL, NULL, NULL, NULL, ?, ?)`,
        args: [eventId, `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${description}`, isoNow, isoNow, mealId, isoNow, isoNow],
      },
    ]);

    return { content: [{ type: "text" as const, text: `Logged meal: ${mealId}` }] };
  }
);

server.tool(
  "log_workout",
  "Log a workout session",
  {
    name: z.string().describe("Workout name, e.g. 'Upper body push'"),
    type: z.enum(["strength", "cardio", "mobility", "sport"]),
    durationMin: z.coerce.number().describe("Duration in minutes"),
    notes: z.string().optional(),
  },
  async ({ name, type, durationMin, notes }) => {
    const now = new Date();
    const sessionId = uid();
    const eventId = uid();
    const isoNow = now.toISOString();
    const isoEnd = new Date(now.getTime() + durationMin * 60 * 1000).toISOString();

    await db.batch([
      {
        sql: `INSERT INTO "WorkoutSession" (id, date, name, type, durationMin, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [sessionId, isoNow, name, type, durationMin, notes ?? null, isoNow, isoNow],
      },
      {
        sql: `INSERT INTO "CalendarEvent" (id, title, start, end, allDay, area, color, description, mealLogId, workoutSessionId, learningSessionId, habitLogId, scheduleBlockId, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, 'EXERCISE', '#3b82f6', NULL, NULL, ?, NULL, NULL, NULL, ?, ?)`,
        args: [eventId, `${name} (${durationMin}min)`, isoNow, isoEnd, sessionId, isoNow, isoNow],
      },
    ]);

    return { content: [{ type: "text" as const, text: `Logged workout: ${sessionId}` }] };
  }
);

server.tool(
  "log_learning_session",
  "Log a learning/study session",
  {
    category: z.enum(["CODING", "READING", "FINANCE", "OTHER"]),
    title: z.string().describe("What you studied"),
    durationMin: z.coerce.number().describe("Duration in minutes"),
    resource: z.string().optional().describe("URL or book title"),
    notes: z.string().optional(),
  },
  async ({ category, title, durationMin, resource, notes }) => {
    const now = new Date();
    const sessionId = uid();
    const eventId = uid();
    const isoNow = now.toISOString();
    const isoEnd = new Date(now.getTime() + durationMin * 60 * 1000).toISOString();

    await db.batch([
      {
        sql: `INSERT INTO "LearningSession" (id, date, category, title, durationMin, resource, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [sessionId, isoNow, category, title, durationMin, resource ?? null, notes ?? null, isoNow, isoNow],
      },
      {
        sql: `INSERT INTO "CalendarEvent" (id, title, start, end, allDay, area, color, description, mealLogId, workoutSessionId, learningSessionId, habitLogId, scheduleBlockId, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, 'LEARNING', '#a855f7', NULL, NULL, NULL, ?, NULL, NULL, ?, ?)`,
        args: [eventId, `${category}: ${title}`, isoNow, isoEnd, sessionId, isoNow, isoNow],
      },
    ]);

    return { content: [{ type: "text" as const, text: `Logged session: ${sessionId}` }] };
  }
);

server.tool(
  "get_habits",
  "Get all habits with their current streaks",
  {},
  async () => {
    const since = subDays(startOfDay(new Date()), 90);
    const [habitsRes, logsRes] = await Promise.all([
      db.execute({ sql: `SELECT * FROM "Habit"`, args: [] }),
      db.execute({ sql: `SELECT * FROM "HabitLog" WHERE date >= ? ORDER BY date DESC`, args: [since.toISOString()] }),
    ]);

    const result = habitsRes.rows.map((h) => {
      const logs = logsRes.rows
        .filter((l) => l.habitId === h.id)
        .map((l) => ({ date: l.date as string, kept: Boolean(l.kept) }));
      return {
        id: h.id,
        name: h.name,
        type: h.type,
        streak: calculateStreak(logs),
        totalLogs: logs.length,
        keptCount: logs.filter((l) => l.kept).length,
      };
    });

    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "check_habit",
  "Mark a habit as kept or missed for today",
  {
    habitId: z.string().describe("The habit ID (use get_habits to find IDs)"),
    kept: z.boolean().describe("True if kept, false if missed"),
    notes: z.string().optional(),
  },
  async ({ habitId, kept, notes }) => {
    const today = startOfDay(new Date());
    const habitRes = await db.execute({ sql: `SELECT * FROM "Habit" WHERE id = ?`, args: [habitId] });
    if (habitRes.rows.length === 0) return { content: [{ type: "text" as const, text: "Habit not found" }] };
    const habit = habitRes.rows[0];

    const isoToday = today.toISOString();
    const isoNow = new Date().toISOString();

    const existingRes = await db.execute({
      sql: `SELECT id FROM "HabitLog" WHERE habitId = ? AND date = ?`,
      args: [habitId, isoToday],
    });

    if (existingRes.rows.length > 0) {
      await db.execute({
        sql: `UPDATE "HabitLog" SET kept = ?, notes = ? WHERE habitId = ? AND date = ?`,
        args: [kept ? 1 : 0, notes ?? null, habitId, isoToday],
      });
    } else {
      const logId = uid();
      const eventId = uid();
      await db.batch([
        {
          sql: `INSERT INTO "HabitLog" (id, habitId, date, kept, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [logId, habitId, isoToday, kept ? 1 : 0, notes ?? null, isoNow],
        },
        {
          sql: `INSERT INTO "CalendarEvent" (id, title, start, end, allDay, area, color, description, mealLogId, workoutSessionId, learningSessionId, habitLogId, scheduleBlockId, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, 'HABITS', ?, NULL, NULL, NULL, NULL, ?, NULL, ?, ?)`,
          args: [eventId, `${habit.name}: ${kept ? "✓ Kept" : "✗ Missed"}`, isoToday, isoToday, kept ? "#f97316" : "#ef4444", logId, isoNow, isoNow],
        },
      ]);
    }

    return {
      content: [{ type: "text" as const, text: `Habit "${habit.name}" marked as ${kept ? "kept" : "missed"} for today` }],
    };
  }
);

server.tool(
  "create_habit",
  "Create a new habit to track (BUILD a positive habit or QUIT a bad one)",
  {
    name: z.string().describe("Habit name, e.g. 'Daily meditation'"),
    type: z.enum(["BUILD", "QUIT"]).describe("BUILD = positive habit to form, QUIT = bad habit to break"),
    description: z.string().optional(),
    targetDays: z.coerce.number().int().optional().describe("Goal streak length in days, e.g. 30 or 66"),
  },
  async ({ name, type, description, targetDays }) => {
    const isoNow = new Date().toISOString();
    const habitId = uid();

    await db.execute({
      sql: `INSERT INTO "Habit" (id, name, type, description, startDate, targetDays, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [habitId, name, type, description ?? null, isoNow, targetDays ?? null, isoNow, isoNow],
    });

    return {
      content: [{
        type: "text" as const,
        text: `Created habit "${name}" (${type}, ID: ${habitId}). Use check_habit with this ID to log it each day.`,
      }],
    };
  }
);

server.tool(
  "update_habit",
  "Edit an existing habit's name, type, description, or target days",
  {
    habitId: z.string().describe("The habit ID (use get_habits to find IDs)"),
    name: z.string().optional(),
    type: z.enum(["BUILD", "QUIT"]).optional(),
    description: z.string().optional(),
    targetDays: z.coerce.number().int().optional().describe("New goal streak length in days"),
  },
  async ({ habitId, name, type, description, targetDays }) => {
    const habitRes = await db.execute({ sql: `SELECT * FROM "Habit" WHERE id = ?`, args: [habitId] });
    if (habitRes.rows.length === 0) return { content: [{ type: "text" as const, text: "Habit not found" }] };

    const isoNow = new Date().toISOString();
    const current = habitRes.rows[0];

    await db.execute({
      sql: `UPDATE "Habit" SET name = ?, type = ?, description = ?, targetDays = ?, updatedAt = ? WHERE id = ?`,
      args: [
        name ?? current.name,
        type ?? current.type,
        description !== undefined ? description : current.description,
        targetDays !== undefined ? targetDays : current.targetDays,
        isoNow,
        habitId,
      ],
    });

    return {
      content: [{ type: "text" as const, text: `Updated habit "${name ?? current.name}"` }],
    };
  }
);

server.tool(
  "delete_habit",
  "Permanently delete a habit and all its logs",
  {
    habitId: z.string().describe("The habit ID (use get_habits to find IDs)"),
  },
  async ({ habitId }) => {
    const habitRes = await db.execute({ sql: `SELECT name FROM "Habit" WHERE id = ?`, args: [habitId] });
    if (habitRes.rows.length === 0) return { content: [{ type: "text" as const, text: "Habit not found" }] };
    const name = habitRes.rows[0].name;

    // Delete CalendarEvents linked to HabitLogs first, then logs, then habit
    await db.batch([
      {
        sql: `DELETE FROM "CalendarEvent" WHERE habitLogId IN (SELECT id FROM "HabitLog" WHERE habitId = ?)`,
        args: [habitId],
      },
      { sql: `DELETE FROM "HabitLog" WHERE habitId = ?`, args: [habitId] },
      { sql: `DELETE FROM "Habit" WHERE id = ?`, args: [habitId] },
    ]);

    return { content: [{ type: "text" as const, text: `Deleted habit "${name}"` }] };
  }
);

server.tool(
  "get_calendar_events",
  "Get calendar events for a date range",
  {
    from: z.string().describe("Start date in YYYY-MM-DD format"),
    to: z.string().describe("End date in YYYY-MM-DD format"),
  },
  async ({ from, to }) => {
    const res = await db.execute({
      sql: `SELECT * FROM "CalendarEvent" WHERE start >= ? AND end <= ? ORDER BY start ASC`,
      args: [new Date(from).toISOString(), new Date(to + "T23:59:59").toISOString()],
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(res.rows, null, 2) }] };
  }
);

server.tool(
  "get_trends",
  "Get weekly/monthly summary statistics",
  { period: z.enum(["week", "month"]).default("week") },
  async ({ period }) => {
    const days = period === "week" ? 7 : 30;
    const since = subDays(startOfDay(new Date()), days);
    const isoSince = since.toISOString();

    const [mealsRes, workoutsRes, sessionsRes, habitLogsRes] = await Promise.all([
      db.execute({ sql: `SELECT * FROM "MealLog" WHERE date >= ?`, args: [isoSince] }),
      db.execute({ sql: `SELECT * FROM "WorkoutSession" WHERE date >= ?`, args: [isoSince] }),
      db.execute({ sql: `SELECT * FROM "LearningSession" WHERE date >= ?`, args: [isoSince] }),
      db.execute({
        sql: `SELECT hl.*, h.name as habitName FROM "HabitLog" hl JOIN "Habit" h ON h.id = hl.habitId WHERE hl.date >= ?`,
        args: [isoSince],
      }),
    ]);

    const meals = mealsRes.rows;
    const workouts = workoutsRes.rows;
    const sessions = sessionsRes.rows;
    const habitLogs = habitLogsRes.rows;

    const mealsWithCalories = meals.filter((m) => m.calories !== null);
    const avgCalories = mealsWithCalories.length > 0
      ? Math.round(mealsWithCalories.reduce((s, m) => s + (m.calories as number), 0) / mealsWithCalories.length)
      : null;

    const habitStats = habitLogs.reduce<Record<string, { name: string; kept: number; missed: number }>>((acc, log) => {
      const id = log.habitId as string;
      if (!acc[id]) acc[id] = { name: log.habitName as string, kept: 0, missed: 0 };
      if (log.kept) acc[id].kept++;
      else acc[id].missed++;
      return acc;
    }, {});

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          period,
          diet: {
            totalMeals: meals.length,
            avgCaloriesPerMeal: avgCalories,
            totalCalories: meals.reduce((s, m) => s + ((m.calories as number) ?? 0), 0),
          },
          exercise: {
            totalSessions: workouts.length,
            totalMinutes: workouts.reduce((s, w) => s + (w.durationMin as number), 0),
            byType: workouts.reduce<Record<string, number>>((acc, w) => {
              const t = w.type as string;
              acc[t] = (acc[t] ?? 0) + 1;
              return acc;
            }, {}),
          },
          learning: {
            totalSessions: sessions.length,
            totalMinutes: sessions.reduce((s, s2) => s + (s2.durationMin as number), 0),
            byCategory: sessions.reduce<Record<string, number>>((acc, s) => {
              const c = s.category as string;
              acc[c] = (acc[c] ?? 0) + (s.durationMin as number);
              return acc;
            }, {}),
          },
          habits: Object.values(habitStats),
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "get_recipes",
  "Get all recipes from the recipe library with ingredients and macro info",
  {},
  async () => {
    const [recipesRes, ingredientsRes, stepsRes] = await Promise.all([
      db.execute({ sql: `SELECT * FROM "Recipe" ORDER BY name ASC`, args: [] }),
      db.execute({ sql: `SELECT * FROM "RecipeIngredient" ORDER BY "order" ASC`, args: [] }),
      db.execute({ sql: `SELECT * FROM "RecipeStep" ORDER BY stepNum ASC`, args: [] }),
    ]);

    const result = recipesRes.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      prepTimeMins: r.prepTimeMins,
      cookTimeMins: r.cookTimeMins,
      servings: r.servings,
      macros: { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat },
      ingredients: ingredientsRes.rows
        .filter((i) => i.recipeId === r.id)
        .map((i) => ({ name: i.name, amount: i.amount })),
      steps: stepsRes.rows
        .filter((s) => s.recipeId === r.id)
        .map((s) => ({ step: s.stepNum, text: s.text })),
    }));

    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "get_workout_plans",
  "Get all workout plan templates with their exercise tables",
  {},
  async () => {
    const [plansRes, exercisesRes] = await Promise.all([
      db.execute({ sql: `SELECT * FROM "WorkoutPlan" ORDER BY name ASC`, args: [] }),
      db.execute({ sql: `SELECT * FROM "WorkoutPlanExercise" ORDER BY "order" ASC`, args: [] }),
    ]);

    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = plansRes.rows.map((p) => {
      let scheduledDays: number[] = [];
      try { scheduledDays = JSON.parse(p.scheduledDays as string); } catch { scheduledDays = []; }
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        scheduledDays: scheduledDays.map((d) => DAY_NAMES[d]).join(", ") || "None",
        exercises: exercisesRes.rows
          .filter((ex) => ex.planId === p.id)
          .map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weightKg: ex.weightKg,
            restSec: ex.restSec,
            notes: ex.notes,
          })),
      };
    });

    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "create_workout_plan",
  "Create a new workout plan template with exercises and scheduled days",
  {
    name: z.string().describe("Plan name, e.g. 'Push Day A'"),
    description: z.string().optional(),
    scheduledDays: z.union([
      z.array(z.number().int().min(0).max(6)),
      z.string().transform((s) => JSON.parse(s) as number[]),
    ]).describe("Days of week as array (0=Sun … 6=Sat), e.g. [1,3,6] for Mon/Wed/Sat"),
    exercises: z.union([
      z.array(z.object({
        name: z.string(),
        sets: z.coerce.number().int().optional(),
        reps: z.coerce.number().int().optional(),
        weightKg: z.coerce.number().optional(),
        restSec: z.coerce.number().int().optional(),
        notes: z.string().optional(),
      })),
      z.string().transform((s) => JSON.parse(s) as object[]),
    ]),
  },
  async ({ name, description, scheduledDays, exercises }) => {
    const isoNow = new Date().toISOString();
    const planId = uid();

    const statements = [
      {
        sql: `INSERT INTO "WorkoutPlan" (id, name, description, scheduledDays, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [planId, name, description ?? null, JSON.stringify(scheduledDays ?? []), isoNow, isoNow],
      },
      ...exercises.map((ex, i) => ({
        sql: `INSERT INTO "WorkoutPlanExercise" (id, planId, name, sets, reps, weightKg, restSec, notes, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [uid(), planId, ex.name, ex.sets ?? null, ex.reps ?? null, ex.weightKg ?? null, ex.restSec ?? null, ex.notes ?? null, i],
      })),
    ];

    await db.batch(statements);

    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayStr = scheduledDays.map((d) => DAY_NAMES[d]).join(", ");
    return {
      content: [{
        type: "text" as const,
        text: `Created workout plan "${name}" (${planId}) scheduled on: ${dayStr || "no days set"}. ${exercises.length} exercises added.`,
      }],
    };
  }
);

server.tool(
  "create_recipe",
  "Add a new recipe to the recipe library with ingredients, steps, and nutritional info",
  {
    name: z.string(),
    description: z.string().optional(),
    prepTimeMins: z.number().int().optional(),
    cookTimeMins: z.number().int().optional(),
    servings: z.number().int().optional(),
    calories: z.number().int().optional().describe("Calories per serving"),
    protein: z.number().int().optional().describe("Protein in grams"),
    carbs: z.number().int().optional().describe("Carbs in grams"),
    fat: z.number().int().optional().describe("Fat in grams"),
    notes: z.string().optional(),
    ingredients: z.array(z.object({
      name: z.string(),
      amount: z.string().optional().describe("e.g. '200g', '1 cup'"),
    })).optional(),
    steps: z.array(z.string()).optional().describe("Ordered cooking steps"),
  },
  async ({ name, description, prepTimeMins, cookTimeMins, servings, calories, protein, carbs, fat, notes, ingredients, steps }) => {
    const isoNow = new Date().toISOString();
    const recipeId = uid();

    const statements = [
      {
        sql: `INSERT INTO "Recipe" (id, name, description, prepTimeMins, cookTimeMins, servings, calories, protein, carbs, fat, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [recipeId, name, description ?? null, prepTimeMins ?? null, cookTimeMins ?? null, servings ?? null, calories ?? null, protein ?? null, carbs ?? null, fat ?? null, notes ?? null, isoNow, isoNow],
      },
      ...(ingredients ?? []).map((ing, i) => ({
        sql: `INSERT INTO "RecipeIngredient" (id, recipeId, name, amount, "order") VALUES (?, ?, ?, ?, ?)`,
        args: [uid(), recipeId, ing.name, ing.amount ?? null, i],
      })),
      ...(steps ?? []).map((text, i) => ({
        sql: `INSERT INTO "RecipeStep" (id, recipeId, stepNum, text) VALUES (?, ?, ?, ?)`,
        args: [uid(), recipeId, i + 1, text],
      })),
    ];

    await db.batch(statements);

    return {
      content: [{
        type: "text" as const,
        text: `Created recipe "${name}" (ID: ${recipeId})${calories ? ` — ${calories} kcal per serving` : ""}.

Now ask the user: "Which days and meals would you like to add **${name}** to your meal plan? For example: Monday dinner, Wednesday lunch." Then call \`set_meal_plan_entry\` for each slot they mention, using recipeId: "${recipeId}".`,
      }],
    };
  }
);

server.tool(
  "set_meal_plan_entry",
  "Set or update a planned meal for a specific day and meal slot in the weekly meal plan",
  {
    dayOfWeek: z.coerce.number().int().min(0).max(6).describe("0=Sun, 1=Mon … 6=Sat"),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    recipeId: z.string().optional().describe("Recipe ID from get_recipes"),
    description: z.string().optional().describe("Free-text if not using a recipe"),
  },
  async ({ dayOfWeek, mealType, recipeId, description }) => {
    if (!recipeId && !description) {
      return { content: [{ type: "text" as const, text: "Error: provide either recipeId or description" }] };
    }
    const isoNow = new Date().toISOString();
    const entryId = uid();

    await db.execute({
      sql: `INSERT INTO "MealPlanEntry" (id, dayOfWeek, mealType, recipeId, description, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(dayOfWeek, mealType) DO UPDATE SET
              recipeId = excluded.recipeId,
              description = excluded.description,
              updatedAt = excluded.updatedAt`,
      args: [entryId, dayOfWeek, mealType, recipeId ?? null, recipeId ? null : (description ?? null), isoNow, isoNow],
    });

    let mealName = description;
    if (recipeId) {
      const res = await db.execute({ sql: `SELECT name FROM "Recipe" WHERE id = ?`, args: [recipeId] });
      mealName = res.rows.length > 0 ? res.rows[0].name as string : recipeId;
    }

    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return {
      content: [{
        type: "text" as const,
        text: `Set ${mealType} on ${DAY_NAMES[dayOfWeek]} → "${mealName}". Visible in the Meal Plan grid on the dashboard.`,
      }],
    };
  }
);

server.tool(
  "get_weekly_schedule",
  "Get the full weekly schedule: which workout plans are on which days, and what meals are planned",
  {},
  async () => {
    const [plansRes, exercisesRes, mealPlanRes, recipesRes] = await Promise.all([
      db.execute({ sql: `SELECT * FROM "WorkoutPlan" ORDER BY name ASC`, args: [] }),
      db.execute({ sql: `SELECT * FROM "WorkoutPlanExercise" ORDER BY "order" ASC`, args: [] }),
      db.execute({ sql: `SELECT * FROM "MealPlanEntry" ORDER BY dayOfWeek ASC`, args: [] }),
      db.execute({ sql: `SELECT id, name, calories, protein, carbs, fat FROM "Recipe"`, args: [] }),
    ]);

    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun

    const schedule = DISPLAY_ORDER.map((dow) => {
      const workouts = plansRes.rows
        .filter((p) => {
          try { return (JSON.parse(p.scheduledDays as string) as number[]).includes(dow); }
          catch { return false; }
        })
        .map((p) => ({
          plan: p.name,
          exercises: exercisesRes.rows.filter((ex) => ex.planId === p.id).map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weightKg: ex.weightKg ? `${ex.weightKg}kg` : null,
          })),
        }));

      const meals = mealPlanRes.rows
        .filter((e) => e.dayOfWeek === dow)
        .map((e) => {
          const recipe = e.recipeId ? recipesRes.rows.find((r) => r.id === e.recipeId) : null;
          return {
            mealType: e.mealType,
            meal: recipe?.name ?? e.description,
            calories: recipe?.calories ?? null,
          };
        });

      return { day: DAY_NAMES[dow], workouts, meals };
    });

    return { content: [{ type: "text" as const, text: JSON.stringify(schedule, null, 2) }] };
  }
);

server.tool(
  "create_schedule_block",
  "Add a time block to the calendar (gym, work, sleep, learning, commute, etc.)",
  {
    title: z.string().describe("Block title, e.g. 'Morning gym', 'Deep work', 'Sleep'"),
    category: z.enum(["GYM", "LEARNING", "SLEEP", "WORK", "COMMUTE", "PERSONAL"]),
    start: z.string().describe("ISO 8601 datetime, e.g. 2026-02-23T07:00:00"),
    end: z.string().describe("ISO 8601 datetime, e.g. 2026-02-23T08:30:00"),
    allDay: z.boolean().default(false),
    notes: z.string().optional(),
  },
  async ({ title, category, start, end, allDay, notes }) => {
    const CATEGORY_COLORS: Record<string, string> = {
      GYM: "#3b82f6", LEARNING: "#a855f7", SLEEP: "#64748b",
      WORK: "#0ea5e9", COMMUTE: "#f59e0b", PERSONAL: "#ec4899",
    };
    const color = CATEGORY_COLORS[category] ?? "#6366f1";
    const isoStart = new Date(start).toISOString();
    const isoEnd = new Date(end).toISOString();
    const isoNow = new Date().toISOString();
    const blockId = uid();
    const eventId = uid();

    await db.batch([
      {
        sql: `INSERT INTO "ScheduleBlock" (id, title, start, end, allDay, category, color, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [blockId, title, isoStart, isoEnd, allDay ? 1 : 0, category, color, notes ?? null, isoNow, isoNow],
      },
      {
        sql: `INSERT INTO "CalendarEvent" (id, title, start, end, allDay, area, color, description, mealLogId, workoutSessionId, learningSessionId, habitLogId, scheduleBlockId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'SCHEDULE', ?, ?, NULL, NULL, NULL, NULL, ?, ?, ?)`,
        args: [eventId, title, isoStart, isoEnd, allDay ? 1 : 0, color, notes ?? null, blockId, isoNow, isoNow],
      },
    ]);

    return { content: [{ type: "text" as const, text: `Created schedule block: ${blockId} — ${title} (${category})` }] };
  }
);

server.tool(
  "get_upcoming_schedule",
  "Get scheduled time blocks for the next N days",
  { days: z.coerce.number().default(7).describe("Number of days ahead to look (default 7)") },
  async ({ days }) => {
    const now = startOfDay(new Date());
    const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const res = await db.execute({
      sql: `SELECT * FROM "ScheduleBlock" WHERE start >= ? AND start <= ? ORDER BY start ASC`,
      args: [now.toISOString(), until.toISOString()],
    });

    const result = res.rows.map((b) => ({
      id: b.id,
      title: b.title,
      category: b.category,
      start: format(new Date(b.start as string), "yyyy-MM-dd HH:mm"),
      end: format(new Date(b.end as string), "yyyy-MM-dd HH:mm"),
      allDay: Boolean(b.allDay),
      notes: b.notes,
    }));

    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "get_recurring_blocks",
  "Get all recurring schedule blocks (e.g. Work 9-5, Commute)",
  {},
  async () => {
    const res = await db.execute(`SELECT * FROM "RecurringBlock" ORDER BY createdAt ASC`);
    const result = res.rows.map((b) => ({
      id: b.id,
      title: b.title,
      category: b.category,
      startTime: b.startTime,
      endTime: b.endTime,
      daysOfWeek: JSON.parse(b.daysOfWeek as string),
      endsOn: b.endsOn,
      notes: b.notes,
    }));
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "create_recurring_block",
  "Create a recurring weekly event (e.g. Work Mon-Fri 9am-5pm, Commute 8-9am)",
  {
    title: z.string().describe("Event title e.g. 'Work', 'Commute to office'"),
    category: z.enum(["GYM", "LEARNING", "SLEEP", "WORK", "COMMUTE", "PERSONAL"]),
    startTime: z.string().describe("Start time in HH:MM format e.g. '09:00'"),
    endTime: z.string().describe("End time in HH:MM format e.g. '17:00'"),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).describe("Days of week: 0=Sun, 1=Mon, ..., 6=Sat"),
    endsOn: z.string().optional().describe("Optional end date ISO string"),
    notes: z.string().optional(),
  },
  async ({ title, category, startTime, endTime, daysOfWeek, endsOn, notes }) => {
    const CATEGORY_COLORS: Record<string, string> = {
      GYM: "#3b82f6", LEARNING: "#a855f7", SLEEP: "#64748b",
      WORK: "#0ea5e9", COMMUTE: "#f59e0b", PERSONAL: "#ec4899",
    };
    const isoNow = new Date().toISOString();
    const id = uid();
    await db.execute({
      sql: `INSERT INTO "RecurringBlock" (id, title, category, color, startTime, endTime, daysOfWeek, endsOn, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, title, category, CATEGORY_COLORS[category] ?? "#6366f1", startTime, endTime, JSON.stringify(daysOfWeek), endsOn ?? null, notes ?? null, isoNow, isoNow],
    });
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayStr = daysOfWeek.map((d) => DAY_NAMES[d]).join(", ");
    return { content: [{ type: "text" as const, text: `Created recurring block "${title}" (${startTime}–${endTime}) on ${dayStr}.` }] };
  }
);

server.tool(
  "toggle_wfh_day",
  "Mark or unmark a date as a work-from-home day. WFH work events show a 🏠 icon in the calendar.",
  {
    date: z.string().describe("Date in YYYY-MM-DD format"),
    wfh: z.boolean().describe("true = mark as WFH, false = remove WFH marker (office day)"),
  },
  async ({ date, wfh }) => {
    const isoDate = new Date(date + "T00:00:00.000Z").toISOString();
    if (wfh) {
      const existing = await db.execute({ sql: `SELECT id FROM "WorkFromHomeDay" WHERE date = ?`, args: [isoDate] });
      if (existing.rows.length === 0) {
        await db.execute({ sql: `INSERT INTO "WorkFromHomeDay" (id, date) VALUES (?, ?)`, args: [uid(), isoDate] });
      }
      return { content: [{ type: "text" as const, text: `${date} marked as WFH day.` }] };
    } else {
      await db.execute({ sql: `DELETE FROM "WorkFromHomeDay" WHERE date = ?`, args: [isoDate] });
      return { content: [{ type: "text" as const, text: `${date} WFH marker removed (office day).` }] };
    }
  }
);

// ─── CAREER / JOB APPLICATIONS ───────────────────────────────────────────────

server.tool(
  "get_applications",
  "Get all job applications. Optionally filter to active only (excludes REJECTED and GHOSTED).",
  {
    activeOnly: z.boolean().optional().describe("If true, only return active applications (not rejected/ghosted). Defaults to false."),
  },
  async ({ activeOnly }) => {
    const sql = activeOnly
      ? `SELECT * FROM "JobApplication" WHERE stage NOT IN ('REJECTED','GHOSTED') ORDER BY updatedAt DESC`
      : `SELECT * FROM "JobApplication" ORDER BY updatedAt DESC`;
    const result = await db.execute(sql);
    const apps = result.rows.map((r) => ({
      id: r.id, firm: r.firm, role: r.role, stage: r.stage,
      appliedDate: r.appliedDate, lastAction: r.lastAction, nextAction: r.nextAction,
      prepNeeded: r.prepNeeded === 1, prepNotes: r.prepNotes, notes: r.notes,
    }));
    const summary = apps.map((a) =>
      `${a.firm}${a.role ? ` (${a.role})` : ""} — ${a.stage}${a.nextAction ? ` | Next: ${a.nextAction}` : ""}${a.prepNeeded ? " ⚠️ PREP NEEDED" : ""}`
    ).join("\n");
    return { content: [{ type: "text" as const, text: apps.length === 0 ? "No applications found." : `${apps.length} application(s):\n\n${summary}` }] };
  }
);

server.tool(
  "add_application",
  "Add a new job application to the career pipeline.",
  {
    firm:        z.string().describe("Company name e.g. 'B2C2'"),
    role:        z.string().optional().describe("Role title e.g. 'Quant Developer'"),
    stage:       z.enum(["APPLIED","SCREEN","TECHNICAL","FINAL","OFFER","REJECTED","GHOSTED"]).optional().describe("Current stage, defaults to APPLIED"),
    appliedDate: z.string().optional().describe("Date applied in YYYY-MM-DD format"),
    lastAction:  z.string().optional().describe("Description of last action taken"),
    nextAction:  z.string().optional().describe("Description of next action needed"),
    prepNeeded:  z.boolean().optional().describe("Whether prep is needed for next stage"),
    prepNotes:   z.string().optional().describe("What specifically to prepare"),
    notes:       z.string().optional().describe("General notes about this application"),
  },
  async ({ firm, role, stage, appliedDate, lastAction, nextAction, prepNeeded, prepNotes, notes }) => {
    const isoNow = new Date().toISOString();
    const id = uid();
    const isoApplied = appliedDate ? new Date(appliedDate + "T00:00:00.000Z").toISOString() : null;
    await db.execute({
      sql: `INSERT INTO "JobApplication" (id, firm, role, stage, appliedDate, lastAction, nextAction, prepNeeded, prepNotes, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, firm, role ?? null, stage ?? "APPLIED", isoApplied, lastAction ?? null, nextAction ?? null, prepNeeded ? 1 : 0, prepNotes ?? null, notes ?? null, isoNow, isoNow],
    });
    await regenerateTrackerMd();
    return { content: [{ type: "text" as const, text: `Added ${firm}${role ? ` — ${role}` : ""} at stage ${stage ?? "APPLIED"}. tracker.md updated.` }] };
  }
);

server.tool(
  "update_application",
  "Update an existing job application — change stage, log an action, set next steps, flag prep needed.",
  {
    firm:       z.string().describe("Firm name to identify the application (partial match, case-insensitive)"),
    stage:      z.enum(["APPLIED","SCREEN","TECHNICAL","FINAL","OFFER","REJECTED","GHOSTED"]).optional(),
    lastAction: z.string().optional().describe("What just happened e.g. 'HackerRank completed 2026-04-21'"),
    nextAction: z.string().optional().describe("What needs to happen next"),
    prepNeeded: z.boolean().optional(),
    prepNotes:  z.string().optional(),
    notes:      z.string().optional(),
  },
  async ({ firm, stage, lastAction, nextAction, prepNeeded, prepNotes, notes }) => {
    const existing = await db.execute({
      sql: `SELECT id, firm, role FROM "JobApplication" WHERE firm LIKE ? ORDER BY updatedAt DESC LIMIT 1`,
      args: [`%${firm}%`],
    });
    if (existing.rows.length === 0) {
      return { content: [{ type: "text" as const, text: `No application found matching "${firm}". Use add_application to create it.` }] };
    }
    const app = existing.rows[0];
    const isoNow = new Date().toISOString();
    const updates: string[] = ["updatedAt = ?"];
    const args: InValue[] = [isoNow];
    if (stage      !== undefined) { updates.push("stage = ?");      args.push(stage); }
    if (lastAction !== undefined) { updates.push("lastAction = ?"); args.push(lastAction); }
    if (nextAction !== undefined) { updates.push("nextAction = ?"); args.push(nextAction); }
    if (prepNeeded !== undefined) { updates.push("prepNeeded = ?"); args.push(prepNeeded ? 1 : 0); }
    if (prepNotes  !== undefined) { updates.push("prepNotes = ?");  args.push(prepNotes ?? null); }
    if (notes      !== undefined) { updates.push("notes = ?");      args.push(notes ?? null); }
    args.push(app.id as string);
    await db.execute({ sql: `UPDATE "JobApplication" SET ${updates.join(", ")} WHERE id = ?`, args });
    await regenerateTrackerMd();
    return { content: [{ type: "text" as const, text: `Updated ${app.firm}${app.role ? ` (${app.role})` : ""}${stage ? ` → ${stage}` : ""}. tracker.md updated.` }] };
  }
);

// ─── LEETCODE ─────────────────────────────────────────────────────────────────

const PROGRESS_MD_PATH = path.join(process.env.HOME ?? "~", "leetcode", "PROGRESS.md");
const PRESERVE_MARKER = "<!-- DB_GENERATED_BELOW -->";

async function regenerateProgressMd(): Promise<void> {
  try {
    const result = await db.execute(`SELECT * FROM "LeetCodeProblem" ORDER BY date ASC`);
    const problems = result.rows;
    const total = problems.length;
    const patterns = [...new Set(problems.map((p) => p.pattern).filter(Boolean))];
    const confProblems = problems.filter((p) => p.confidence);
    const avgConf = confProblems.length > 0
      ? (confProblems.reduce((s, p) => s + (p.confidence as number), 0) / confProblems.length).toFixed(1)
      : "—";
    const lastDate = problems.length > 0 ? (problems[problems.length - 1].date as string).slice(0, 10) : "—";
    const today = format(new Date(), "yyyy-MM-dd");

    let header = "";
    if (fs.existsSync(PROGRESS_MD_PATH)) {
      const existing = fs.readFileSync(PROGRESS_MD_PATH, "utf-8");
      const markerIdx = existing.indexOf(PRESERVE_MARKER);
      header = markerIdx !== -1 ? existing.slice(0, markerIdx).trimEnd() : existing.trimEnd();
    }

    const lines: string[] = ["", PRESERVE_MARKER, "",
      `# Problems Log — Last updated: ${today}`, "",
      "## Summary",
      `- **Total problems logged:** ${total}`,
      `- **Patterns covered:** ${patterns.length > 0 ? patterns.join(", ") : "none yet"}`,
      `- **Average confidence:** ${avgConf}/10`,
      `- **Last session:** ${lastDate}`,
      "", "---", "",
    ];

    const byDate = new Map<string, typeof problems>();
    for (const p of problems) {
      const key = (p.date as string).slice(0, 10);
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(p);
    }

    for (const [date, dayProblems] of byDate) {
      lines.push(`### ${date}`);
      for (const p of dayProblems) {
        const num   = p.number     ? ` (#${p.number})`          : "";
        const diff  = p.difficulty ? ` [${p.difficulty}]`       : "";
        const pat   = p.pattern    ? ` — ${p.pattern}`          : "";
        const conf  = p.confidence ? ` — Confidence: ${p.confidence}/10` : "";
        const emoji = p.approach === "Recalled" ? "🟢" : p.approach === "Reasoned" ? "🟡" : p.approach === "Needed hints" ? "🔴" : "";
        lines.push(`- [x] **${p.name}**${num}${diff}${pat}${conf}`);
        const meta = [p.approach ? `${emoji} ${p.approach}` : null, p.timeMins ? `Time: ${p.timeMins} min` : null].filter(Boolean).join(" | ");
        if (meta) lines.push(`  - ${meta}`);
        if (p.notes) lines.push(`  - Notes: ${p.notes}`);
      }
      lines.push("");
    }

    if (problems.length === 0) { lines.push("_No problems logged yet._", ""); }

    fs.writeFileSync(PROGRESS_MD_PATH, (header ? header + "\n" : "") + lines.join("\n"), "utf-8");
  } catch (e) {
    console.error("Failed to regenerate PROGRESS.md:", e);
  }
}

server.tool(
  "get_leetcode_problems",
  "Get logged LeetCode problems. Optionally filter by recency in days (default 30).",
  { days: z.number().int().optional().describe("Look back N days. Omit for all problems.") },
  async ({ days }) => {
    const sql = days
      ? `SELECT * FROM "LeetCodeProblem" WHERE date >= ? ORDER BY date DESC`
      : `SELECT * FROM "LeetCodeProblem" ORDER BY date DESC`;
    const args = days ? [subDays(new Date(), days).toISOString()] : [];
    const result = await db.execute({ sql, args });
    const problems = result.rows;
    if (problems.length === 0) return { content: [{ type: "text" as const, text: "No problems logged yet." }] };
    const lines = problems.map((p) =>
      `${(p.date as string).slice(0, 10)}: ${p.name}${p.number ? ` #${p.number}` : ""}${p.pattern ? ` [${p.pattern}]` : ""}${p.confidence ? ` conf ${p.confidence}/10` : ""}${p.approach ? ` — ${p.approach}` : ""}`
    );
    return { content: [{ type: "text" as const, text: `${problems.length} problem(s):\n\n${lines.join("\n")}` }] };
  }
);

server.tool(
  "log_leetcode_problem",
  "Log a completed LeetCode problem with pattern, confidence, and approach.",
  {
    name:       z.string().describe("Problem name e.g. 'Two Sum'"),
    number:     z.number().int().optional().describe("LeetCode problem number e.g. 1"),
    pattern:    z.enum(["Two Pointers","Sliding Window","Hashmap","Binary Search","Trees BFS","Trees DFS","Stack","Queue","Linked List","Dynamic Programming","Greedy","Other"]).optional(),
    difficulty: z.enum(["Easy","Medium","Hard"]).optional(),
    timeMins:   z.number().int().optional().describe("How long it took in minutes"),
    approach:   z.enum(["Recalled","Reasoned","Needed hints"]).optional(),
    confidence: z.number().int().min(1).max(10).optional().describe("Honest confidence score 1-10"),
    notes:      z.string().optional().describe("What tripped you up, what clicked"),
    date:       z.string().optional().describe("Date in YYYY-MM-DD, defaults to today"),
  },
  async ({ name, number, pattern, difficulty, timeMins, approach, confidence, notes, date }) => {
    const isoNow = new Date().toISOString();
    const isoDate = date ? new Date(date + "T12:00:00.000Z").toISOString() : isoNow;
    const id = uid();
    await db.execute({
      sql: `INSERT INTO "LeetCodeProblem" (id, date, name, number, pattern, difficulty, timeMins, approach, confidence, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, isoDate, name, number ?? null, pattern ?? null, difficulty ?? null, timeMins ?? null, approach ?? null, confidence ?? null, notes ?? null, isoNow, isoNow],
    });
    await regenerateProgressMd();
    const confStr = confidence ? ` Confidence: ${confidence}/10.` : "";
    const approachStr = approach ? ` Approach: ${approach}.` : "";
    return { content: [{ type: "text" as const, text: `Logged "${name}"${number ? ` #${number}` : ""}${pattern ? ` [${pattern}]` : ""}.${approachStr}${confStr} PROGRESS.md updated.` }] };
  }
);

// ─── MACRO LEARNING ───────────────────────────────────────────────────────────

const MACRO_PROGRESS_PATH = path.join(process.env.HOME ?? "~", "macro learning", "progress.md");

const MACRO_TRACK_NAMES: Record<number, string> = {
  1: "Options Pricing Theory & Practice",
  2: "Futures Contracts",
  3: "Volatility Modelling",
  4: "Index-Based Quant Strategies",
  5: "Behavioural / Narrative",
};
const MACRO_LEVEL_EMOJI: Record<string, string> = { recall: "🔵", application: "🟢", shaky: "🟠" };

async function regenerateMacroProgress(): Promise<void> {
  try {
    const result = await db.execute(`SELECT * FROM "MacroTopic" ORDER BY track ASC, coveredAt ASC`);
    const topics = result.rows;
    const today = format(new Date(), "yyyy-MM-dd");
    const appCount   = topics.filter((t) => t.level === "application").length;
    const shakyCount = topics.filter((t) => t.level === "shaky").length;

    const lines: string[] = [
      `# Macro Learning Progress — Last updated: ${today}`, "",
      "**Level key:** 🔵 Recall — 🟢 Application — 🟠 Shaky (needs revisiting)", "", "---", "",
    ];

    const byTrack = new Map<number, typeof topics>();
    for (const t of topics) {
      const tr = (t.track as number) ?? 0;
      if (!byTrack.has(tr)) byTrack.set(tr, []);
      byTrack.get(tr)!.push(t);
    }

    for (const trackNum of [1, 2, 3, 4, 5]) {
      const trackTopics = byTrack.get(trackNum) ?? [];
      lines.push(`## Track ${trackNum} — ${MACRO_TRACK_NAMES[trackNum]}`, "");
      if (trackTopics.length === 0) {
        lines.push("- *Not started*");
      } else {
        for (const t of trackTopics) {
          const emoji = MACRO_LEVEL_EMOJI[t.level as string] ?? "🔵";
          const noteStr = t.notes ? ` — ${t.notes}` : "";
          lines.push(`- ${emoji} **${t.topic}** (${(t.coveredAt as string).slice(0, 10)})${noteStr}`);
        }
      }
      lines.push("");
    }

    lines.push("---", "", `**${topics.length} topics covered** — ${appCount} at application level, ${shakyCount} flagged shaky`, "");
    fs.writeFileSync(MACRO_PROGRESS_PATH, lines.join("\n"), "utf-8");
  } catch (e) {
    console.error("Failed to regenerate macro progress.md:", e);
  }
}

server.tool(
  "get_macro_topics",
  "Get all logged macro learning topics, optionally filtered by level or track.",
  {
    level: z.enum(["recall", "application", "shaky"]).optional().describe("Filter by level"),
    track: z.number().int().min(1).max(5).optional().describe("Filter by track (1=Options, 2=Futures, 3=Vol, 4=Index, 5=Narrative)"),
  },
  async ({ level, track }) => {
    let sql = `SELECT * FROM "MacroTopic" WHERE 1=1`;
    const args: InValue[] = [];
    if (level) { sql += ` AND level = ?`; args.push(level); }
    if (track) { sql += ` AND track = ?`; args.push(track); }
    sql += ` ORDER BY track ASC, coveredAt ASC`;
    const result = await db.execute({ sql, args });
    const topics = result.rows;
    if (topics.length === 0) return { content: [{ type: "text" as const, text: "No topics logged yet." }] };
    const lines = topics.map((t) =>
      `[Track ${t.track ?? "?"}] ${MACRO_LEVEL_EMOJI[t.level as string] ?? "🔵"} ${t.topic} (${(t.coveredAt as string).slice(0, 10)})${t.notes ? ` — ${t.notes}` : ""}`
    );
    const shaky = topics.filter((t) => t.level === "shaky");
    let summary = `${topics.length} topic(s):\n\n${lines.join("\n")}`;
    if (shaky.length > 0) summary += `\n\n⚠️ Shaky — needs revisiting: ${shaky.map((t) => t.topic).join(", ")}`;
    return { content: [{ type: "text" as const, text: summary }] };
  }
);

server.tool(
  "log_macro_topic",
  "Log a covered macro finance topic with level and notes. Updates progress.md automatically.",
  {
    topic:     z.string().describe("Topic name e.g. 'Black-Scholes assumptions & formula'"),
    track:     z.number().int().min(1).max(5).optional().describe("Curriculum track: 1=Options, 2=Futures, 3=Vol Modelling, 4=Index Strategies, 5=Narrative"),
    level:     z.enum(["recall", "application", "shaky"]).optional().describe("Depth reached — recall (knows it), application (can use it), shaky (covered but not retained). Defaults to recall."),
    notes:     z.string().optional().describe("One-line summary of what was covered"),
    coveredAt: z.string().optional().describe("Date in YYYY-MM-DD, defaults to today"),
  },
  async ({ topic, track, level, notes, coveredAt }) => {
    const isoNow = new Date().toISOString();
    const isoDate = coveredAt ? new Date(coveredAt + "T12:00:00.000Z").toISOString() : isoNow;
    const id = uid();
    await db.execute({
      sql: `INSERT INTO "MacroTopic" (id, topic, track, level, coveredAt, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, topic, track ?? null, level ?? "recall", isoDate, notes ?? null, isoNow, isoNow],
    });
    await regenerateMacroProgress();
    const trackStr = track ? ` [Track ${track} — ${MACRO_TRACK_NAMES[track]}]` : "";
    const levelStr = level ?? "recall";
    return { content: [{ type: "text" as const, text: `Logged "${topic}"${trackStr} at ${MACRO_LEVEL_EMOJI[levelStr]} ${levelStr} level. progress.md updated.` }] };
  }
);

server.tool(
  "update_macro_topic",
  "Update the level of an existing macro topic (e.g. promote from recall to application, or flag as shaky).",
  {
    topic: z.string().describe("Topic name to find (partial match, case-insensitive)"),
    level: z.enum(["recall", "application", "shaky"]).describe("New level"),
    notes: z.string().optional().describe("Updated notes"),
  },
  async ({ topic, level, notes }) => {
    const existing = await db.execute({
      sql: `SELECT id, topic FROM "MacroTopic" WHERE topic LIKE ? ORDER BY coveredAt DESC LIMIT 1`,
      args: [`%${topic}%`],
    });
    if (existing.rows.length === 0) {
      return { content: [{ type: "text" as const, text: `No topic found matching "${topic}". Use log_macro_topic to create it.` }] };
    }
    const row = existing.rows[0];
    const isoNow = new Date().toISOString();
    const updates = ["level = ?", "updatedAt = ?"];
    const args: InValue[] = [level, isoNow];
    if (notes !== undefined) { updates.push("notes = ?"); args.push(notes ?? null); }
    args.push(row.id as string);
    await db.execute({ sql: `UPDATE "MacroTopic" SET ${updates.join(", ")} WHERE id = ?`, args });
    await regenerateMacroProgress();
    return { content: [{ type: "text" as const, text: `Updated "${row.topic}" → ${MACRO_LEVEL_EMOJI[level]} ${level}. progress.md updated.` }] };
  }
);

// ─── GOOGLE CALENDAR ──────────────────────────────────────────────────────────

function getGCalClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: "v3", auth: oauth2 });
}

const GCAL_DAY_NAMES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function buildRRule(daysOfWeek: number[], endsOn?: string | null): string {
  const byDay = daysOfWeek.map((d) => GCAL_DAY_NAMES[d]).join(",");
  let rule = `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`;
  if (endsOn) {
    const until = new Date(endsOn).toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
    rule += `;UNTIL=${until}`;
  }
  return rule;
}

/** Find the next (or today's) date matching one of the given days, combined with a HH:MM time. */
function nextOccurrenceISO(daysOfWeek: number[], timeStr: string): string {
  const now = new Date();
  const todayDow = now.getDay();
  const sorted = [...daysOfWeek].sort((a, b) => a - b);
  const targetDow = sorted.find((d) => d >= todayDow) ?? sorted[0];
  const daysAhead = ((targetDow - todayDow) + 7) % 7;
  const date = new Date(now);
  date.setDate(date.getDate() + daysAhead);
  const [hh, mm] = timeStr.split(":").map(Number);
  date.setHours(hh, mm, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hh)}:${pad(mm)}:00`;
}

server.tool(
  "list_google_calendar_events",
  "List upcoming Google Calendar events. Defaults to the next 7 days.",
  {
    from: z.string().optional().describe("Start date YYYY-MM-DD (default: today)"),
    to: z.string().optional().describe("End date YYYY-MM-DD (default: 7 days from now)"),
    maxResults: z.number().int().optional().default(25).describe("Max events to return (default 25)"),
  },
  async ({ from, to, maxResults }) => {
    try {
      const cal = getGCalClient();
      const timeMin = from ? new Date(from).toISOString() : new Date().toISOString();
      const timeMax = to
        ? new Date(to + "T23:59:59").toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const res = await cal.events.list({
        calendarId: "primary",
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: maxResults ?? 25,
      });

      const events = (res.data.items ?? []).map((e) => {
        const allDay = !!e.start?.date;
        return {
          id: e.id,
          title: e.summary ?? "(no title)",
          start: allDay ? e.start?.date : e.start?.dateTime,
          end: allDay ? e.end?.date : e.end?.dateTime,
          allDay,
          location: e.location ?? null,
          description: e.description ?? null,
          recurring: !!e.recurringEventId,
        };
      });

      if (events.length === 0) {
        return { content: [{ type: "text" as const, text: "No events found in that range." }] };
      }

      const lines = events.map((e) =>
        `[${e.id}] ${e.start?.slice(0, 16).replace("T", " ")} — ${e.title}${e.location ? ` @ ${e.location}` : ""}${e.recurring ? " 🔁" : ""}`
      );
      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${String(err)}` }] };
    }
  }
);

server.tool(
  "create_google_calendar_event",
  "Create a one-off Google Calendar event. Use create_recurring_google_calendar_event for weekly repeating events.",
  {
    title: z.string().describe("Event title"),
    start: z.string().describe("Start as ISO datetime (2026-05-01T19:00:00) or date only (2026-05-01) for all-day"),
    end: z.string().describe("End as ISO datetime or date only. For all-day, use the same date or day after."),
    allDay: z.boolean().optional().default(false),
    description: z.string().optional(),
    location: z.string().optional(),
    colorId: z.string().optional().describe("1=lavender 2=sage 3=grape 4=flamingo 5=banana 6=tangerine 7=peacock 8=graphite 9=blueberry 10=basil 11=tomato"),
  },
  async ({ title, start, end, allDay, description, location, colorId }) => {
    try {
      const cal = getGCalClient();
      const res = await cal.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: title,
          description: description || undefined,
          location: location || undefined,
          colorId: colorId || undefined,
          start: allDay ? { date: start.split("T")[0] } : { dateTime: start, timeZone: "Europe/London" },
          end: allDay ? { date: end.split("T")[0] } : { dateTime: end, timeZone: "Europe/London" },
        },
      });
      const ev = res.data;
      const startStr = ev.start?.dateTime ?? ev.start?.date ?? start;
      return { content: [{ type: "text" as const, text: `Created "${title}" on ${startStr.slice(0, 16).replace("T", " ")} (ID: ${ev.id})` }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${String(err)}` }] };
    }
  }
);

server.tool(
  "create_recurring_google_calendar_event",
  "Create a weekly recurring Google Calendar event — gym sessions, work blocks, routines, etc.",
  {
    title: z.string().describe("Event title e.g. 'Morning gym', 'MCL stretching'"),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).describe("Days to repeat: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat"),
    startTime: z.string().describe("Start time HH:MM e.g. '07:00'"),
    endTime: z.string().describe("End time HH:MM e.g. '08:00'"),
    description: z.string().optional(),
    location: z.string().optional(),
    endsOn: z.string().optional().describe("Date to stop recurring YYYY-MM-DD. Omit for indefinite."),
    colorId: z.string().optional().describe("1=lavender 2=sage 3=grape 4=flamingo 5=banana 6=tangerine 7=peacock 8=graphite 9=blueberry 10=basil 11=tomato"),
  },
  async ({ title, daysOfWeek, startTime, endTime, description, location, endsOn, colorId }) => {
    if (daysOfWeek.length === 0) {
      return { content: [{ type: "text" as const, text: "Error: daysOfWeek must not be empty." }] };
    }
    try {
      const cal = getGCalClient();
      const startISO = nextOccurrenceISO(daysOfWeek, startTime);
      const endISO = nextOccurrenceISO(daysOfWeek, endTime);
      const rrule = buildRRule(daysOfWeek, endsOn);

      const res = await cal.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: title,
          description: description || undefined,
          location: location || undefined,
          colorId: colorId || undefined,
          recurrence: [rrule],
          start: { dateTime: startISO, timeZone: "Europe/London" },
          end: { dateTime: endISO, timeZone: "Europe/London" },
        },
      });
      const dayStr = daysOfWeek.map((d) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d]).join(", ");
      return { content: [{ type: "text" as const, text: `Created recurring event "${title}" every ${dayStr} ${startTime}–${endTime}${endsOn ? ` until ${endsOn}` : ""}. ID: ${res.data.id}` }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${String(err)}` }] };
    }
  }
);

server.tool(
  "update_google_calendar_event",
  "Update an existing Google Calendar event — change title, time, description, location, or colour. Use list_google_calendar_events to find the event ID.",
  {
    eventId: z.string().describe("Google Calendar event ID"),
    title: z.string().optional().describe("New title"),
    start: z.string().optional().describe("New start ISO datetime or date"),
    end: z.string().optional().describe("New end ISO datetime or date"),
    allDay: z.boolean().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    colorId: z.string().optional().describe("1=lavender 2=sage 3=grape 4=flamingo 5=banana 6=tangerine 7=peacock 8=graphite 9=blueberry 10=basil 11=tomato"),
  },
  async ({ eventId, title, start, end, allDay, description, location, colorId }) => {
    try {
      const cal = getGCalClient();
      const patch: Record<string, unknown> = {};
      if (title !== undefined) patch.summary = title;
      if (description !== undefined) patch.description = description;
      if (location !== undefined) patch.location = location;
      if (colorId !== undefined) patch.colorId = colorId;
      if (start !== undefined) {
        patch.start = allDay ? { date: start.split("T")[0] } : { dateTime: start, timeZone: "Europe/London" };
      }
      if (end !== undefined) {
        patch.end = allDay ? { date: end.split("T")[0] } : { dateTime: end, timeZone: "Europe/London" };
      }
      await cal.events.patch({ calendarId: "primary", eventId, requestBody: patch });
      return { content: [{ type: "text" as const, text: `Updated event ${eventId}${title ? ` — now titled "${title}"` : ""}` }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${String(err)}` }] };
    }
  }
);

server.tool(
  "delete_google_calendar_event",
  "Delete a Google Calendar event by ID. Use list_google_calendar_events to find the ID first.",
  {
    eventId: z.string().describe("Google Calendar event ID to delete"),
  },
  async ({ eventId }) => {
    try {
      const cal = getGCalClient();
      await cal.events.delete({ calendarId: "primary", eventId });
      return { content: [{ type: "text" as const, text: `Deleted event ${eventId}` }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${String(err)}` }] };
    }
  }
);

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
