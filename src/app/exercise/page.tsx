"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkoutForm } from "@/components/exercise/WorkoutForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Dumbbell, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";

interface ExerciseSet {
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

const TYPE_COLORS: Record<string, string> = {
  strength: "bg-blue-100 text-blue-700",
  cardio: "bg-red-100 text-red-700",
  mobility: "bg-green-100 text-green-700",
  sport: "bg-purple-100 text-purple-700",
};

export default function ExercisePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/exercise");
    setWorkouts(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteWorkout(id: string) {
    if (!confirm("Delete this workout?")) return;
    await fetch(`/api/exercise/${id}`, { method: "DELETE" });
    load();
  }

  const totalMinutes = workouts.reduce((s, w) => s + w.durationMin, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-blue-500" />
            Exercise
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {workouts.length} sessions · {Math.round(totalMinutes / 60)}h {totalMinutes % 60}min total
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Workout</DialogTitle>
            </DialogHeader>
            <WorkoutForm onSuccess={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {workouts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No workouts logged yet</p>
          <p className="text-sm mt-1">Start tracking your training</p>
        </div>
      )}

      <div className="space-y-3">
        {workouts.map((workout) => (
          <Card key={workout.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[workout.type] ?? "bg-gray-100 text-gray-700"}`}>
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
                    <div className="mt-2 space-y-0.5">
                      {workout.exercises.sort((a, b) => a.order - b.order).map((ex, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          {ex.name}
                          {ex.sets && ex.reps && ` · ${ex.sets}×${ex.reps}`}
                          {ex.weightKg && ` @ ${ex.weightKg}kg`}
                          {ex.distanceKm && ` · ${ex.distanceKm}km`}
                        </p>
                      ))}
                    </div>
                  )}

                  {workout.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{workout.notes}</p>
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
    </div>
  );
}
