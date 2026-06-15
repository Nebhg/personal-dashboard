"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ChevronDown, ChevronRight, AlertCircle, GripVertical, LayoutGrid, Columns3, Pencil, X } from "lucide-react";
import { ApplicationStage, STAGE_LABELS, STAGE_COLORS } from "@/types";
import { cn } from "@/lib/utils";
import { Topbar, AtlasBtn } from "@/components/ui/topbar";
import { StatTile } from "@/components/ui/stat-tile";

type Application = {
  id: string;
  firm: string;
  role: string | null;
  stage: ApplicationStage;
  appliedDate: string | null;
  lastAction: string | null;
  nextAction: string | null;
  prepNeeded: boolean;
  prepNotes: string | null;
  notes: string | null;
  interviewStages: string | null;
  currentStageIdx: number;
  updatedAt: string;
};

const BOARD_STAGES: ApplicationStage[] = ["APPLIED", "SCREEN", "TECHNICAL", "FINAL", "OFFER"];
const CLOSED_STAGES: ApplicationStage[] = ["REJECTED", "GHOSTED"];
const ALL_STAGES: ApplicationStage[] = [...BOARD_STAGES, ...CLOSED_STAGES];

type ViewMode = "board" | "cards";

// ── Kanban card (compact) ─────────────────────────────────────────────────────

function KanbanCard({
  app,
  onSelect,
  onDragStart,
}: {
  app: Application;
  onSelect: (app: Application) => void;
  onDragStart: (e: React.DragEvent, app: Application) => void;
}) {
  const customStages: string[] = app.interviewStages ? JSON.parse(app.interviewStages) : [];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, app)}
      onClick={() => onSelect(app)}
      className={cn(
        "rounded-[6px] p-3 cursor-pointer transition-all hover:ring-1 hover:ring-foreground/20",
        "active:scale-[0.98]",
        app.prepNeeded && "ring-1 ring-yellow-500/40"
      )}
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold truncate">{app.firm}</div>
          {app.role && (
            <div className="text-[11px] text-muted-foreground truncate mt-0.5">{app.role}</div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {app.prepNeeded && <AlertCircle className="h-3 w-3 text-yellow-500" />}
          <GripVertical className="h-3 w-3 text-muted-foreground opacity-40" />
        </div>
      </div>

      {customStages.length > 0 && (
        <div className="mt-2 flex gap-0.5">
          {customStages.map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 rounded-full"
              style={{
                background: i <= app.currentStageIdx ? "var(--primary)" : "var(--muted)",
              }}
            />
          ))}
        </div>
      )}
      {customStages.length > 0 && (
        <div className="text-[9px] mono uppercase tracking-wider mt-1" style={{ color: "var(--fg-3)" }}>
          {customStages[app.currentStageIdx] ?? "Done"}
        </div>
      )}

      {app.nextAction && (
        <div className="text-[10px] text-blue-400 mt-1.5 truncate">
          Next: {app.nextAction}
        </div>
      )}
    </div>
  );
}

