"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleBlockSchema, type ScheduleBlockFormValues } from "@/lib/validations/schedule";
import { recurringBlockSchema, type RecurringBlockFormValues } from "@/lib/validations/recurring-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCHEDULE_CATEGORIES } from "@/types";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface Props {
  initialStart?: Date;
  initialEnd?: Date;
  onSuccess: () => void;
}

function toDatetimeLocal(d: Date) {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

// ─── One-time block form ────────────────────────────────────────────────────

function OneTimeForm({ initialStart, initialEnd, onSuccess }: Props) {
  const now = new Date();
  const defaultStart = initialStart ?? now;
  const defaultEnd = initialEnd ?? new Date(now.getTime() + 60 * 60 * 1000);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<ScheduleBlockFormValues>({
      resolver: zodResolver(scheduleBlockSchema),
      defaultValues: {
        title: "",
        start: defaultStart,
        end: defaultEnd,
        allDay: false,
        category: "PERSONAL",
        notes: null,
      },
    });

  const allDay = watch("allDay");

  async function onSubmit(values: ScheduleBlockFormValues) {
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input placeholder="e.g. Morning Run, Deep Work, Sleep" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select
          defaultValue="PERSONAL"
          onValueChange={(v) => setValue("category", v as ScheduleBlockFormValues["category"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SCHEDULE_CATEGORIES).map(([key, { label, color }]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="allDay" className="h-4 w-4 rounded" {...register("allDay")} />
        <Label htmlFor="allDay" className="cursor-pointer">All day</Label>
      </div>

      {!allDay ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start</Label>
            <Input
              type="datetime-local"
              defaultValue={toDatetimeLocal(defaultStart)}
              onChange={(e) => setValue("start", new Date(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>End</Label>
            <Input
              type="datetime-local"
              defaultValue={toDatetimeLocal(defaultEnd)}
              onChange={(e) => setValue("end", new Date(e.target.value))}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input
            type="date"
            defaultValue={format(defaultStart, "yyyy-MM-dd")}
            onChange={(e) => {
              const d = new Date(e.target.value);
              setValue("start", d);
              setValue("end", d);
            }}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea placeholder="Any details..." {...register("notes")} rows={2} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Add to Calendar"}
      </Button>
    </form>
  );
}

// ─── Recurring block form ───────────────────────────────────────────────────

function RecurringForm({ onSuccess }: { onSuccess: () => void }) {
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [existingBlocks, setExistingBlocks] = useState<
    { id: string; title: string; category: string; startTime: string; endTime: string; daysOfWeek: string }[]
  >([]);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<RecurringBlockFormValues>({
      resolver: zodResolver(recurringBlockSchema),
      defaultValues: {
        title: "",
        category: "WORK",
        startTime: "09:00",
        endTime: "17:00",
        daysOfWeek: [1, 2, 3, 4, 5],
        endsOn: null,
        notes: null,
      },
    });

  // Load existing recurring blocks
  useEffect(() => {
    fetch("/api/schedule/recurring")
      .then((r) => r.json())
      .then(setExistingBlocks)
      .catch(() => {});
  }, []);

  function toggleDay(day: number) {
    setSelectedDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      setValue("daysOfWeek", next);
      return next;
    });
  }

  async function onSubmit(values: RecurringBlockFormValues) {
    const res = await fetch("/api/schedule/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      const newBlock = await res.json();
      setExistingBlocks((prev) => [...prev, newBlock]);
      onSuccess();
    }
  }

  async function deleteBlock(id: string) {
    await fetch(`/api/schedule/recurring/${id}`, { method: "DELETE" });
    setExistingBlocks((prev) => prev.filter((b) => b.id !== id));
    onSuccess();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input placeholder="e.g. Work, Morning Commute, Gym" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            defaultValue="WORK"
            onValueChange={(v) => setValue("category", v as RecurringBlockFormValues["category"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SCHEDULE_CATEGORIES).map(([key, { label, color }]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start time</Label>
            <Input type="time" defaultValue="09:00" {...register("startTime")} />
            {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>End time</Label>
            <Input type="time" defaultValue="17:00" {...register("endTime")} />
            {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Repeat on</Label>
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleDay(value)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                  selectedDays.includes(value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.daysOfWeek && <p className="text-xs text-destructive">Select at least one day</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Ends on (optional)</Label>
          <Input
            type="date"
            onChange={(e) => setValue("endsOn", e.target.value ? new Date(e.target.value) : null)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Notes (optional)</Label>
          <Textarea placeholder="Any details..." {...register("notes")} rows={2} />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Add Recurring Event"}
        </Button>
      </form>

      {existingBlocks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Existing recurring events
          </p>
          {existingBlocks.map((block) => {
            let days: number[] = [];
            try { days = JSON.parse(block.daysOfWeek); } catch { days = []; }
            const dayLabels = DAYS.filter((d) => days.includes(d.value)).map((d) => d.label).join(", ");
            const cat = SCHEDULE_CATEGORIES[block.category];

            return (
              <div
                key={block.id}
                className="flex items-center justify-between p-2.5 rounded-md border bg-card text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat?.color ?? "#6366f1" }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{block.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {block.startTime}–{block.endTime} · {dayLabels}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="ml-2 p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Delete recurring event"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────

export function ScheduleBlockForm({ initialStart, initialEnd, onSuccess }: Props) {
  const [tab, setTab] = useState<"once" | "recurring">("once");

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setTab("once")}
          className={`flex-1 py-1.5 text-sm rounded-md transition-all ${
            tab === "once" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          One-time
        </button>
        <button
          type="button"
          onClick={() => setTab("recurring")}
          className={`flex-1 py-1.5 text-sm rounded-md transition-all ${
            tab === "recurring" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Recurring
        </button>
      </div>

      {tab === "once" ? (
        <OneTimeForm initialStart={initialStart} initialEnd={initialEnd} onSuccess={onSuccess} />
      ) : (
        <RecurringForm onSuccess={onSuccess} />
      )}
    </div>
  );
}
