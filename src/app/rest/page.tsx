"use client";

import { useState, useEffect, useCallback } from "react";
import { SleepForm } from "@/components/rest/SleepForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Moon, Trash2, Star } from "lucide-react";
import { Topbar, AtlasBtn } from "@/components/ui/topbar";
import { StatTile } from "@/components/ui/stat-tile";
import { SLEEP_GOAL_MIN } from "@/types";
import { format, subDays } from "date-fns";

interface SleepLog {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  durationMin: number;
  quality: number | null;
  notes: string | null;
}

const fmtDuration = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;

export default function RestPage() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [logOpen, setLogOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/rest");
    if (res.ok) setLogs(await res.json());
  }, []);

  useEffect(() => {
    load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", load);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", load);
    };
  }, [load]);

  async function deleteLog(id: string) {
    if (!confirm("Delete this sleep log?")) return;
    await fetch(`/api/rest/${id}`, { method: "DELETE" });
    load();
  }

  // Stats
  const sorted = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastNight = sorted[0];

  const weekAgo = subDays(new Date(), 7);
  const weekLogs = logs.filter((l) => new Date(l.date) >= weekAgo);
  const avgMin =
    weekLogs.length > 0
      ? Math.round(weekLogs.reduce((s, l) => s + l.durationMin, 0) / weekLogs.length)
      : 0;
  const qualityLogs = weekLogs.filter((l) => l.quality != null);
  const avgQuality =
    qualityLogs.length > 0
      ? (qualityLogs.reduce((s, l) => s + (l.quality ?? 0), 0) / qualityLogs.length).toFixed(1)
      : null;
  // Sleep debt over the logged nights this week (vs 8h target each).
  const debtMin = weekLogs.reduce((s, l) => s + (SLEEP_GOAL_MIN - l.durationMin), 0);

  return (
    <>
      <Topbar
        title="Rest"
        crumb={lastNight ? `LAST NIGHT · ${fmtDuration(lastNight.durationMin)}` : "NO SLEEP LOGGED"}
        actions={
          <Dialog open={logOpen} onOpenChange={setLogOpen}>
            <DialogTrigger asChild>
              <AtlasBtn variant="primary">
                <Plus className="h-[13px] w-[13px]" />
                Log sleep
              </AtlasBtn>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Log Sleep</DialogTitle>
              </DialogHeader>
              <SleepForm onSuccess={() => { setLogOpen(false); load(); }} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-10 lg:pb-16">
        {/* Stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <StatTile
            label="Last night"
            num={lastNight ? fmtDuration(lastNight.durationMin) : "—"}
            sub={lastNight ? <span>goal 8h</span> : <span>not logged</span>}
          />
          <StatTile
            label="7-day avg"
            num={avgMin > 0 ? fmtDuration(avgMin) : "—"}
            sub={<span>{weekLogs.length} night{weekLogs.length === 1 ? "" : "s"} · {Math.round((avgMin / SLEEP_GOAL_MIN) * 100)}% of goal</span>}
          />
          <StatTile
            label="Avg quality"
            num={avgQuality ?? "—"}
            unit={avgQuality ? "/ 10" : undefined}
            sub={<span>{qualityLogs.length} rated</span>}
          />
          <StatTile
            label="Sleep debt"
            num={debtMin > 0 ? `−${fmtDuration(debtMin)}` : debtMin < 0 ? `+${fmtDuration(-debtMin)}` : "0"}
            sub={<span>vs 8h × {weekLogs.length} nights</span>}
            delta={debtMin > 0 ? "behind" : weekLogs.length ? "on track" : undefined}
            deltaDir={debtMin > 0 ? "down" : "up"}
          />
        </div>

        {/* Sleep log list */}
        {logs.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Moon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No sleep logged yet</p>
            <p className="text-sm mt-1">Track your rest to round out your health picture</p>
          </div>
        )}

        <div className="space-y-2">
          {sorted.map((log) => (
            <Card key={log.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">
                        {format(new Date(log.date), "EEE, MMM d")}
                      </span>
                      <span className="text-sm font-medium">{fmtDuration(log.durationMin)}</span>
                      {log.quality != null && (
                        <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                          <Star className="h-3 w-3 fill-current" /> {log.quality}/10
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      {format(new Date(log.bedTime), "HH:mm")} → {format(new Date(log.wakeTime), "HH:mm")}
                    </div>
                    {log.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{log.notes}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => deleteLog(log.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
