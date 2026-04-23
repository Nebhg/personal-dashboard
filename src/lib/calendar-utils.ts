import { addDays, startOfDay, getDay, format } from "date-fns";
import { type CalendarEventDTO } from "@/types";

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🍽️",
  snack: "🍎",
};

// Default start/end times for meal types (HH:MM)
const MEAL_TIMES: Record<string, { start: string; end: string }> = {
  breakfast: { start: "08:00", end: "09:00" },
  lunch:     { start: "12:00", end: "13:00" },
  dinner:    { start: "19:00", end: "20:00" },
  snack:     { start: "15:00", end: "15:30" },
};

/** Build a Date from a date-only Date + "HH:MM" time string */
function applyTime(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

export function generateScheduleEvents(
  from: Date,
  to: Date,
  workoutPlans: { id: string; name: string; scheduledDays: string; scheduledTime?: string | null }[],
  mealPlanEntries: {
    dayOfWeek: number;
    mealType: string;
    description: string | null;
    recipe: { name: string; calories: number | null } | null;
  }[],
  recurringBlocks: {
    id: string;
    title: string;
    category: string;
    color: string | null;
    startTime: string;
    endTime: string;
    daysOfWeek: string;
    endsOn: Date | null;
    notes: string | null;
  }[] = [],
  wfhDates: Set<string> = new Set()
): CalendarEventDTO[] {
  const virtualEvents: CalendarEventDTO[] = [];

  let cursor = startOfDay(from);
  const end = startOfDay(to);

  while (cursor <= end) {
    const dow = getDay(cursor); // 0=Sun
    const dateKey = format(cursor, "yyyy-MM-dd");

    // ── Workout plans ──────────────────────────────────────────────
    for (const plan of workoutPlans) {
      let days: number[] = [];
      try { days = JSON.parse(plan.scheduledDays); } catch { days = []; }
      if (days.includes(dow)) {
        const startTime = plan.scheduledTime ?? "07:00";
        const [sh, sm] = startTime.split(":").map(Number);
        const startDt = new Date(cursor);
        startDt.setHours(sh, sm, 0, 0);
        const endDt = new Date(startDt.getTime() + 60 * 60 * 1000); // +1 hour

        virtualEvents.push({
          id: `wp-${plan.id}-${cursor.toISOString()}`,
          title: `💪 ${plan.name}`,
          start: startDt.toISOString(),
          end: endDt.toISOString(),
          allDay: false,
          area: "EXERCISE",
          color: "#3b82f6",
          description: "Scheduled workout",
          isRecurring: true,
        });
      }
    }

    // ── Meal plan entries ──────────────────────────────────────────
    for (const entry of mealPlanEntries.filter((e) => e.dayOfWeek === dow)) {
      const label = entry.recipe?.name ?? entry.description ?? "Planned meal";
      const kcal = entry.recipe?.calories ? ` · ${entry.recipe.calories} kcal` : "";
      const times = MEAL_TIMES[entry.mealType] ?? MEAL_TIMES.snack;
      const startDt = applyTime(cursor, times.start);
      const endDt = applyTime(cursor, times.end);

      virtualEvents.push({
        id: `mp-${entry.dayOfWeek}-${entry.mealType}-${cursor.toISOString()}`,
        title: `${MEAL_EMOJI[entry.mealType] ?? "🍴"} ${entry.mealType}: ${label}${kcal}`,
        start: startDt.toISOString(),
        end: endDt.toISOString(),
        allDay: false,
        area: "DIET",
        color: "#16a34a",
        description: `Meal plan: ${entry.mealType}`,
        isRecurring: true,
      });
    }

    // ── Recurring blocks ───────────────────────────────────────────
    for (const block of recurringBlocks) {
      let days: number[] = [];
      try { days = JSON.parse(block.daysOfWeek); } catch { days = []; }
      if (!days.includes(dow)) continue;
      if (block.endsOn && cursor > block.endsOn) continue;

      const startDt = applyTime(cursor, block.startTime);
      const endDt = applyTime(cursor, block.endTime);
      const isWFH = block.category === "WORK" && wfhDates.has(dateKey);

      virtualEvents.push({
        id: `rb-${block.id}-${cursor.toISOString()}`,
        title: isWFH ? `🏠 ${block.title}` : block.title,
        start: startDt.toISOString(),
        end: endDt.toISOString(),
        allDay: false,
        area: "SCHEDULE",
        color: block.color ?? "#6366f1",
        description: block.notes ?? null,
        isRecurring: true,
        isWFH,
      });
    }

    cursor = addDays(cursor, 1);
  }

  return virtualEvents;
}
