"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
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
  updatedAt: string;
};

const ACTIVE_STAGES: ApplicationStage[] = ["APPLIED", "SCREEN", "TECHNICAL", "FINAL", "OFFER"];
const CLOSED_STAGES: ApplicationStage[] = ["REJECTED", "GHOSTED"];
const ALL_STAGES: ApplicationStage[] = [...ACTIVE_STAGES, ...CLOSED_STAGES];

function StageBadge({ stage }: { stage: ApplicationStage }) {
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", STAGE_COLORS[stage])}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

function ApplicationCard({
  app,
  onUpdate,
  onDelete,
}: {
  app: Application;
  onUpdate: (id: string, data: Partial<Application>) => void;
  onDelete: (id: string) => void;
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
  });

  async function save() {
    await onUpdate(app.id, {
      ...form,
      role: form.role || null,
      lastAction: form.lastAction || null,
      nextAction: form.nextAction || null,
      prepNotes: form.prepNotes || null,
      notes: form.notes || null,
    });
    setEditing(false);
  }

  return (
    <Card className={cn("border", app.prepNeeded && "border-yellow-500/40")}>
      <CardContent className="p-4">
        {editing ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={form.firm}
                onChange={(e) => setForm({ ...form, firm: e.target.value })}
                placeholder="Firm"
                className="flex-1"
              />
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Role (optional)"
                className="flex-1"
              />
            </div>
            <Select
              value={form.stage}
              onValueChange={(v) => setForm({ ...form, stage: v as ApplicationStage })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={form.lastAction}
              onChange={(e) => setForm({ ...form, lastAction: e.target.value })}
              placeholder="Last action"
            />
            <Input
              value={form.nextAction}
              onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
              placeholder="Next action"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`prep-${app.id}`}
                checked={form.prepNeeded}
                onChange={(e) => setForm({ ...form, prepNeeded: e.target.checked })}
                className="rounded"
              />
              <label htmlFor={`prep-${app.id}`} className="text-sm">Prep needed</label>
            </div>
            {form.prepNeeded && (
              <Input
                value={form.prepNotes}
                onChange={(e) => setForm({ ...form, prepNotes: e.target.value })}
                placeholder="What to prep"
              />
            )}
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes"
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={save}>Save</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{app.firm}</span>
                  {app.role && (
                    <span className="text-xs text-muted-foreground truncate">— {app.role}</span>
                  )}
                  {app.prepNeeded && (
                    <AlertCircle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                  )}
                </div>
                <div className="mt-1">
                  <StageBadge stage={app.stage} />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>

            {app.lastAction && (
              <p className="text-xs text-muted-foreground mt-1.5">
                <span className="font-medium">Last:</span> {app.lastAction}
              </p>
            )}
            {app.nextAction && (
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-medium text-blue-400">Next:</span> {app.nextAction}
              </p>
            )}
            {app.prepNeeded && app.prepNotes && (
              <p className="text-xs text-yellow-500 mt-0.5">
                <span className="font-medium">Prep:</span> {app.prepNotes}
              </p>
            )}
            {app.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">{app.notes}</p>
            )}

            <div className="flex gap-1 mt-3 flex-wrap">
              {ACTIVE_STAGES.filter((s) => s !== app.stage).map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdate(app.id, { stage: s })}
                  className="text-xs px-2 py-0.5 rounded border border-dashed border-zinc-600 text-zinc-500 hover:text-zinc-300 hover:border-zinc-400 transition-colors"
                >
                  → {STAGE_LABELS[s]}
                </button>
              ))}
              {!CLOSED_STAGES.includes(app.stage) && (
                <>
                  <button
                    onClick={() => onUpdate(app.id, { stage: "REJECTED" })}
                    className="text-xs px-2 py-0.5 rounded border border-dashed border-red-900 text-red-700 hover:text-red-400 transition-colors"
                  >
                    Rejected
                  </button>
                  <button
                    onClick={() => onUpdate(app.id, { stage: "GHOSTED" })}
                    className="text-xs px-2 py-0.5 rounded border border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Ghosted
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddApplicationDialog({ onAdd }: { onAdd: (app: Application) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    firm: "",
    role: "",
    stage: "APPLIED" as ApplicationStage,
    appliedDate: "",
    lastAction: "",
    nextAction: "",
    prepNeeded: false,
    prepNotes: "",
    notes: "",
  });

  async function submit() {
    if (!form.firm.trim()) return;
    const res = await fetch("/api/career", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        role: form.role || null,
        appliedDate: form.appliedDate || null,
        lastAction: form.lastAction || null,
        nextAction: form.nextAction || null,
        prepNotes: form.prepNotes || null,
        notes: form.notes || null,
      }),
    });
    const app = await res.json();
    onAdd(app);
    setOpen(false);
    setForm({ firm: "", role: "", stage: "APPLIED", appliedDate: "", lastAction: "", nextAction: "", prepNeeded: false, prepNotes: "", notes: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Application</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="flex gap-2">
            <Input
              value={form.firm}
              onChange={(e) => setForm({ ...form, firm: e.target.value })}
              placeholder="Firm *"
              className="flex-1"
            />
            <Input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Role"
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={form.stage}
              onValueChange={(v) => setForm({ ...form, stage: v as ApplicationStage })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={form.appliedDate}
              onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
              className="flex-1"
            />
          </div>
          <Input
            value={form.lastAction}
            onChange={(e) => setForm({ ...form, lastAction: e.target.value })}
            placeholder="Last action"
          />
          <Input
            value={form.nextAction}
            onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
            placeholder="Next action"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prep-new"
              checked={form.prepNeeded}
              onChange={(e) => setForm({ ...form, prepNeeded: e.target.checked })}
            />
            <label htmlFor="prep-new" className="text-sm">Prep needed</label>
          </div>
          {form.prepNeeded && (
            <Input
              value={form.prepNotes}
              onChange={(e) => setForm({ ...form, prepNotes: e.target.value })}
              placeholder="What to prep"
            />
          )}
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes"
            rows={2}
          />
          <Button onClick={submit} className="w-full">Add Application</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CareerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [closedOpen, setClosedOpen] = useState(false);

  useEffect(() => {
    fetch("/api/career")
      .then((r) => r.json())
      .then((data) => { setApps(data); setLoading(false); });
  }, []);

  const active = apps.filter((a) => ACTIVE_STAGES.includes(a.stage));
  const closed = apps.filter((a) => CLOSED_STAGES.includes(a.stage));
  const prepCount = active.filter((a) => a.prepNeeded).length;

  async function handleUpdate(id: string, data: Partial<Application>) {
    const res = await fetch(`/api/career/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/career/${id}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  function handleAdd(app: Application) {
    setApps((prev) => [app, ...prev]);
  }

  const offerCount = active.filter((a) => a.stage === "OFFER").length;

  return (
    <>
      <Topbar
        title="Career"
        crumb={`${active.length} ACTIVE · ${closed.length} CLOSED`}
        actions={<AddApplicationDialog onAdd={handleAdd} />}
      />

      <div className="px-8 pt-7 pb-16 max-w-4xl">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatTile label="Active" num={active.length} sub={<span>{ACTIVE_STAGES.length} stages tracked</span>} />
          <StatTile label="Offers" num={offerCount} sub={<span>{offerCount > 0 ? "in hand" : "none yet"}</span>} />
          <StatTile
            label="Need prep"
            num={prepCount}
            sub={<span>{prepCount > 0 ? "action required" : "all clear"}</span>}
            delta={prepCount > 0 ? `${prepCount} pending` : undefined}
            deltaDir="down"
          />
          <StatTile label="Closed" num={closed.length} sub={<span>rejected + ghosted</span>} />
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : (
          <>
            {active.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="font-medium">No active applications</p>
                <p className="text-sm mt-1">Add one to start tracking</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {active.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {closed.length > 0 && (
              <div>
                <button
                  onClick={() => setClosedOpen(!closedOpen)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                  {closedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  Closed / Inactive ({closed.length})
                </button>
                {closedOpen && (
                  <div className="space-y-3 opacity-60">
                    {closed.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        app={app}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
