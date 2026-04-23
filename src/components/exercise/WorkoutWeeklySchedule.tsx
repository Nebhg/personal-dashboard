"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkoutForm } from "@/components/exercise/WorkoutForm";
import { useState } from "react";
import { Check, Dumbbell, Flame, ClipboardList, Undo2 } from "lucide-react";
import { startOfDay, subDays, isSameDay, getDay } from "date-fns";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Display order Mon=index 0 → dow 1, ..., Sun=index 6 → dow 0
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
  scheduledDays: string;
  exercises: PlanExercise[];
}

interface WorkoutSession {
  id: string;
  date: string;
  name: string;
}

interface Props {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  onRefresh: () => void;
}

/** Returns the last `count` occurrences of `dow` (0=Sun…6=Sat), oldest first. */
function getPastOccurrences(dow: number, count: number): Date[] {
  const today = startOfDay(new Date());
  const todayDow = getDay(today);
  const daysBack = (todayDow - dow + 7) % 7;
  const dates: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    dates.push(subDays(today, daysBack + i * 7));
  }
  return dates; // oldest → newest
}

function hasSessionOnDate(sessions: WorkoutSession[], date: Date): boolean {
  return sessions.some((s) => isSameDay(startOfDay(new Date(s.date)), date));
}

function calculateWeeklyStreak(sessions: WorkoutSession[], dow: number): number {
  const occurrences = getPastOccurrences(dow, 12);
  let streak = 0;
  for (let i = occurrences.length - 1; i >= 0; i--) {
    if (hasSessionOnDate(sessions, occurrences[i])) streak++;
    else break;
  }
  return streak;
}

