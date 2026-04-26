"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { GCAL_COLORS } from "@/lib/gcal-colors";

export type GoogleEventFormData = {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  description: string;
  location: string;
  colorId: string;
};

interface Props {
  initialStart?: Date;
  initialEnd?: Date;
  initialData?: Partial<GoogleEventFormData> & { id?: string; calendarId?: string };
  onSuccess: () => void;
  onCancel: () => void;
}

function toLocalInput(iso: string, allDay: boolean) {
  if (!iso) return "";
  const d = new Date(iso);
  if (allDay) return format(d, "yyyy-MM-dd");
  // format as datetime-local value
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function GoogleEventForm({ initialStart, initialEnd, initialData, onSuccess, onCancel }: Props) {
  const isEdit = !!initialData?.id;

  const [form, setForm] = useState<GoogleEventFormData>({
    title:       initialData?.title       ?? "",
    start:       initialData?.start       ? toLocalInput(initialData.start, initialData.allDay ?? false)
                                          : initialStart ? format(initialStart, "yyyy-MM-dd'T'HH:mm") : "",
    end:         initialData?.end         ? toLocalInput(initialData.end, initialData.allDay ?? false)
                                          : initialEnd   ? format(initialEnd,   "yyyy-MM-dd'T'HH:mm") : "",
    allDay:      initialData?.allDay      ?? false,
    description: initialData?.description ?? "",
    location:    initialData?.location    ?? "",
    colorId:     initialData?.colorId     ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.start)        { setError("Start is required"); return; }
    if (!form.end)          { setError("End is required"); return; }
    setSaving(true); setError(null);

    // Convert local datetime string to ISO
    const toISO = (local: string, allDay: boolean) => {
      if (!local) return "";
      if (allDay) return new Date(local + "T12:00:00").toISOString();
      return new Date(local).toISOString();
    };

    const payload = {
      title:       form.title,
      start:       toISO(form.start, form.allDay),
      end:         toISO(form.end,   form.allDay),
      allDay:      form.allDay,
      description: form.description || undefined,
      location:    form.location    || undefined,
      colorId:     form.colorId     || undefined,
      calendarId:  initialData?.calendarId,
    };

    try {
      const res = isEdit
        ? await fetch(`/api/google-calendar/events/${initialData!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/google-calendar/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Request failed (${res.status})`);
        return;
      }
      onSuccess();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  const colorEntries = Object.entries(GCAL_COLORS);

  return (
    <div className="space-y-3">
      <Input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Event title *"
        autoFocus
      />

      {/* All-day toggle */}
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.allDay}
          onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
          className="rounded"
        />
        All day
      </label>

      <div className="flex gap-2">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">Start</p>
          <Input
            type={form.allDay ? "date" : "datetime-local"}
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">End</p>
          <Input
            type={form.allDay ? "date" : "datetime-local"}
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
          />
        </div>
      </div>

      <Input
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        placeholder="Location"
      />

      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
        rows={2}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
      />

      {/* Color picker */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Colour</p>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setForm({ ...form, colorId: "" })}
            className={`w-6 h-6 rounded-full border-2 transition-all bg-blue-500 ${!form.colorId ? "border-foreground scale-110" : "border-transparent"}`}
            title="Calendar default"
          />
          {colorEntries.map(([id, hex]) => (
            <button
              key={id}
              onClick={() => setForm({ ...form, colorId: id })}
              className={`w-6 h-6 rounded-full border-2 transition-all ${form.colorId === id ? "border-foreground scale-110" : "border-transparent"}`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button onClick={submit} disabled={saving} className="flex-1">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
