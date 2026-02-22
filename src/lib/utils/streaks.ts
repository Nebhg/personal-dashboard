import { startOfDay, subDays, isSameDay } from "date-fns";

export function calculateStreak(
  logs: { date: Date; kept: boolean }[]
): number {
  const kept = logs
    .filter((l) => l.kept)
    .map((l) => startOfDay(new Date(l.date)))
    .sort((a, b) => b.getTime() - a.getTime());

  if (kept.length === 0) return 0;

  let streak = 0;
  let check = startOfDay(new Date());

  // Allow today or yesterday as start of streak
  if (!isSameDay(kept[0], check) && !isSameDay(kept[0], subDays(check, 1))) {
    return 0;
  }
  if (isSameDay(kept[0], check)) {
    streak = 1;
    check = subDays(check, 1);
    for (let i = 1; i < kept.length; i++) {
      if (isSameDay(kept[i], check)) {
        streak++;
        check = subDays(check, 1);
      } else {
        break;
      }
    }
  } else {
    // starts yesterday
    check = kept[0];
    for (let i = 0; i < kept.length; i++) {
      if (isSameDay(kept[i], check)) {
        streak++;
        check = subDays(check, 1);
      } else {
        break;
      }
    }
  }

  return streak;
}