export function WorkoutWeeklySchedule({ plans, sessions, onRefresh }: Props) {
  const [logPlan, setLogPlan] = useState<WorkoutPlan | null>(null);
  const [doneLoading, setDoneLoading] = useState<string | null>(null);
  const [undoLoading, setUndoLoading] = useState<string | null>(null);

  const todayDow = getDay(new Date());
  const todayDisplayIdx = todayDow === 0 ? 6 : todayDow - 1;

  // Build map: dayOfWeek → plans
  const byDay = new Map<number, WorkoutPlan[]>();
  for (const plan of plans) {
    let days: number[] = [];
    try { days = JSON.parse(plan.scheduledDays); } catch { days = []; }
    for (const d of days) {
      if (!byDay.has(d)) byDay.set(d, []);
      byDay.get(d)!.push(plan);
    }
  }

  const totalPerWeek = plans.reduce((acc, plan) => {
    let days: number[] = [];
    try { days = JSON.parse(plan.scheduledDays); } catch { days = []; }
    return acc + days.length;
  }, 0);

  async function quickDone(plan: WorkoutPlan) {
    setDoneLoading(plan.id);
    await fetch("/api/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: plan.name,
        type: "strength",
        durationMin: 60,
        date: new Date().toISOString(),
        exercises: [],
      }),
    });
    setDoneLoading(null);
    onRefresh();
  }

  async function undoDone(plan: WorkoutPlan) {
    const today = startOfDay(new Date());
    const session = sessions.find(
      (s) => s.name === plan.name && isSameDay(startOfDay(new Date(s.date)), today)
    );
    if (!session) return;
    setUndoLoading(plan.id);
    await fetch(`/api/exercise/${session.id}`, { method: "DELETE" });
    setUndoLoading(null);
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {totalPerWeek} session{totalPerWeek !== 1 ? "s" : ""} per week · click a workout to log details, or hit Done to check it off
      </p>

      <div className="grid grid-cols-7 gap-2">
        {DAY_LABELS.map((day, displayIdx) => {
          const dow = DISPLAY_DOW[displayIdx];
          const dayPlans = byDay.get(dow) ?? [];
          const isToday = displayIdx === todayDisplayIdx;

          return (
            <div
              key={day}
              className={`rounded-lg border flex flex-col gap-2 p-3 min-h-[140px] ${
                isToday ? "border-primary/50 bg-primary/5" : "border-border bg-card"
              }`}
            >
              {/* Day header */}
              <div className={`text-sm font-semibold text-center pb-1.5 border-b border-border ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {day}{isToday && <span className="ml-1">•</span>}
              </div>

              {dayPlans.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground/30">Rest</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayPlans.map((plan) => {
                    const streak = calculateWeeklyStreak(sessions, dow);
                    const pastDots = getPastOccurrences(dow, 5);
                    const today = startOfDay(new Date());
                    const doneTodayAlready = isToday && sessions.some(
                      (s) => s.name === plan.name && isSameDay(startOfDay(new Date(s.date)), today)
                    );
                    const isLoading = doneLoading === plan.id;
                    const isUndoing = undoLoading === plan.id;

                    return (
                      <div key={plan.id} className="flex flex-col gap-1.5">
                        {/* Plan chip */}
                        <div className={`rounded-md px-2.5 py-2 text-xs ${
                          doneTodayAlready && isToday
                            ? "bg-green-900/40 text-green-300 border border-green-800/40"
                            : "bg-blue-900/30 text-blue-300 border border-blue-800/30"
                        }`}>
                          <div className="flex items-center gap-1.5 font-medium">
                            {doneTodayAlready && isToday
                              ? <Check className="h-3.5 w-3.5 shrink-0" />
                              : <Dumbbell className="h-3.5 w-3.5 shrink-0" />}
                            <span className="break-words leading-tight">{plan.name}</span>
                          </div>
                          <div className="text-[10px] opacity-60 mt-1">{plan.exercises.length} exercises</div>
                        </div>

                        {/* Quick actions */}
                        <div className="flex gap-1">
                          {isToday && !doneTodayAlready && (
                            <Button
                              size="sm"
                              className="h-7 flex-1 text-xs gap-1 bg-green-700 hover:bg-green-600 text-white"
                              onClick={() => quickDone(plan)}
                              disabled={isLoading}
                            >
                              <Check className="h-3.5 w-3.5" />
                              {isLoading ? "…" : "Done"}
                            </Button>
                          )}
                          {isToday && doneTodayAlready && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 flex-1 text-xs gap-1 text-muted-foreground hover:text-destructive hover:border-destructive"
                              onClick={() => undoDone(plan)}
                              disabled={isUndoing}
                            >
                              <Undo2 className="h-3.5 w-3.5" />
                              {isUndoing ? "…" : "Undo"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 flex-1 text-xs gap-1"
                            onClick={() => setLogPlan(plan)}
                          >
                            <ClipboardList className="h-3.5 w-3.5" />
                            Log
                          </Button>
                        </div>

                        {/* Adherence dots (last 5 occurrences of this day) */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5 flex-1">
                            {pastDots.map((date, i) => {
                              const done = hasSessionOnDate(sessions, date);
                              return (
                                <div
                                  key={i}
                                  className={`flex-1 h-1.5 rounded-full ${done ? "bg-orange-500" : "bg-muted opacity-40"}`}
                                  title={`${date.toLocaleDateString()}: ${done ? "Done" : "Missed"}`}
                                />
                              );
                            })}
                          </div>
                          {streak > 0 && (
                            <span className="flex items-center gap-0.5 text-orange-500 text-[10px] font-bold shrink-0">
                              <Flame className="h-2.5 w-2.5" />
                              {streak}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No workouts scheduled yet.</p>
          <p className="text-xs mt-1">Create a workout in the Workouts tab and assign it to days.</p>
        </div>
      )}

      {/* Detailed log dialog */}
      <Dialog open={!!logPlan} onOpenChange={(o) => !o && setLogPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Session: {logPlan?.name}</DialogTitle>
          </DialogHeader>
          {logPlan && (
            <WorkoutForm
              initialName={logPlan.name}
              initialExercises={logPlan.exercises}
              onSuccess={() => { setLogPlan(null); onRefresh(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
