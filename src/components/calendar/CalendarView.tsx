"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { type CalendarEventDTO, AREA_COLORS, AREA_LABELS } from "@/types";
import { GoogleEventForm } from "@/components/calendar/GoogleEventForm";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MonthView, type CalEvent } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { TodayRail } from "@/components/calendar/TodayRail";

// ── Types ─────────────────────────────────────────────────────────────────────

type View = "month" | "week";

type GCalEventDTO = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  description?: string | null;
  location?: string | null;
  colorId?: string | null;
  color?: string | null;
  calendarId: string;
};

interface InternalEvent extends CalEvent {
  description: string | null;
  location?: string | null;
  colorId?: string | null;
  calendarId?: string;
  isGoogleEvent: boolean;
  isRecurring?: boolean;
}

const GCAL_DEFAULT_COLOR = "oklch(0.62 0.14 250)";

const ALL_AREAS = Object.keys(AREA_LABELS);

const CAT_LIST: Array<{ id: string; label: string; color: string }> = [
  { id: "DIET",     label: "Diet",     color: "oklch(0.80 0.14 145)" },
  { id: "EXERCISE", label: "Exercise", color: "oklch(0.78 0.13 165)" },
  { id: "LEARNING", label: "Learning", color: "oklch(0.78 0.14 280)" },
  { id: "HABITS",   label: "Habits",   color: "oklch(0.82 0.13 75)"  },
  { id: "SCHEDULE", label: "Calendar", color: "oklch(0.78 0.15 285)" },
];

const MONTHS_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Converters ────────────────────────────────────────────────────────────────

function gcalToInternal(e: GCalEventDTO): InternalEvent {
  return {
    id: e.id,
    title: e.title,
    start: new Date(e.start),
    end: new Date(e.end),
    allDay: e.allDay,
    area: "SCHEDULE",
    color: e.color ?? GCAL_DEFAULT_COLOR,
    description: e.description ?? null,
    location: e.location ?? null,
    colorId: e.colorId ?? null,
    calendarId: e.calendarId,
    isGoogleEvent: true,
  };
}

