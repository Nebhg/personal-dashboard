export type TrackingArea = "DIET" | "EXERCISE" | "LEARNING" | "HABITS";

export type CalendarEventDTO = {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay: boolean;
  area: TrackingArea;
  color: string | null;
  description: string | null;
};

export const AREA_COLORS: Record<TrackingArea, string> = {
  DIET: "#22c55e",
  EXERCISE: "#3b82f6",
  LEARNING: "#a855f7",
  HABITS: "#f97316",
};

export const AREA_LABELS: Record<TrackingArea, string> = {
  DIET: "Diet",
  EXERCISE: "Exercise",
  LEARNING: "Learning",
  HABITS: "Habits",
};
