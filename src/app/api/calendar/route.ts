import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, getDay } from "date-fns";

// Generates virtual calendar event objects from weekly schedule templates
// for every date in the [from, to] range.
function generateScheduleEvents(
  from: Date,
  to: Date,
  workoutPlans: { id: string; name: string; scheduledDays: string }[],
  mealPlanEntries: {
    dayOfWeek: number;
    mealType: string;
    description: string | null;
    recipe: { name: string; calories: number | null } | null;
  }[]
) {
  const virtualEvents = [];
  let cursor = startOfDay(from);
  const end = startOfDay(to);

  while (cursor <= end) {
    const dow = getDay(cursor); // 0=Sun...6=Sat

    // Workout plans scheduled on this day
    for (const plan of workoutPlans) {
      let days: number[] = [];
      try { days = JSON.parse(plan.scheduledDays); } catch { days = []; }
      if (days.includes(dow)) {
        virtualEvents.push({
          id: `wp-${plan.id}-${cursor.toISOString()}`,
          title: `💪 ${plan.name}`,
          start: cursor.toISOString(),
          end: cursor.toISOString(),
          allDay: true,
          area: "EXERCISE",
          color: "#3b82f6",
          description: "Scheduled workout",
          virtual: true,
        });
      }
    }

    // Meal plan entries for this day
    const dayEntries = mealPlanEntries.filter((e) => e.dayOfWeek === dow);
    for (const entry of dayEntries) {
      const label = entry.recipe?.name ?? entry.description ?? "Planned meal";
      const mealEmoji: Record<string, string> = {
        breakfast: "🌅", lunch: "☀️", dinner: "🍽️", snack: "🍎",
      };
      const kcal = entry.recipe?.calories ? ` · ${entry.recipe.calories} kcal` : "";
      virtualEvents.push({
        id: `mp-${entry.dayOfWeek}-${entry.mealType}-${cursor.toISOString()}`,
        title: `${mealEmoji[entry.mealType] ?? "🍴"} ${entry.mealType}: ${label}${kcal}`,
        start: cursor.toISOString(),
        end: cursor.toISOString(),
        allDay: true,
        area: "DIET",
        color: "#16a34a",
        description: `Meal plan: ${entry.mealType}`,
        virtual: true,
      });
    }

    cursor = addDays(cursor, 1);
  }

  return virtualEvents;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  const where =
    fromStr && toStr
      ? {
          start: { gte: new Date(fromStr) },
          end: { lte: new Date(toStr) },
        }
      : {};

  const [storedEvents, workoutPlans, mealPlanEntries] = await Promise.all([
    prisma.calendarEvent.findMany({ where, orderBy: { start: "asc" } }),
    prisma.workoutPlan.findMany({ select: { id: true, name: true, scheduledDays: true } }),
    prisma.mealPlanEntry.findMany({
      include: { recipe: { select: { name: true, calories: true } } },
    }),
  ]);

  const virtualEvents =
    fromStr && toStr
      ? generateScheduleEvents(new Date(fromStr), new Date(toStr), workoutPlans, mealPlanEntries)
      : [];

  return NextResponse.json([...storedEvents, ...virtualEvents]);
}
