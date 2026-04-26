"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Plus, Dumbbell, Trash2, ClipboardList, CalendarDays, Pencil } from "lucide-react";
import { Topbar, AtlasBtn } from "@/components/ui/topbar";
import { StatTile } from "@/components/ui/stat-tile";

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
  scheduledTime: string | null;
  exercises: PlanExercise[];
}

interface WorkoutSession {
  id: string;
  date: string;
  name: string;
}

export default function ExercisePage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);

  const loadSessions = useCallback(async () => {
    const res = await fetch("/api/exercise");
    setSessions(await res.json());
  }, []);

  const loadPlans = useCallback(async () => {
    const res = await fetch("/api/exercise/plans");
    setPlans(await res.json());
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadSessions(), loadPlans()]);
  }, [loadSessions, loadPlans]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function deletePlan(id: string) {
    if (!confirm("Delete this workout?")) return;
    await fetch(`/api/exercise/plans/${id}`, { method: "DELETE" });
    loadPlans();
  }

  const sessionsPerWeek = plans.reduce((acc, plan) => {
    let days: number[] = [];
    try { days = JSON.parse(plan.scheduledDays); } catch { days = []; }
    return acc + days.length;
  }, 0);

  const totalMin = sessions.reduce((s, w) => {
    const found = (plans as WorkoutPlan[]).find((p) => p.name === w.name);
    return s;
  }, 0);

  return (
    <>
      <Topbar
        title="Exercise"
        crumb={`${sessions.length} SESSIONS LOGGED`}
        actions={
          <Dialog open={newPlanOpen} onOpenChange={setNewPlanOpen}>
            <DialogTrigger asChild>
              <AtlasBtn variant="primary">
                <Plus className="h-[13px] w-[13px]" />
                New workout
              </AtlasBtn>
            </DialogTrigger>
            <DialogContent className="w-[70vw] !max-w-none max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Workout</DialogTitle>
              </DialogHeader>
              <WorkoutPlanForm onSuccess={() => { setNewPlanOpen(false); loadPlans(); }} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-8 pt-7 pb-16">
        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatTile
            label="Sessions · total"
            num={sessions.length}
            sub={<span>all time</span>}
          />
          <StatTile
            label="Plans"
            num={plans.length}
            sub={<span>{sessionsPerWeek}×/week scheduled</span>}
          />
          <StatTile
            label="Exercises"
            num={plans.reduce((s, p) => s + p.exercises.length, 0)}
            sub={<span>across all plans</span>}
          />
          <StatTile
            label="Schedule"
            num={sessionsPerWeek}
            unit="×/wk"
            sub={<span>{plans.length} plans active</span>}
          />
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
        </TabsList>

        {/* ── WEEKLY SCHEDULE TAB ─── */}
        <TabsContent value="schedule">
          <WorkoutWeeklySchedule
            plans={plans}
            sessions={sessions}
            onRefresh={refresh}
          />
        </TabsContent>

        {/* ── WORKOUTS TAB ─── */}
        <TabsContent value="plans">

          {/* Edit dialog */}
          <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
            <DialogContent className="w-[70vw] !max-w-none max-h-[70vh] overflow-y-auto">
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
                    scheduledTime: editingPlan.scheduledTime ?? null,
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
      </Tabs>
      </div>
    </>
  );
}
