"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Flame, Trash2 } from "lucide-react";
import { calculateStreak } from "@/lib/utils/streaks";

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

export function HabitCard({ habit, onUpdate }: Props) {
  const todayLog = habit.logs[0];
  const [loading, setLoading] = useState(false);

  const streak = calculateStreak(
    habit.logs.map((l) => ({ date: new Date(l.date), kept: l.kept }))
  );

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

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{habit.name}</h3>
              <Badge variant={habit.type === "QUIT" ? "destructive" : "secondary"} className="text-xs shrink-0">
                {habit.type === "QUIT" ? "Quit" : "Build"}
              </Badge>
            </div>
            {habit.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {habit.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {streak > 0 && (
              <span className="flex items-center gap-0.5 text-orange-500 text-sm font-semibold">
                <Flame className="h-3.5 w-3.5" />
                {streak}
              </span>
            )}
          </div>
        </div>

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

        {habit.targetDays && streak > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
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
