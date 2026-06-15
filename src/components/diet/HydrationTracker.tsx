"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplet, Plus, Trash2, GlassWater } from "lucide-react";
import { HYDRATION_GOAL_ML, GLASS_ML } from "@/types";
import { format } from "date-fns";

interface HydrationLog {
  id: string;
  date: string;
  amountMl: number;
  notes: string | null;
}

export function HydrationTracker({ onUpdate }: { onUpdate?: () => void }) {
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [unit, setUnit] = useState<"glasses" | "ml">("glasses");
  const [customAmount, setCustomAmount] = useState("");

  const load = useCallback(async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const res = await fetch(`/api/hydration?date=${today}`);
    if (res.ok) setLogs(await res.json());
    onUpdate?.();
  }, [onUpdate]);

  useEffect(() => {
    load();
  }, [load]);

  async function addMl(amountMl: number) {
    if (!amountMl || amountMl <= 0) return;
    await fetch("/api/hydration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountMl: Math.round(amountMl) }),
    });
    load();
  }

  async function removeLog(id: string) {
    await fetch(`/api/hydration/${id}`, { method: "DELETE" });
    load();
  }

  function addCustom() {
    const n = Number(customAmount);
    if (!n || n <= 0) return;
    addMl(unit === "glasses" ? n * GLASS_ML : n);
    setCustomAmount("");
  }

  const totalMl = logs.reduce((s, l) => s + l.amountMl, 0);
  const glasses = totalMl / GLASS_ML;
  const goalGlasses = HYDRATION_GOAL_ML / GLASS_ML;
  const pct = Math.min(100, Math.round((totalMl / HYDRATION_GOAL_ML) * 100));

  const fmt = (ml: number) =>
    unit === "glasses"
      ? `${(ml / GLASS_ML) % 1 === 0 ? ml / GLASS_ML : (ml / GLASS_ML).toFixed(1)} glass${ml === GLASS_ML ? "" : "es"}`
      : `${ml} mL`;

  return (
    <Card>
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header + unit toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold">Hydration</h3>
          </div>
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            <button
              className={`px-2.5 py-1 transition-colors ${unit === "glasses" ? "bg-cyan-900/40 text-cyan-300" : "text-muted-foreground hover:bg-muted"}`}
              onClick={() => setUnit("glasses")}
            >
              Glasses
            </button>
            <button
              className={`px-2.5 py-1 transition-colors ${unit === "ml" ? "bg-cyan-900/40 text-cyan-300" : "text-muted-foreground hover:bg-muted"}`}
              onClick={() => setUnit("ml")}
            >
              mL
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="mono text-2xl font-medium tabular-nums">
              {unit === "glasses"
                ? `${glasses % 1 === 0 ? glasses : glasses.toFixed(1)} / ${goalGlasses}`
                : `${totalMl.toLocaleString()} / ${HYDRATION_GOAL_ML.toLocaleString()}`}
            </span>
            <span className="text-xs text-muted-foreground">
              {unit === "glasses" ? "glasses" : "mL"} · {pct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Quick add */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => addMl(GLASS_ML)}>
            <GlassWater className="h-3.5 w-3.5" /> +1 glass
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => addMl(500)}>
            <Droplet className="h-3.5 w-3.5" /> +500 mL
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              inputMode="numeric"
              placeholder={unit === "glasses" ? "glasses" : "mL"}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              className="h-8 w-24"
            />
            <Button size="sm" className="h-8 gap-1" onClick={addCustom}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>

        {/* Today's entries */}
        {logs.length > 0 && (
          <div className="space-y-1 pt-1">
            <p className="text-xs font-medium text-muted-foreground">Today&apos;s entries</p>
            {logs.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0"
              >
                <span className="text-muted-foreground">
                  {format(new Date(l.date), "HH:mm")} · {fmt(l.amountMl)}
                </span>
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeLog(l.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
