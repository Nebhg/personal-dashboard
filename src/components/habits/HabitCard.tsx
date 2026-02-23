"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Flame, Trash2, Trophy } from "lucide-react";
import { calculateStreak } from "@/lib/utils/streaks";
import { startOfDay, subDays, isSameDay } from "date-fns";

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
  habit: Habit;
  onUpdate: () => void;
}

const MILESTONES: { days: number; label: string }[] = [
  { days: 3,   label: "3 days" },
  { days: 7,   label: "1 week" },
  { days: 14,  label: "2 weeks" },
  { days: 21,  label: "21 days" },
  { days: 30,  label: "1 month" },
  { days: 60,  label: "2 months" },
  { days: 100, label: "100 days" },
];

function getCurrentMilestone(streak: number) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (streak >= MILESTONES[i].days) return MILESTONES[i];
  }
  return null;
}

function getNextMilestone(streak: number) {
  return MILESTONES.find((m) => m.days > streak) ?? null;
}

export function HabitCard({ habit, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);

  const streak = calculateStreak(
    habit.logs.map((l) => ({ date: new Date(l.date), kept: l.kept }))
  );

  const todayLog = habit.logs.find((l) =>
    isSameDay(new Date(l.date), new Date())
  );

  const currentMilestone = getCurrentMilestone(streak);
  const nextMilestone = getNextMilestone(streak);

  async function check(kept: boolean) {
    setLoading(true);
    await fetch(`/api/habits/${habit.id}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kept }),
    });
    setLoading(false);
    onUpdate();
  }

  async function remove() {
    if (!confirm(`Delete habit "${habit.name}"?`)) return;
    await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
    onUpdate();
  }

  // 14-day dot array: index 0 = 13 days ago, index 13 = today
  const today = startOfDay(new Date());
  const dots = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(today, 13 - i);
    const log = habit.logs.find((l) => isSameDay(new Date(l.date), day));
    return { day, log };
  });

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{habit.name}</h3>
              <Badge
                variant={habit.type === "QUIT" ? "destructive" : "secondary"}
                className="text-xs shrink-0"
              >
                {habit.type === "QUIT" ? "Quit" : "Build"}
              </Badge>
              {currentMilestone && (
                <span className="flex items-center gap-0.5 text-xs text-yellow-500 font-medium">
                  <Trophy className="h-3 w-3" />
                  {currentMilestone.label}
                </span>
              )}
            </div>
            {habit.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {habit.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {streak > 0 && (
              <span className="flex items-center gap-0.5 text-orange-500 text-sm font-bold">
                <Flame className="h-3.5 w-3.5" />
                {streak}
              </span>
            )}
          </div>
        </div>

        {/* 14-day dot timeline */}
        <div className="flex gap-0.5 mt-3">
          {dots.map(({ day, log }, i) => {
            let cls = "h-3.5 flex-1 rounded-sm ";
            if (!log) cls += "bg-muted opacity-40";
            else if (log.kept) cls += "bg-orange-500";
            else cls += "bg-red-500/70";
            return (
              <div
                key={i}
                className={cls}
                title={`${day.toLocaleDateString()}: ${log ? (log.kept ? "Kept" : "Missed") : "No log"}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5 px-0.5">
          <span>14 days ago</span>
          <span>today</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={todayLog?.kept === true ? "default" : "outline"}
              className="h-8 gap-1 text-xs"
              onClick={() => check(true)}
              disabled={loading}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Kept
            </Button>
            <Button
              size="sm"
              variant={todayLog?.kept === false ? "destructive" : "outline"}
              className="h-8 gap-1 text-xs"
              onClick={() => check(false)}
              disabled={loading}
            >
              <XCircle className="h-3.5 w-3.5" />
              Missed
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={remove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Progress toward next milestone */}
        {nextMilestone && streak > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Next: {nextMilestone.label}</span>
              <span>{streak}/{nextMilestone.days} days</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (streak / nextMilestone.days) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {!nextMilestone && habit.targetDays && streak > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Goal</span>
              <span>{streak}/{habit.targetDays} days</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (streak / habit.targetDays) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
