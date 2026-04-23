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
import { TrendingUp, Plus, Trash2 } from "lucide-react";

const TRACKS = [
  { value: "1", label: "Track 1 — Options Pricing" },
  { value: "2", label: "Track 2 — Futures Contracts" },
  { value: "3", label: "Track 3 — Volatility Modelling" },
  { value: "4", label: "Track 4 — Index Strategies" },
  { value: "5", label: "Track 5 — Narrative" },
];

const TRACK_NAMES: Record<number, string> = {
  1: "Options Pricing",
  2: "Futures Contracts",
  3: "Volatility Modelling",
  4: "Index Strategies",
  5: "Narrative",
};

const LEVEL_CONFIG: Record<string, { label: string; emoji: string; className: string }> = {
  recall:      { label: "Recall",      emoji: "🔵", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  application: { label: "Application", emoji: "🟢", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  shaky:       { label: "Shaky",       emoji: "🟠", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
};

interface Topic {
  id: string;
  topic: string;
  track: number | null;
  level: string;
  coveredAt: string;
  notes: string | null;
}

function LogTopicDialog({ onSave }: { onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    topic: "",
    track: "",
    level: "recall",
    notes: "",
    coveredAt: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.topic.trim()) return;
    setSaving(true);
    await fetch("/api/macro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic:     form.topic.trim(),
        track:     form.track ? parseInt(form.track) : null,
        level:     form.level,
        notes:     form.notes.trim() || null,
        coveredAt: form.coveredAt,
      }),
    });
    setSaving(false);
    setOpen(false);
    setForm({ topic: "", track: "", level: "recall", notes: "", coveredAt: new Date().toISOString().slice(0, 10) });
    onSave();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Log Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Covered Topic</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1">
            <Label>Topic name *</Label>
            <Input placeholder="e.g. Black-Scholes assumptions & formula" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Track</Label>
              <Select value={form.track} onValueChange={v => setForm(f => ({ ...f, track: v }))}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{TRACKS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Level</Label>
              <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recall">🔵 Recall</SelectItem>
                  <SelectItem value="application">🟢 Application</SelectItem>
                  <SelectItem value="shaky">🟠 Shaky</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Date covered</Label>
              <Input type="date" value={form.coveredAt} onChange={e => setForm(f => ({ ...f, coveredAt: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea placeholder="One-line summary of what was covered and how well" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving || !form.topic.trim()}>
            {saving ? "Saving…" : "Log Topic"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TopicCard({ topic, onDelete }: { topic: Topic; onDelete: () => void }) {
  const level = LEVEL_CONFIG[topic.level] ?? LEVEL_CONFIG.recall;

  async function handleDelete() {
    if (!confirm(`Delete "${topic.topic}"?`)) return;
    await fetch(`/api/macro/${topic.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-border/50 last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{topic.topic}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded border ${level.className}`}>
            {level.emoji} {level.label}
          </span>
        </div>
        {topic.notes && (
          <p className="text-xs text-muted-foreground mt-0.5">{topic.notes}</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{topic.coveredAt.slice(0, 10)}</p>
      </div>
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 mt-0.5"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function MacroPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/macro");
    setTopics(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const byTrack = new Map<number | null, Topic[]>();
  for (const t of topics) {
    const key = t.track;
    if (!byTrack.has(key)) byTrack.set(key, []);
    byTrack.get(key)!.push(t);
  }

  const appCount   = topics.filter(t => t.level === "application").length;
  const shakyCount = topics.filter(t => t.level === "shaky").length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Macro Learning
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {topics.length} topics covered
            {appCount > 0 && ` · ${appCount} at application level`}
            {shakyCount > 0 && ` · ${shakyCount} shaky`}
          </p>
        </div>
        <LogTopicDialog onSave={load} />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : topics.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No topics logged yet.</p>
            <p className="text-xs mt-1">Log a topic after each learning session.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(trackNum => {
            const trackTopics = byTrack.get(trackNum) ?? [];
            if (trackTopics.length === 0) return null;
            return (
              <Card key={trackNum}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Track {trackNum} — {TRACK_NAMES[trackNum]}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {trackTopics.length} topics
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {trackTopics.map(t => (
                    <TopicCard key={t.id} topic={t} onDelete={load} />
                  ))}
                </CardContent>
              </Card>
            );
          })}
          {(byTrack.get(null) ?? []).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Untracked</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {(byTrack.get(null) ?? []).map(t => (
                  <TopicCard key={t.id} topic={t} onDelete={load} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
