"use client";

import { startOfDay, subDays, isSameDay, format } from "date-fns";
import { calculateStreak } from "@/lib/utils/streaks";
import { Flame, Trophy } from "lucide-react";

interface HabitLog {
  id: string;
  date: string;
  kept: boolean;
}

interface Habit {
  id: string;
  name: string;
  type: string;
  description: string | null;
  targetDays: number | null;
  logs: HabitLog[];
}

interface Props {
  habits: Habit[];
}

const MILESTONES = [3, 7, 14, 21, 30, 60, 100];

function getBestMilestone(streak: number) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (streak >= MILESTONES[i]) return MILESTONES[i];
  }
  return null;
}

export function HabitStreakTimeline({ habits }: Props) {
  const today = startOfDay(new Date());
  const DAYS = 30;

  // Build array of the last 30 days (oldest first)
  const days = Array.from({ length: DAYS }, (_, i) => subDays(today, DAYS - 1 - i));

  // Month labels: show month name when day is 1st or first in window
  const monthMarkers: Record<number, string> = {};
  days.forEach((d, i) => {
    if (d.getDate() === 1 || i === 0) {
      monthMarkers[i] = format(d, "MMM");
    }
  });

  if (habits.length === 0) return null;

  const sorted = [...habits].sort((a, b) => {
    const sa = calculateStreak(a.logs.map((l) => ({ date: new Date(l.date), kept: l.kept })));
    const sb = calculateStreak(b.logs.map((l) => ({ date: new Date(l.date), kept: l.kept })));
    return sb - sa;
  });

  return (
    <div className="space-y-1">
      {/* Day axis header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-36 shrink-0" />
        <div className="flex-1 flex relative h-4">
          {days.map((_, i) => (
            <div key={i} className="flex-1 relative">
              {monthMarkers[i] && (
                <span className="absolute -top-0 left-0 text-[10px] text-muted-foreground leading-none">
                  {monthMarkers[i]}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="w-14 shrink-0" />
      </div>

      {sorted.map((habit) => {
        const streak = calculateStreak(
          habit.logs.map((l) => ({ date: new Date(l.date), kept: l.kept }))
        );
        const milestone = getBestMilestone(streak);
        const successRate = habit.logs.length > 0
          ? Math.round((habit.logs.filter((l) => l.kept).length / habit.logs.length) * 100)
          : 0;

        return (
          <div key={habit.id} className="flex items-center gap-3 group">
            {/* Habit name */}
            <div className="w-36 shrink-0">
              <p className="text-sm font-medium truncate">{habit.name}</p>
              <p className="text-[10px] text-muted-foreground">{successRate}% kept</p>
            </div>

            {/* Contribution squares */}
            <div className="flex-1 flex gap-0.5">
              {days.map((day, i) => {
                const log = habit.logs.find((l) => isSameDay(new Date(l.date), day));
                let cls = "flex-1 rounded-sm ";
                if (!log) {
                  cls += "bg-muted opacity-30 h-5";
                } else if (log.kept) {
                  cls += "bg-orange-500 h-5";
                } else {
                  cls += "bg-red-500/60 h-5";
                }
                return (
                  <div
                    key={i}
                    className={cls}
                    title={`${format(day, "MMM d")}: ${log ? (log.kept ? "✓ Kept" : "✗ Missed") : "No log"}`}
                  />
                );
              })}
            </div>

            {/* Streak + milestone */}
            <div className="w-14 shrink-0 flex flex-col items-end">
              {streak > 0 ? (
                <span className="flex items-center gap-0.5 text-orange-500 text-sm font-bold">
                  <Flame className="h-3.5 w-3.5" />
                  {streak}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
              {milestone && (
                <span className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-medium">
                  <Trophy className="h-2.5 w-2.5" />
                  {milestone}d
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-3 mt-2 border-t text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" />
          Kept
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500/60 inline-block" />
          Missed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-muted opacity-30 inline-block" />
          No log
        </span>
      </div>
    </div>
  );
}
