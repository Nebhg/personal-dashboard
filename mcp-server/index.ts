import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@libsql/client";
import { startOfDay, subDays, format } from "date-fns";
import { randomUUID } from "crypto";

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
