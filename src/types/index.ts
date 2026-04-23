export type TrackingArea = "DIET" | "EXERCISE" | "LEARNING" | "HABITS" | "SCHEDULE";

export type ApplicationStage =
  | "APPLIED"
  | "SCREEN"
  | "TECHNICAL"
  | "FINAL"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED:   "Applied",
  SCREEN:    "Talent Screen",
  TECHNICAL: "Technical",
  FINAL:     "Final Round",
  OFFER:     "Offer",
  REJECTED:  "Rejected",
  GHOSTED:   "Ghosted",
};

export const STAGE_COLORS: Record<ApplicationStage, string> = {
  APPLIED:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
  SCREEN:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  TECHNICAL: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  FINAL:     "bg-orange-500/15 text-orange-400 border-orange-500/30",
  OFFER:     "bg-green-500/15 text-green-400 border-green-500/30",
  REJECTED:  "bg-red-500/15 text-red-400 border-red-500/30",
  GHOSTED:   "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export type CalendarEventDTO = {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay: boolean;
  area: string;
  color: string | null;
  description: string | null;
  isWFH?: boolean;       // WORK-category recurring events on WFH days
  isRecurring?: boolean; // generated from RecurringBlock
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