function domainToInternal(e: CalendarEventDTO): InternalEvent {
  return {
    id: e.id,
    title: e.title,
    start: new Date(e.start),
    end: new Date(e.end),
    allDay: e.allDay,
    area: e.area,
    color: e.color ?? null,
    description: e.description ?? null,
    isGoogleEvent: false,
    isWFH: e.isWFH,
    isRecurring: e.isRecurring,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  initialEvents: CalendarEventDTO[];
  initialWfhDates?: string[];
}

export function CalendarView({ initialEvents, initialWfhDates = [] }: Props) {
  const today = new Date();
  const [view, setView]     = useState<View>("month");
  const [date, setDate]     = useState(new Date());
  const [events, setEvents] = useState<InternalEvent[]>(initialEvents.map(domainToInternal));
  const [visibleAreas, setVisibleAreas] = useState<Set<string>>(new Set([...ALL_AREAS, "SCHEDULE"]));
  const [wfhDates, setWfhDates]         = useState<Set<string>>(new Set(initialWfhDates));

  // Create / edit
  const [createOpen, setCreateOpen]   = useState(false);
  const [slotStart, setSlotStart]     = useState<Date | undefined>();
  const [slotEnd, setSlotEnd]         = useState<Date | undefined>();
  const [editingEvent, setEditingEvent] = useState<InternalEvent | null>(null);

  // Detail view
  const [selectedEvent, setSelectedEvent] = useState<InternalEvent | null>(null);
  const [deleting, setDeleting]           = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchRange = useCallback(async (start: Date, end: Date) => {
    const qs = `from=${start.toISOString()}&to=${end.toISOString()}`;
    const [gcalRes, domainRes, wfhRes] = await Promise.all([
      fetch(`/api/google-calendar/events?${qs}`),
      fetch(`/api/calendar?${qs}`),
      fetch(`/api/schedule/wfh?${qs}`),
    ]);
    const gcalEvents: GCalEventDTO[]       = gcalRes.ok  ? await gcalRes.json()  : [];
    const domainEvents: CalendarEventDTO[] = domainRes.ok ? await domainRes.json() : [];
    const wfhData: { date: string }[]      = wfhRes.ok   ? await wfhRes.json()   : [];
    const filteredDomain = domainEvents.filter((e) => e.area !== "SCHEDULE");
    setEvents([
      ...gcalEvents.map(gcalToInternal),
      ...filteredDomain.map(domainToInternal),
    ]);
    setWfhDates(new Set(wfhData.map((d) => format(new Date(d.date), "yyyy-MM-dd"))));
  }, []);

  useEffect(() => {
    let start: Date, end: Date;
    if (view === "month") {
      start = startOfMonth(date);
      end   = endOfMonth(date);
    } else {
      start = startOfWeek(date, { weekStartsOn: 1 });
      end   = endOfWeek(date,   { weekStartsOn: 1 });
    }
    fetchRange(start, end);
  }, [date, view, fetchRange]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNext  = () => setDate((d) => view === "month" ? addMonths(d, 1) : addWeeks(d, 1));
  const goPrev  = () => setDate((d) => view === "month" ? subMonths(d, 1) : subWeeks(d, 1));
  const goToday = () => setDate(new Date());

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleSelectSlot = (start: Date, end: Date) => {
    setSlotStart(start);
    setSlotEnd(end);
    setEditingEvent(null);
    setCreateOpen(true);
  };

  const handleSelectDay = (day: Date) => {
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(10, 0, 0, 0);
    handleSelectSlot(start, end);
  };

  const handleFormSuccess = useCallback(() => {
    setCreateOpen(false);
    setEditingEvent(null);
    const start = view === "month" ? startOfMonth(date) : startOfWeek(date, { weekStartsOn: 1 });
    const end   = view === "month" ? endOfMonth(date)   : endOfWeek(date,   { weekStartsOn: 1 });
    fetchRange(start, end);
  }, [view, date, fetchRange]);

  const handleDeleteEvent = useCallback(async (event: InternalEvent) => {
    if (!event.isGoogleEvent) return;
    setDeleting(true);
    await fetch(
      `/api/google-calendar/events/${event.id}?calendarId=${event.calendarId ?? "primary"}`,
      { method: "DELETE" }
    );
    setDeleting(false);
    setSelectedEvent(null);
    handleFormSuccess();
  }, [handleFormSuccess]);

  const toggleWfh = useCallback(async (dateStr: string) => {
    const isWFH = wfhDates.has(dateStr);
    if (isWFH) {
      await fetch(`/api/schedule/wfh/${encodeURIComponent(dateStr)}`, { method: "DELETE" });
      setWfhDates((prev) => { const n = new Set(prev); n.delete(dateStr); return n; });
    } else {
      await fetch("/api/schedule/wfh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr }),
      });
      setWfhDates((prev) => new Set([...prev, dateStr]));
    }
    handleFormSuccess();
  }, [wfhDates, handleFormSuccess]);

  const toggleArea = (area: string) => {
    setVisibleAreas((prev) => {
      const n = new Set(prev);
      if (n.has(area)) n.delete(area); else n.add(area);
      return n;
    });
  };

  const filteredEvents = useMemo(
    () => events.filter((e) => visibleAreas.has(e.area)),
    [events, visibleAreas]
  );

  // ── Label ─────────────────────────────────────────────────────────────────

  const weekStart = startOfWeek(date, { weekStartsOn: 1 });

  return (
    <div>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-[14px]"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="inline-flex items-center justify-center"
            style={{
              width: 28, height: 28,
              border: "1px solid var(--hairline-strong, oklch(1 0 0 / 0.12))",
              borderRadius: 4,
              background: "transparent",
              color: "var(--fg-2)",
              cursor: "pointer",
            }}
          >
            <ChevronLeft style={{ width: 13, height: 13 }} />
          </button>
          <button
            onClick={goToday}
            style={{
              height: 30, padding: "0 12px",
              fontSize: 12, fontWeight: 500,
              border: "1px solid var(--hairline-strong, oklch(1 0 0 / 0.12))",
              borderRadius: 4,
              background: "transparent",
              color: "var(--fg-2)",
              cursor: "pointer",
            }}
          >
            Today
          </button>
          <button
            onClick={goNext}
            className="inline-flex items-center justify-center"
            style={{
              width: 28, height: 28,
              border: "1px solid var(--hairline-strong, oklch(1 0 0 / 0.12))",
              borderRadius: 4,
              background: "transparent",
              color: "var(--fg-2)",
              cursor: "pointer",
            }}
          >
            <ChevronRight style={{ width: 13, height: 13 }} />
          </button>
          <div className="ml-3" style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em" }}>
            {view === "month"
              ? MONTHS_FULL[date.getMonth()]
              : `${format(weekStart, "MMM d")} — ${format(endOfWeek(date, { weekStartsOn: 1 }), "MMM d")}`}
            <span
              className="ml-2"
              style={{
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: 13,
                color: "var(--fg-3)",
                fontWeight: 400,
              }}
            >
              {date.getFullYear()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View tabs */}
          <div
            className="inline-flex overflow-hidden"
            style={{
              border: "1px solid var(--hairline-strong, oklch(1 0 0 / 0.12))",
              borderRadius: 4,
            }}
          >
            {(["month", "week"] as View[]).map((v, i) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "5px 12px",
                  fontFamily: "var(--font-jetbrains-mono, monospace)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: view === v ? "var(--foreground)" : "var(--fg-3)",
                  background: view === v ? "var(--muted)" : "transparent",
                  border: "none",
                  borderRight: i === 0 ? "1px solid var(--hairline-strong, oklch(1 0 0 / 0.12))" : "none",
                  cursor: "pointer",
                }}
              >
                {v}
              </button>
            ))}
          </div>

          {/* New event */}
          <button
            onClick={() => { setEditingEvent(null); setSlotStart(undefined); setSlotEnd(undefined); setCreateOpen(true); }}
            className="inline-flex items-center gap-1.5"
            style={{
              height: 30, padding: "0 12px",
              fontSize: 12, fontWeight: 500,
              borderRadius: 4,
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus style={{ width: 13, height: 13 }} />
            New event
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div
        className="flex flex-wrap items-center gap-0 px-4 py-[10px]"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {CAT_LIST.map((c) => {
          const on = visibleAreas.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggleArea(c.id)}
              className="inline-flex items-center gap-1.5"
              style={{
                padding: "5px 12px",
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: on ? "var(--foreground)" : "var(--fg-3)",
                background: "transparent",
                border: "none",
                borderBottom: on ? "1px solid currentColor" : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: c.color,
                  opacity: on ? 1 : 0.35,
                }}
              />
              {c.label}
            </button>
          );
        })}
        <span className="flex-1" />
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono, monospace)",
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "var(--fg-3)",
            textTransform: "uppercase",
            padding: "5px 0",
          }}
        >
          WFH · hover day to toggle
        </span>
      </div>

      {/* Calendar body + rail */}
      <div className="flex gap-4 p-4">
        <div
          className="flex-1 rounded-[6px] overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {view === "month" ? (
            <MonthView
              year={date.getFullYear()}
              month={date.getMonth()}
              today={today}
              events={filteredEvents}
              wfhDates={wfhDates}
              onSelectDay={handleSelectDay}
              onSelectEvent={(e) => setSelectedEvent(e as InternalEvent)}
              onToggleWfh={toggleWfh}
            />
          ) : (
            <WeekView
              weekStart={weekStart}
              today={today}
              events={filteredEvents}
              onSelectEvent={(e) => setSelectedEvent(e as InternalEvent)}
              onSelectSlot={handleSelectSlot}
            />
          )}
        </div>

        {/* Today rail */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <TodayRail today={today} events={events} wfhDates={wfhDates} />
        </div>
      </div>

      {/* Create / edit dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); setEditingEvent(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit event" : "New Google Calendar event"}</DialogTitle>
          </DialogHeader>
          <GoogleEventForm
            initialStart={slotStart}
            initialEnd={slotEnd}
            initialData={
              editingEvent
                ? {
                    id: editingEvent.id,
                    title: editingEvent.title as string,
                    start: editingEvent.start.toISOString(),
                    end: editingEvent.end.toISOString(),
                    allDay: editingEvent.allDay,
                    description: editingEvent.description ?? "",
                    location: editingEvent.location ?? "",
                    colorId: editingEvent.colorId ?? "",
                    calendarId: editingEvent.calendarId,
                  }
                : undefined
            }
            onSuccess={handleFormSuccess}
            onCancel={() => { setCreateOpen(false); setEditingEvent(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Event detail dialog */}
      <Dialog
        open={!!selectedEvent && !createOpen}
        onOpenChange={(o) => { if (!o) setSelectedEvent(null); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base pr-6">{selectedEvent?.title as string}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      selectedEvent.color ??
                      AREA_COLORS[selectedEvent.area] ??
                      "#6b7280",
                  }}
                />
                <span className="text-muted-foreground">
                  {selectedEvent.isGoogleEvent
                    ? "Google Calendar"
                    : (AREA_LABELS[selectedEvent.area] ?? selectedEvent.area)}
                  {selectedEvent.isRecurring && " · Recurring"}
                  {selectedEvent.isWFH && " · Working from home"}
                </span>
              </div>
              {!selectedEvent.allDay && (
                <p className="text-muted-foreground">
                  {format(selectedEvent.start, "EEE d MMM, HH:mm")} –{" "}
                  {format(selectedEvent.end, "HH:mm")}
                </p>
              )}
              {selectedEvent.allDay && (
                <p className="text-muted-foreground">
                  {format(selectedEvent.start, "EEE d MMM")} · All day
                </p>
              )}
              {selectedEvent.location && (
                <p className="text-muted-foreground">📍 {selectedEvent.location}</p>
              )}
              {selectedEvent.description && (
                <p className="text-muted-foreground">{selectedEvent.description}</p>
              )}
              {selectedEvent.isGoogleEvent && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setEditingEvent(selectedEvent);
                      setSelectedEvent(null);
                      setCreateOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    disabled={deleting}
                    onClick={() => handleDeleteEvent(selectedEvent)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    {deleting ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
