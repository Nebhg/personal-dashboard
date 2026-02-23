import { addDays, startOfDay, getDay } from "date-fns";

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🍽️",
  snack: "🍎",
};

export function generateScheduleEvents(
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
  const virtualEvents: {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    area: string;
    color: string;
    description: string;
    virtual: boolean;
  }[] = [];

  let cursor = startOfDay(from);
  const end = startOfDay(to);

  while (cursor <= end) {
    const dow = getDay(cursor);

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

    for (const entry of mealPlanEntries.filter((e) => e.dayOfWeek === dow)) {
      const label = entry.recipe?.name ?? entry.description ?? "Planned meal";
      const kcal = entry.recipe?.calories ? ` · ${entry.recipe.calories} kcal` : "";
      virtualEvents.push({
        id: `mp-${entry.dayOfWeek}-${entry.mealType}-${cursor.toISOString()}`,
        title: `${MEAL_EMOJI[entry.mealType] ?? "🍴"} ${entry.mealType}: ${label}${kcal}`,
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
