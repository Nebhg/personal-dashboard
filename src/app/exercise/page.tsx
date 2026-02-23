"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkoutForm } from "@/components/exercise/WorkoutForm";
import { WorkoutPlanForm } from "@/components/exercise/WorkoutPlanForm";
import { WorkoutPlanTable } from "@/components/exercise/WorkoutPlanTable";
import { WorkoutWeeklySchedule } from "@/components/exercise/WorkoutWeeklySchedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Dumbbell, Trash2, Clock, ClipboardList, CalendarDays, Pencil } from "lucide-react";
import { format } from "date-fns";

interface ExerciseSet {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  distanceKm: number | null;
  order: number;
}

interface Workout {
  id: string;
  date: string;
  name: string;
  type: string;
  durationMin: number;
  notes: string | null;
  exercises: ExerciseSet[];
}

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

const TYPE_COLORS: Record<string, string> = {
  strength: "bg-blue-900/50 text-blue-300",
  cardio: "bg-red-900/50 text-red-300",
  mobility: "bg-green-900/50 text-green-300",
  sport: "bg-purple-900/50 text-purple-300",
};

export default function ExercisePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);

  const loadWorkouts = useCallback(async () => {
    const res = await fetch("/api/exercise");
    setWorkouts(await res.json());
  }, []);

  const loadPlans = useCallback(async () => {
    const res = await fetch("/api/exercise/plans");
    setPlans(await res.json());
  }, []);

  useEffect(() => {
    loadWorkouts();
    loadPlans();
  }, [loadWorkouts, loadPlans]);

  async function deleteWorkout(id: string) {
    if (!confirm("Delete this workout?")) return;
    await fetch(`/api/exercise/${id}`, { method: "DELETE" });
    loadWorkouts();
  }

  async function deletePlan(id: string) {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/exercise/plans/${id}`, { method: "DELETE" });
    loadPlans();
  }

  const totalMinutes = workouts.reduce((s, w) => s + w.durationMin, 0);

  // Sessions per week from schedule
  const sessionsPerWeek = plans.reduce((acc, plan) => {
    let days: number[] = [];
    try { days = JSON.parse(plan.scheduledDays); } catch { days = []; }
    return acc + days.length;
  }, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-blue-400" />
            Exercise
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {workouts.length} sessions logged · {Math.round(totalMinutes / 60)}h total · {sessionsPerWeek}×/week scheduled
          </p>
        </div>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" />
            Workouts
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Sessions
          </TabsTrigger>
        </TabsList>

        {/* ── WEEKLY SCHEDULE TAB ─────────────────────────────── */}
        <TabsContent value="schedule">
          <WorkoutWeeklySchedule plans={plans} onSessionLogged={loadWorkouts} />
        </TabsContent>

        {/* ── PLANS TAB ─────────────────────────────── */}
        <TabsContent value="plans">
          <div className="flex justify-end mb-3">
            <Dialog open={newPlanOpen} onOpenChange={setNewPlanOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  New Workout
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Workout</DialogTitle>
                </DialogHeader>
                <WorkoutPlanForm onSuccess={() => { setNewPlanOpen(false); loadPlans(); }} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit dialog — controlled externally via setEditingPlan */}
          <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Edit Workout</DialogTitle>
              </DialogHeader>
              {editingPlan && (
                <WorkoutPlanForm
                  planId={editingPlan.id}
                  initialValues={{
                    name: editingPlan.name,
                    description: editingPlan.description ?? "",
                    scheduledDays: (() => { try { return JSON.parse(editingPlan.scheduledDays); } catch { return []; } })(),
                    exercises: editingPlan.exercises,
                  }}
                  onSuccess={() => { setEditPlanOpen(false); loadPlans(); }}
                />
              )}
            </DialogContent>
          </Dialog>

          {plans.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No workouts yet</p>
              <p className="text-sm mt-1">Create a workout and assign it to days to build your schedule</p>
            </div>
          )}

          <div className="space-y-4">
            {plans.map((plan) => {
              let scheduledDays: number[] = [];
              try { scheduledDays = JSON.parse(plan.scheduledDays); } catch { scheduledDays = []; }
              const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const dayLabels = scheduledDays.map((d) => DAY_NAMES[d]).join(", ");

              return (
                <Card key={plan.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        {plan.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                        )}
                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{plan.exercises.length} exercises</span>
                          {dayLabels && <span className="text-primary">· {dayLabels}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => { setEditingPlan(plan); setEditPlanOpen(true); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deletePlan(plan.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <WorkoutPlanTable exercises={plan.exercises} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── SESSIONS TAB ─────────────────────────────── */}
        <TabsContent value="sessions">
          <div className="flex justify-end mb-3">
            <Dialog open={logOpen} onOpenChange={setLogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Log Workout
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Log Workout</DialogTitle>
                </DialogHeader>
                <WorkoutForm onSuccess={() => { setLogOpen(false); loadWorkouts(); }} />
              </DialogContent>
            </Dialog>
          </div>

          {workouts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No workouts logged yet</p>
              <p className="text-sm mt-1">Go to the Schedule tab and click a workout to log it</p>
            </div>
          )}

          <div className="space-y-3">
            {workouts.map((workout) => (
              <Card key={workout.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[workout.type] ?? "bg-muted text-muted-foreground"}`}>
                          {workout.type}
                        </span>
                        <h3 className="font-semibold text-sm">{workout.name}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{format(new Date(workout.date), "MMM d, yyyy")}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {workout.durationMin}min
                        </span>
                      </div>

                      {workout.exercises.length > 0 && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b text-muted-foreground">
                                <th className="text-left py-1 pr-4 font-medium">Exercise</th>
                                <th className="text-center py-1 px-2 font-medium">Sets×Reps</th>
                                <th className="text-center py-1 px-2 font-medium">Weight</th>
                                <th className="text-center py-1 pl-2 font-medium">Dist</th>
                              </tr>
                            </thead>
                            <tbody>
                              {workout.exercises.sort((a, b) => a.order - b.order).map((ex) => (
                                <tr key={ex.id} className="border-b last:border-0">
                                  <td className="py-1 pr-4">{ex.name}</td>
                                  <td className="py-1 px-2 text-center text-muted-foreground">
                                    {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : (ex.sets ?? ex.reps ?? "—")}
                                  </td>
                                  <td className="py-1 px-2 text-center text-muted-foreground">
                                    {ex.weightKg != null ? `${ex.weightKg}kg` : "—"}
                                  </td>
                                  <td className="py-1 pl-2 text-center text-muted-foreground">
                                    {ex.distanceKm != null ? `${ex.distanceKm}km` : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {workout.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{workout.notes}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => deleteWorkout(workout.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
