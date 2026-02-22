"use client";

import { useState, useEffect, useCallback } from "react";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitForm } from "@/components/habits/HabitForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Target } from "lucide-react";

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

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/habits");
    setHabits(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const quitHabits = habits.filter((h) => h.type === "QUIT");
  const buildHabits = habits.filter((h) => h.type === "BUILD");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-orange-500" />
            Habits
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track what you are quitting and building
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Habit</DialogTitle>
            </DialogHeader>
            <HabitForm
              onSuccess={() => {
                setOpen(false);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No habits yet</p>
          <p className="text-sm mt-1">Add a habit to start tracking your streaks</p>
        </div>
      )}

      {quitHabits.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quitting
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quitHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onUpdate={load} />
            ))}
          </div>
        </section>
      )}

      {buildHabits.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Building
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {buildHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onUpdate={load} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
