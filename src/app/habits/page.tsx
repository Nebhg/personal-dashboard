"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { HabitForm } from "@/components/habits/HabitForm";
import { Topbar } from "@/components/ui/topbar";
import { Panel, PanelHead, PanelTitle, PanelBody } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { AtlasBtn } from "@/components/ui/topbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
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

type CellStatus = "k" | "miss" | "default";

function buildHeatmap(logs: HabitLog[], days = 30): CellStatus[] {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, i) => {
    const day    = subDays(today, days - 1 - i);
    const dayStr = format(day, "yyyy-MM-dd");
    const log    = logs.find((l) => format(new Date(l.date), "yyyy-MM-dd") === dayStr);
    if (!log)      return "default";
    return log.kept ? "k" : "miss";
  });
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [open, setOpen]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/habits");
    setHabits(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const habitStreaks = habits.map((h) => ({
    ...h,
    streak:   calculateStreak(h.logs.map((l) => ({ date: new Date(l.date), kept: l.kept }))),
    todayLog: h.logs.find((l) => {
      const d = new Date(l.date);
      return d >= today && d <= todayEnd;
    }),
    cells: buildHeatmap(h.logs, 30),
  }));

  const topStreak    = habitStreaks.length > 0 ? Math.max(...habitStreaks.map((h) => h.streak)) : 0;
  const keptToday    = habitStreaks.filter((h) => h.todayLog?.kept).length;
  const topName      = habitStreaks.find((h) => h.streak === topStreak)?.name ?? "—";

  // 30d adherence
  const totalPossible = habits.length * 30;
  const totalKept = habits.reduce((acc, h) => {
    return acc + h.logs.filter((l) => {
      const d = new Date(l.date);
      return d >= subDays(today, 30) && l.kept;
    }).length;
  }, 0);
  const adherence = totalPossible > 0 ? Math.round((totalKept / totalPossible) * 100) : 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this habit?")) return;
    setDeletingId(id);
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  };

  const handleCheck = async (habit: Habit & { todayLog?: HabitLog }) => {
    const alreadyKept = habit.todayLog?.kept;
    await fetch(`/api/habits/${habit.id}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: format(new Date(), "yyyy-MM-dd"), kept: !alreadyKept }),
    });
    load();
  };

  return (
    <>
      <Topbar
        title="Habits"
        crumb={`${habits.length} ACTIVE · 30-DAY VIEW`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <AtlasBtn variant="primary">
                <Plus className="h-[13px] w-[13px]" />
                New habit
              </AtlasBtn>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Habit</DialogTitle>
              </DialogHeader>
              <HabitForm onSuccess={() => { setOpen(false); load(); }} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-10 lg:pb-16 max-w-[1400px]">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <StatTile label="Active"       num={habits.length} sub={<span>{habits.filter(h => h.type === "BUILD").length} BUILD · {habits.filter(h => h.type === "QUIT").length} QUIT</span>} />
          <StatTile label="Top streak"   num={topStreak}  unit="days" sub={<span>{topName}</span>} />
          <StatTile
            label="Kept today"
            num={keptToday}
            unit={`/ ${habits.length}`}
            sub={<span>{habits.length - keptToday > 0 ? `${habits.length - keptToday} pending` : "all done"}</span>}
          />
          <StatTile
            label="30d adherence"
            num={adherence}
            unit="%"
            delta={adherence > 70 ? "+good" : adherence > 50 ? "avg" : "low"}
            deltaDir={adherence > 70 ? "up" : adherence > 50 ? "flat" : "down"}
          />
        </div>

        {/* Heatmap table */}
        {habits.length === 0 ? (
          <Panel>
            <PanelBody className="flex flex-col items-center py-16">
              <span className="label mb-3">No habits yet</span>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <AtlasBtn variant="primary">
                    <Plus className="h-[13px] w-[13px]" />
                    Add your first habit
                  </AtlasBtn>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Habit</DialogTitle>
                  </DialogHeader>
                  <HabitForm onSuccess={() => { setOpen(false); load(); }} />
                </DialogContent>
              </Dialog>
            </PanelBody>
          </Panel>
        ) : (
          <Panel>
            <PanelHead>
              <PanelTitle>All habits · last 30 days</PanelTitle>
              <span className="label">today →</span>
            </PanelHead>
            <div className="overflow-x-auto">
              <div className="min-w-[540px]">
              {habitStreaks
                .sort((a, b) => b.streak - a.streak)
                .map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-4 px-4 py-[14px] border-b border-border last:border-0 hover:bg-muted transition-colors group"
                    style={{ gridTemplateColumns: "1fr 360px 80px" }}
                  >
                    {/* Name + tag */}
                    <div className="min-w-0 w-[140px] sm:w-[180px] shrink-0">
                      <div
                        className="text-[13px] font-medium cursor-pointer"
                        onClick={() => handleCheck(h)}
                      >
                        {h.name}
                      </div>
                      <div
                        className="mono text-[9px] mt-0.5 uppercase tracking-[0.1em]"
                        style={{ color: "var(--fg-3)" }}
                      >
                        {h.type} · daily
                      </div>
                    </div>

                    {/* Heatmap cells */}
                    <div
                      className="flex-1 grid gap-[2px]"
                      style={{ gridTemplateColumns: "repeat(30, 1fr)" }}
                    >
                      {h.cells.map((status, i) => (
                        <div
                          key={i}
                          className="rounded-[2px]"
                          style={{
                            height: 14,
                            background:
                              status === "k"
                                ? "var(--primary)"
                                : status === "miss"
                                ? "oklch(0.30 0.04 25)"
                                : "var(--muted)",
                          }}
                        />
                      ))}
                    </div>

                    {/* Streak + actions */}
                    <div className="flex items-center gap-2 shrink-0 w-[80px] justify-end">
                      <span
                        className="mono text-[14px] tabular-nums"
                        style={{ color: h.streak > 0 ? "var(--foreground)" : "var(--fg-3)" }}
                      >
                        {h.streak}
                        <span className="mono text-[9px] ml-[3px]" style={{ color: "var(--fg-3)" }}>d</span>
                      </span>
                      <button
                        onClick={() => handleDelete(h.id)}
                        disabled={deletingId === h.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                        style={{ color: "var(--fg-3)" }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
