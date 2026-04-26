"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Code2, Plus, Trash2, TrendingUp } from "lucide-react";
import { Topbar, AtlasBtn } from "@/components/ui/topbar";
import { StatTile } from "@/components/ui/stat-tile";
import { Panel, PanelHead, PanelTitle, PanelBody } from "@/components/ui/panel";

const PATTERNS = [
  "Two Pointers",
  "Sliding Window",
  "Hashmap",
  "Binary Search",
  "Trees BFS",
  "Trees DFS",
  "Stack",
  "Queue",
  "Linked List",
  "Dynamic Programming",
  "Greedy",
  "Other",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const APPROACHES = ["Recalled", "Reasoned", "Needed hints"];

const DIFF_COLORS: Record<string, string> = {
  Easy:   "bg-green-500/20 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Hard:   "bg-red-500/20 text-red-400 border-red-500/30",
};

const APPROACH_COLORS: Record<string, string> = {
  "Recalled":     "text-green-400",
  "Reasoned":     "text-yellow-400",
  "Needed hints": "text-red-400",
};

interface Problem {
  id: string;
  date: string;
  name: string;
  number: number | null;
  pattern: string | null;
  difficulty: string | null;
  timeMins: number | null;
  approach: string | null;
  confidence: number | null;
  notes: string | null;
}

function LogProblemDialog({ onSave }: { onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    number: "",
    pattern: "",
    difficulty: "",
    timeMins: "",
    approach: "",
    confidence: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch("/api/leetcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:       form.name.trim(),
        number:     form.number     ? parseInt(form.number)     : null,
        pattern:    form.pattern    || null,
        difficulty: form.difficulty || null,
        timeMins:   form.timeMins   ? parseInt(form.timeMins)   : null,
        approach:   form.approach   || null,
        confidence: form.confidence ? parseInt(form.confidence) : null,
        notes:      form.notes.trim() || null,
        date:       form.date,
      }),
    });
    setSaving(false);
    setOpen(false);
    setForm({ name: "", number: "", pattern: "", difficulty: "", timeMins: "", approach: "", confidence: "", notes: "", date: new Date().toISOString().slice(0, 10) });
    onSave();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Log Problem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Problem</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Problem name *</Label>
              <Input placeholder="Two Sum" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>LeetCode #</Label>
              <Input type="number" placeholder="1" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Pattern</Label>
              <Select value={form.pattern} onValueChange={v => setForm(f => ({ ...f, pattern: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{PATTERNS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Time (mins)</Label>
              <Input type="number" placeholder="25" value={form.timeMins} onChange={e => setForm(f => ({ ...f, timeMins: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Confidence (1–10)</Label>
              <Input type="number" min={1} max={10} placeholder="7" value={form.confidence} onChange={e => setForm(f => ({ ...f, confidence: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Approach</Label>
              <Select value={form.approach} onValueChange={v => setForm(f => ({ ...f, approach: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{APPROACHES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <Textarea placeholder="What tripped you up? What clicked?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? "Saving…" : "Log Problem"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProblemCard({ problem, onDelete }: { problem: Problem; onDelete: () => void }) {
  async function handleDelete() {
    if (!confirm(`Delete "${problem.name}"?`)) return;
    await fetch(`/api/leetcode/${problem.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {problem.name}
                {problem.number && <span className="text-muted-foreground font-normal"> #{problem.number}</span>}
              </span>
              {problem.difficulty && (
                <span className={`text-xs px-2 py-0.5 rounded border ${DIFF_COLORS[problem.difficulty] ?? ""}`}>
                  {problem.difficulty}
                </span>
              )}
              {problem.pattern && (
                <Badge variant="secondary" className="text-xs">{problem.pattern}</Badge>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {problem.approach && (
                <span className={APPROACH_COLORS[problem.approach] ?? ""}>
                  {problem.approach === "Recalled" ? "🟢" : problem.approach === "Reasoned" ? "🟡" : "🔴"} {problem.approach}
                </span>
              )}
              {problem.timeMins && <span>⏱ {problem.timeMins} min</span>}
              {problem.confidence && <span>Confidence: {problem.confidence}/10</span>}
            </div>

            {problem.notes && (
              <p className="mt-1.5 text-xs text-muted-foreground">{problem.notes}</p>
            )}
          </div>

          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeetCodePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/leetcode");
    setProblems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Group by date
  const byDate = new Map<string, Problem[]>();
  for (const p of problems) {
    const key = p.date.slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(p);
  }

  const patterns = [...new Set(problems.map(p => p.pattern).filter(Boolean))];
  const avgConf = problems.filter(p => p.confidence).length > 0
    ? (problems.reduce((s, p) => s + (p.confidence ?? 0), 0) / problems.filter(p => p.confidence).length).toFixed(1)
    : null;

  const thisWeek = problems.filter((p) => {
    const d = new Date(p.date);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  return (
    <>
      <Topbar
        title="LeetCode"
        crumb={`${problems.length} PROBLEMS LOGGED`}
        actions={<LogProblemDialog onSave={load} />}
      />

      <div className="px-8 pt-7 pb-16 max-w-4xl">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatTile label="Problems" num={problems.length} sub={<span>all time</span>} />
          <StatTile label="This week" num={thisWeek} sub={<span>last 7 days</span>} />
          <StatTile label="Avg confidence" num={avgConf ?? "—"} unit={avgConf ? "/10" : ""} sub={<span>self-rated</span>} />
          <StatTile label="Patterns" num={patterns.length} sub={<span>distinct covered</span>} />
        </div>

        {/* Patterns covered */}
        {patterns.length > 0 && (
          <Panel className="mb-6">
            <PanelHead>
              <PanelTitle>Patterns covered</PanelTitle>
              <span className="label">{patterns.length} total</span>
            </PanelHead>
            <PanelBody className="flex flex-wrap gap-2">
              {patterns.map(p => (
                <span key={p!} className="label px-2 py-1 rounded-[4px]" style={{ background: "var(--muted)", color: "var(--fg-2)" }}>{p}</span>
              ))}
            </PanelBody>
          </Panel>
        )}

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : problems.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Code2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No problems logged yet</p>
            <p className="text-sm mt-1">Hit "Log Problem" after each session</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[...byDate.entries()].map(([date, dayProblems]) => (
              <div key={date}>
                <p className="label mb-2" style={{ color: "var(--fg-3)" }}>{date}</p>
                <div className="space-y-2">
                  {dayProblems.map(p => (
                    <ProblemCard key={p.id} problem={p} onDelete={load} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
