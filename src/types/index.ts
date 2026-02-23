export type TrackingArea = "DIET" | "EXERCISE" | "LEARNING" | "HABITS" | "SCHEDULE";

export type CalendarEventDTO = {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay: boolean;
  area: string;
  color: string | null;
  description: string | null;
};

export const AREA_COLORS: Record<string, string> = {
  DIET: "#22c55e",
  EXERCISE: "#3b82f6",
  LEARNING: "#a855f7",
  HABITS: "#f97316",
  SCHEDULE: "#6366f1",
};

export const AREA_LABELS: Record<string, string> = {
  DIET: "Diet",
  EXERCISE: "Exercise",
  LEARNING: "Learning",
  HABITS: "Habits",
  SCHEDULE: "Schedule",
};

export const SCHEDULE_CATEGORIES: Record<string, { label: string; color: string }> = {
  GYM:      { label: "Gym",      color: "#3b82f6" },
  LEARNING: { label: "Learning", color: "#a855f7" },
  SLEEP:    { label: "Sleep",    color: "#64748b" },
  WORK:     { label: "Work",     color: "#0ea5e9" },
  COMMUTE:  { label: "Commute",  color: "#f59e0b" },
  PERSONAL: { label: "Personal", color: "#ec4899" },
};