// ── Kanban column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  apps,
  onSelect,
  onDragStart,
  onDrop,
  isDragOver,
  onDragOver,
  onDragLeave,
}: {
  stage: ApplicationStage;
  apps: Application[];
  onSelect: (app: Application) => void;
  onDragStart: (e: React.DragEvent, app: Application) => void;
  onDrop: (e: React.DragEvent, stage: ApplicationStage) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col min-w-[200px] flex-1 rounded-[6px] transition-colors",
        isDragOver && "ring-2 ring-primary/40"
      )}
      style={{ background: "var(--sidebar, oklch(0.14 0.005 240))" }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, stage)}
    >
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", STAGE_COLORS[stage])}>
            {STAGE_LABELS[stage]}
          </span>
          <span className="mono text-[10px]" style={{ color: "var(--fg-3)" }}>{apps.length}</span>
        </div>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ minHeight: 120, maxHeight: "calc(100vh - 320px)" }}>
        {apps.length === 0 && (
          <div className="text-center py-6">
            <span className="text-[10px] mono uppercase" style={{ color: "var(--fg-3)" }}>Drop here</span>
          </div>
        )}
        {apps.map((app) => (
          <KanbanCard key={app.id} app={app} onSelect={onSelect} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}

// ── Detail card ───────────────────────────────────────────────────────────────

function ApplicationDetail({
  app,
  onUpdate,
  onDelete,
  onClose,
}: {
  app: Application;
  onUpdate: (id: string, data: Partial<Application>) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firm: app.firm,
    role: app.role ?? "",
    stage: app.stage,
    lastAction: app.lastAction ?? "",
    nextAction: app.nextAction ?? "",
    prepNeeded: app.prepNeeded,
    prepNotes: app.prepNotes ?? "",
    notes: app.notes ?? "",
    interviewStages: app.interviewStages ? JSON.parse(app.interviewStages).join(", ") : "",
    currentStageIdx: app.currentStageIdx,
  });

  useEffect(() => {
    setForm({
      firm: app.firm,
      role: app.role ?? "",
      stage: app.stage,
      lastAction: app.lastAction ?? "",
      nextAction: app.nextAction ?? "",
      prepNeeded: app.prepNeeded,
      prepNotes: app.prepNotes ?? "",
      notes: app.notes ?? "",
      interviewStages: app.interviewStages ? JSON.parse(app.interviewStages).join(", ") : "",
      currentStageIdx: app.currentStageIdx,
    });
    setEditing(false);
  }, [app]);

  async function save() {
    const stages = form.interviewStages.trim()
      ? JSON.stringify(form.interviewStages.split(",").map((s: string) => s.trim()).filter(Boolean))
      : null;
    await onUpdate(app.id, {
      firm: form.firm,
      role: form.role || null,
      stage: form.stage,
      lastAction: form.lastAction || null,
      nextAction: form.nextAction || null,
      prepNeeded: form.prepNeeded,
      prepNotes: form.prepNotes || null,
      notes: form.notes || null,
      interviewStages: stages,
      currentStageIdx: form.currentStageIdx,
    } as Partial<Application>);
    setEditing(false);
  }

  const customStages: string[] = app.interviewStages ? JSON.parse(app.interviewStages) : [];

  if (editing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} placeholder="Firm" className="flex-1" />
          <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role (optional)" className="flex-1" />
        </div>
        <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as ApplicationStage })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{ALL_STAGES.map((s) => (<SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>))}</SelectContent>
        </Select>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Interview stages (comma-separated)</p>
          <Input value={form.interviewStages} onChange={(e) => setForm({ ...form, interviewStages: e.target.value })} placeholder="e.g. Phone Screen, Technical, System Design, Final" />
        </div>
        {form.interviewStages.trim() && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current stage</p>
            <Select value={String(form.currentStageIdx)} onValueChange={(v) => setForm({ ...form, currentStageIdx: parseInt(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {form.interviewStages.split(",").map((s: string, i: number) => (
                  <SelectItem key={i} value={String(i)}>{s.trim()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Input value={form.lastAction} onChange={(e) => setForm({ ...form, lastAction: e.target.value })} placeholder="Last action" />
        <Input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="Next action" />
        <div className="flex items-center gap-2">
          <input type="checkbox" id={`prep-${app.id}`} checked={form.prepNeeded} onChange={(e) => setForm({ ...form, prepNeeded: e.target.checked })} className="rounded" />
          <label htmlFor={`prep-${app.id}`} className="text-sm">Prep needed</label>
        </div>
        {form.prepNeeded && <Input value={form.prepNotes} onChange={(e) => setForm({ ...form, prepNotes: e.target.value })} placeholder="What to prep" />}
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={3} />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          <Button size="sm" onClick={save}>Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-base">{app.firm}</div>
          {app.role && <div className="text-sm text-muted-foreground">{app.role}</div>}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /></Button>
          {onClose && <Button variant="ghost" size="sm" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>}
        </div>
      </div>

      <div>
        <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", STAGE_COLORS[app.stage])}>{STAGE_LABELS[app.stage]}</span>
      </div>

      {customStages.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Interview pipeline</p>
          <div className="flex gap-1 flex-wrap">
            {customStages.map((s, i) => (
              <button
                key={i}
                onClick={() => onUpdate(app.id, { currentStageIdx: i })}
                className={cn(
                  "text-[11px] px-2 py-1 rounded transition-colors",
                  i === app.currentStageIdx ? "bg-primary text-primary-foreground"
                    : i < app.currentStageIdx ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {app.lastAction && <p className="text-xs text-muted-foreground"><span className="font-medium">Last:</span> {app.lastAction}</p>}
      {app.nextAction && <p className="text-xs"><span className="font-medium text-blue-400">Next:</span> <span className="text-muted-foreground">{app.nextAction}</span></p>}
      {app.prepNeeded && app.prepNotes && <p className="text-xs text-yellow-500"><span className="font-medium">Prep:</span> {app.prepNotes}</p>}
      {app.notes && <p className="text-xs text-muted-foreground italic">{app.notes}</p>}

      <div className="flex gap-1 flex-wrap pt-1">
        {BOARD_STAGES.filter((s) => s !== app.stage).map((s) => (
          <button key={s} onClick={() => onUpdate(app.id, { stage: s })} className="text-xs px-2 py-0.5 rounded border border-dashed border-zinc-600 text-zinc-500 hover:text-zinc-300 hover:border-zinc-400 transition-colors">
            → {STAGE_LABELS[s]}
          </button>
        ))}
        {!CLOSED_STAGES.includes(app.stage) && (
          <>
            <button onClick={() => onUpdate(app.id, { stage: "REJECTED" })} className="text-xs px-2 py-0.5 rounded border border-dashed border-red-900 text-red-700 hover:text-red-400 transition-colors">Rejected</button>
            <button onClick={() => onUpdate(app.id, { stage: "GHOSTED" })} className="text-xs px-2 py-0.5 rounded border border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400 transition-colors">Ghosted</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Add application dialog ────────────────────────────────────────────────────

function AddApplicationDialog({ onAdd }: { onAdd: (app: Application) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    firm: "", role: "", stage: "APPLIED" as ApplicationStage, appliedDate: "",
    lastAction: "", nextAction: "", prepNeeded: false, prepNotes: "", notes: "",
    interviewStages: "",
  });

  async function submit() {
    if (!form.firm.trim()) return;
    const stages = form.interviewStages.trim()
      ? JSON.stringify(form.interviewStages.split(",").map((s) => s.trim()).filter(Boolean))
      : null;
    const res = await fetch("/api/career", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firm: form.firm, role: form.role || null, stage: form.stage,
        appliedDate: form.appliedDate || null, lastAction: form.lastAction || null,
        nextAction: form.nextAction || null, prepNeeded: form.prepNeeded,
        prepNotes: form.prepNotes || null, notes: form.notes || null,
        interviewStages: stages, currentStageIdx: 0,
      }),
    });
    const app = await res.json();
    onAdd(app);
    setOpen(false);
    setForm({ firm: "", role: "", stage: "APPLIED", appliedDate: "", lastAction: "", nextAction: "", prepNeeded: false, prepNotes: "", notes: "", interviewStages: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AtlasBtn variant="primary"><Plus className="h-[13px] w-[13px]" />Add Application</AtlasBtn>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Application</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="flex gap-2">
            <Input value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} placeholder="Firm *" className="flex-1" />
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" className="flex-1" />
          </div>
          <div className="flex gap-2">
            <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as ApplicationStage })}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>{ALL_STAGES.map((s) => (<SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>))}</SelectContent>
            </Select>
            <Input type="date" value={form.appliedDate} onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} className="flex-1" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Interview stages (comma-separated, optional)</p>
            <Input value={form.interviewStages} onChange={(e) => setForm({ ...form, interviewStages: e.target.value })} placeholder="e.g. Phone Screen, Technical, System Design, Final" />
          </div>
          <Input value={form.lastAction} onChange={(e) => setForm({ ...form, lastAction: e.target.value })} placeholder="Last action" />
          <Input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="Next action" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="prep-new" checked={form.prepNeeded} onChange={(e) => setForm({ ...form, prepNeeded: e.target.checked })} />
            <label htmlFor="prep-new" className="text-sm">Prep needed</label>
          </div>
          {form.prepNeeded && <Input value={form.prepNotes} onChange={(e) => setForm({ ...form, prepNotes: e.target.value })} placeholder="What to prep" />}
          <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={2} />
          <Button onClick={submit} className="w-full">Add Application</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CareerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("board");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [closedOpen, setClosedOpen] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<ApplicationStage | null>(null);
  const dragAppRef = useRef<Application | null>(null);

  const load = useCallback(() => {
    fetch("/api/career", { cache: "no-store" }).then((r) => r.json()).then((data) => { setApps(data); setLoading(false); });
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

  const active = apps.filter((a) => BOARD_STAGES.includes(a.stage));
  const closed = apps.filter((a) => CLOSED_STAGES.includes(a.stage));
  const prepCount = active.filter((a) => a.prepNeeded).length;
  const offerCount = active.filter((a) => a.stage === "OFFER").length;

  const handleUpdate = useCallback(async (id: string, data: Partial<Application>) => {
    const res = await fetch(`/api/career/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
    setSelectedApp((prev) => prev?.id === id ? updated : prev);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/career/${id}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== id));
    setSelectedApp((prev) => prev?.id === id ? null : prev);
  }, []);

  const handleAdd = (app: Application) => setApps((prev) => [app, ...prev]);

  const handleDragStart = (e: React.DragEvent, app: Application) => {
    dragAppRef.current = app;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = useCallback((e: React.DragEvent, targetStage: ApplicationStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const app = dragAppRef.current;
    if (app && app.stage !== targetStage) {
      handleUpdate(app.id, { stage: targetStage });
    }
    dragAppRef.current = null;
  }, [handleUpdate]);

  const handleDragOver = (e: React.DragEvent, stage: ApplicationStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  };

  return (
    <>
      <Topbar
        title="Career"
        crumb={`${active.length} ACTIVE · ${closed.length} CLOSED`}
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex overflow-hidden" style={{ border: "1px solid var(--hairline-strong, oklch(1 0 0 / 0.12))", borderRadius: 4 }}>
              <button
                onClick={() => setView("board")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors"
                style={{ background: view === "board" ? "var(--muted)" : "transparent", color: view === "board" ? "var(--foreground)" : "var(--fg-3)", border: "none", borderRight: "1px solid var(--hairline-strong, oklch(1 0 0 / 0.12))", cursor: "pointer" }}
              ><Columns3 className="h-3 w-3" /> Board</button>
              <button
                onClick={() => setView("cards")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors"
                style={{ background: view === "cards" ? "var(--muted)" : "transparent", color: view === "cards" ? "var(--foreground)" : "var(--fg-3)", border: "none", cursor: "pointer" }}
              ><LayoutGrid className="h-3 w-3" /> Cards</button>
            </div>
            <AddApplicationDialog onAdd={handleAdd} />
          </div>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-10 lg:pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <StatTile label="Active" num={active.length} sub={<span>{BOARD_STAGES.length} stages tracked</span>} />
          <StatTile label="Offers" num={offerCount} sub={<span>{offerCount > 0 ? "in hand" : "none yet"}</span>} />
          <StatTile label="Need prep" num={prepCount} sub={<span>{prepCount > 0 ? "action required" : "all clear"}</span>} delta={prepCount > 0 ? `${prepCount} pending` : undefined} deltaDir="down" />
          <StatTile label="Closed" num={closed.length} sub={<span>rejected + ghosted</span>} />
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : view === "board" ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {BOARD_STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                apps={active.filter((a) => a.stage === stage).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())}
                onSelect={setSelectedApp}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                isDragOver={dragOverStage === stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={() => setDragOverStage(null)}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-4xl">
            {active.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="font-medium">No active applications</p>
                <p className="text-sm mt-1">Add one to start tracking</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {active.map((app) => (
                  <Card key={app.id} className={cn("border", app.prepNeeded && "border-yellow-500/40")}>
                    <CardContent className="p-4">
                      <ApplicationDetail app={app} onUpdate={handleUpdate} onDelete={handleDelete} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {closed.length > 0 && (
          <div className="mt-6 max-w-4xl">
            <button onClick={() => setClosedOpen(!closedOpen)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
              {closedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Closed / Inactive ({closed.length})
            </button>
            {closedOpen && (
              <div className="space-y-3 opacity-60">
                {closed.map((app) => (
                  <Card key={app.id} className="border">
                    <CardContent className="p-4">
                      <ApplicationDetail app={app} onUpdate={handleUpdate} onDelete={handleDelete} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedApp && view === "board"} onOpenChange={(o) => { if (!o) setSelectedApp(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {selectedApp && (
            <ApplicationDetail app={selectedApp} onUpdate={handleUpdate} onDelete={handleDelete} onClose={() => setSelectedApp(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
