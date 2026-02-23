"use client";

import { useState, useEffect, useCallback } from "react";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitStreakTimeline } from "@/components/habits/HabitStreakTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Target, LayoutGrid, TrendingUp, Flame, Trophy } from "lucide-react";
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

  // Stats for header
  const streaks = habits.map((h) =>
    calculateStreak(h.logs.map((l) => ({ date: new Date(l.date), kept: l.kept })))
  );
  const bestStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
  const activeStreaks = streaks.filter((s) => s > 0).length;

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

      {habits.length > 0 && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-lg font-bold leading-none">{habits.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total habits</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                <div>
                  <p className="text-lg font-bold leading-none">{activeStreaks}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Active streaks</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
                <div>
                  <p className="text-lg font-bold leading-none">{bestStreak}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Best streak</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="grid">
            <TabsList className="mb-4">
              <TabsTrigger value="grid" className="gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="streaks" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Streaks
              </TabsTrigger>
            </TabsList>

            {/* ── GRID TAB ─── */}
            <TabsContent value="grid">
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
            </TabsContent>

            {/* ── STREAKS TAB ─── */}
            <TabsContent value="streaks">
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    Last 30 days
                  </h2>
                  <HabitStreakTimeline habits={habits} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
