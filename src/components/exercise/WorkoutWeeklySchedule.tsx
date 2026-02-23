"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkoutForm } from "@/components/exercise/WorkoutForm";
import { useState } from "react";
import { Dumbbell } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// getDay() returns 0=Sun,1=Mon,...,6=Sat but we display Mon-Sun so map index+1 → db dayOfWeek
// Display index 0=Mon → dayOfWeek 1, ... index 5=Sat → 6, index 6=Sun → 0
const DISPLAY_DOW = [1, 2, 3, 4, 5, 6, 0];

interface PlanExercise {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  restSec: number | null;
  notes: string | null;
  order: number;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  scheduledDays: string; // JSON string
  exercises: PlanExercise[];
}

interface Props {
  plans: WorkoutPlan[];
  onSessionLogged: () => void;
}

export function WorkoutWeeklySchedule({ plans, onSessionLogged }: Props) {
  const [logPlan, setLogPlan] = useState<WorkoutPlan | null>(null);

  // Build map: dayOfWeek (0-6) → plans scheduled on that day
  const byDay = new Map<number, WorkoutPlan[]>();
  for (const plan of plans) {
    let days: number[] = [];
    try { days = JSON.parse(plan.scheduledDays); } catch { days = []; }
    for (const d of days) {
      if (!byDay.has(d)) byDay.set(d, []);
      byDay.get(d)!.push(plan);
    }
  }

  // How many sessions per week across all plans
  const totalPerWeek = plans.reduce((acc, plan) => {
    let days: number[] = [];
    try { days = JSON.parse(plan.scheduledDays); } catch { days = []; }
    return acc + days.length;
  }, 0);

  // Today's display index (Mon=0 ... Sun=6)
  const todayDow = new Date().getDay(); // 0=Sun...6=Sat
  const todayDisplayIdx = todayDow === 0 ? 6 : todayDow - 1;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {totalPerWeek} session{totalPerWeek !== 1 ? "s" : ""} per week scheduled
      </p>

      {/* Timetable grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day, displayIdx) => {
          const dow = DISPLAY_DOW[displayIdx];
          const dayPlans = byDay.get(dow) ?? [];
          const isToday = displayIdx === todayDisplayIdx;

          return (
            <div
              key={day}
              className={`rounded-lg border p-2 min-h-[100px] flex flex-col gap-1.5 ${
                isToday ? "border-primary/50 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className={`text-xs font-semibold text-center pb-1 border-b border-border ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {day}
                {isToday && <span className="ml-1 text-primary">•</span>}
              </div>

              {dayPlans.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground/40">Rest</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {dayPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setLogPlan(plan)}
                      className="w-full text-left rounded-md px-2 py-1.5 text-xs font-medium bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 transition-colors group"
                    >
                      <div className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3 shrink-0" />
                        <span className="truncate">{plan.name}</span>
                      </div>
                      <div className="text-blue-400/60 text-xs mt-0.5 group-hover:text-blue-300/80 transition-colors">
                        {plan.exercises.length} exercises
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {plans.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Click any workout to log a session.
        </div>
      )}

      {plans.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No workouts scheduled yet.</p>
          <p className="text-xs mt-1">Create a plan and assign it to days of the week.</p>
        </div>
      )}

      <Dialog open={!!logPlan} onOpenChange={(o) => !o && setLogPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Session: {logPlan?.name}</DialogTitle>
          </DialogHeader>
          {logPlan && (
            <WorkoutForm
              initialName={logPlan.name}
              initialExercises={logPlan.exercises}
              onSuccess={() => { setLogPlan(null); onSessionLogged(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
