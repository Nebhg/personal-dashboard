"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { Calendar, dateFnsLocalizer, type View, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
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
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface RBCEvent extends Event {
  id: string;
  area: string;
  color: string | null;
  description: string | null;
  location?: string | null;
  colorId?: string | null;
  calendarId?: string;
  start: Date;
  end: Date;
  isGoogleEvent?: boolean;
  isWFH?: boolean;
  isRecurring?: boolean;
}

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const GCAL_DEFAULT_COLOR = "#4285f4"; // Google blue

function gcalToRBC(e: GCalEventDTO): RBCEvent {
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

function domainToRBC(e: CalendarEventDTO): RBCEvent {
  return {
    id: e.id,
    title: e.title as string,
    start: new Date(e.start),
    end: new Date(e.end),
    allDay: e.allDay,
    area: e.area,
    color: e.color ?? null,
    description: e.description ?? null,
    isWFH: e.isWFH,
    isRecurring: e.isRecurring,
    isGoogleEvent: false,
  };
}

const SCROLL_TO = new Date(); SCROLL_TO.setHours(7, 0, 0, 0);
const MIN_TIME   = new Date(); MIN_TIME.setHours(5, 0, 0, 0);
const MAX_TIME   = new Date(); MAX_TIME.setHours(23, 0, 0, 0);

// Areas shown in filter chips — SCHEDULE = Google Calendar events
const ALL_AREAS = Object.keys(AREA_LABELS);

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  initialEvents: CalendarEventDTO[];
  initialWfhDates?: string[];
}

export function CalendarView({ initialEvents, initialWfhDates = [] }: Props) {
  const [view, setView]       = useState<View>("month");
  const [date, setDate]       = useState(new Date());
  const [events, setEvents]   = useState<RBCEvent[]>(initialEvents.map(domainToRBC));
  const [visibleAreas, setVisibleAreas] = useState<Set<string>>(new Set(ALL_AREAS));
  const [wfhDates, setWfhDates] = useState<Set<string>>(new Set(initialWfhDates));
  const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date } | null>(null);

  // Google event create/edit
  const [createOpen, setCreateOpen]   = useState(false);
  const [slotStart, setSlotStart]     = useState<Date | undefined>();
  const [slotEnd, setSlotEnd]         = useState<Date | undefined>();
  const [editingEvent, setEditingEvent] = useState<RBCEvent | null>(null);

  // Event detail view
  const [selectedEvent, setSelectedEvent] = useState<RBCEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchRange = useCallback(async (start: Date, end: Date) => {
    const qs = `from=${start.toISOString()}&to=${end.toISOString()}`;
    const [gcalRes, domainRes, wfhRes] = await Promise.all([
      fetch(`/api/google-calendar/events?${qs}`),
      fetch(`/api/calendar?${qs}`),
      fetch(`/api/schedule/wfh?${qs}`),
    ]);

    const gcalEvents: GCalEventDTO[]   = gcalRes.ok  ? await gcalRes.json()  : [];
    const domainEvents: CalendarEventDTO[] = domainRes.ok ? await domainRes.json() : [];
    const wfhData: { date: string }[]  = wfhRes.ok   ? await wfhRes.json()   : [];

    // Domain events excluding old SCHEDULE blocks (replaced by Google Calendar)
    const filteredDomain = domainEvents.filter((e) => e.area !== "SCHEDULE");

    setEvents([
      ...gcalEvents.map(gcalToRBC),
      ...filteredDomain.map(domainToRBC),
    ]);
    setWfhDates(new Set(wfhData.map((d) => format(new Date(d.date), "yyyy-MM-dd"))));
  }, []);

  const handleRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      let start: Date, end: Date;
      if (Array.isArray(range)) { start = range[0]; end = range[range.length - 1]; }
      else { start = range.start; end = range.end; }
      setCurrentRange({ start, end });
      fetchRange(start, end);
    },
    [fetchRange]
  );

  // ── Initial fetch on mount (onRangeChange doesn't fire until navigation) ─────

  useEffect(() => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    setCurrentRange({ start, end });
    fetchRange(start, end);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Event CRUD ───────────────────────────────────────────────────────────────

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSlotStart(start);
    setSlotEnd(end);
    setEditingEvent(null);
    setCreateOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setCreateOpen(false);
    setEditingEvent(null);
    if (currentRange) fetchRange(currentRange.start, currentRange.end);
  }, [currentRange, fetchRange]);

  const handleDeleteEvent = useCallback(async (event: RBCEvent) => {
    if (!event.isGoogleEvent) return;
    setDeleting(true);
    await fetch(
      `/api/google-calendar/events/${event.id}?calendarId=${event.calendarId ?? "primary"}`,
      { method: "DELETE" }
    );
    setDeleting(false);
    setSelectedEvent(null);
    if (currentRange) fetchRange(currentRange.start, currentRange.end);
  }, [currentRange, fetchRange]);

  // ── WFH toggle ───────────────────────────────────────────────────────────────

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
    if (currentRange) fetchRange(currentRange.start, currentRange.end);
  }, [wfhDates, currentRange, fetchRange]);

  // ── Filter ───────────────────────────────────────────────────────────────────

  const toggleArea = useCallback((area: string) => {
    setVisibleAreas((prev) => {
      const n = new Set(prev);
      if (n.has(area)) n.delete(area); else n.add(area);
      return n;
    });
  }, []);

  const filteredEvents = useMemo(
    () => events.filter((e) => visibleAreas.has(e.area)),
    [events, visibleAreas]
  );

  // ── Styling ──────────────────────────────────────────────────────────────────

  const eventStyleGetter = useCallback((event: RBCEvent) => {
    const bg = event.color ?? AREA_COLORS[event.area] ?? "#6b7280";
    return {
      style: {
        backgroundColor: bg,
        border: "none",
        borderRadius: "4px",
        color: "white",
        fontSize: "0.75rem",
        padding: "2px 5px",
        opacity: event.isGoogleEvent ? 1 : 0.75,
      },
    };
  }, []);

  // ── Custom components ────────────────────────────────────────────────────────

  const dateCellWrapper = useCallback(
    ({ value, children }: { value: Date; children: React.ReactNode }) => {
      const dayOfWeek = value.getDay();
      const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;
      const dateStr = format(value, "yyyy-MM-dd");
      const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
      const isWFH = wfhDates.has(dateStr);
      return (
        <div className="relative flex-1 min-h-full">
          {children}
          {isWeekday && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleWfh(dateStr); }}
              title={isWFH ? "WFH — click to mark office" : "Office — click to mark WFH"}
              className={`absolute top-1 right-1 z-10 text-xs leading-none transition-opacity ${isWFH ? "opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"}`}
              style={{ fontSize: "14px" }}
            >
              {isWFH ? "🏠" : "🏢"}
            </button>
          )}
          {isToday && <div className="absolute inset-0 ring-2 ring-purple-500 ring-inset pointer-events-none rounded-sm" />}
        </div>
      );
    },
    [wfhDates, toggleWfh]
  );

  const dateHeaderComponent = useCallback(
    ({ date: d, label }: { date: Date; label: string }) => {
      const isToday = format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      return (
        <span className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full leading-none ${isToday ? "bg-purple-600 text-white font-bold" : "text-foreground"}`}>
          {label}
        </span>
      );
    }, []
  );

  const eventComponent = useCallback(({ event }: { event: RBCEvent }) => {
    const timeLabel = !event.allDay ? format(event.start, "HH:mm") + " " : "";
    return (
      <div className="truncate cursor-pointer" title={`${timeLabel}${event.title as string}${event.description ? `\n${event.description}` : ""}`}>
        {timeLabel && <span className="opacity-80 font-semibold mr-0.5">{timeLabel}</span>}
        {event.title as string}
      </div>
    );
  }, []);

  const components = useMemo(
    () => ({
      toolbar: (props: { label: string; onNavigate: (a: string) => void; onView: (v: View) => void; view: View }) => (
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => props.onNavigate("PREV")} className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors">←</button>
            <button onClick={() => props.onNavigate("TODAY")} className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors">Today</button>
            <button onClick={() => props.onNavigate("NEXT")} className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors">→</button>
            <span className="text-base font-semibold ml-2">{props.label}</span>
          </div>
          <div className="flex gap-1">
            {(["month", "week", "day", "agenda"] as View[]).map((v) => (
              <button key={v} onClick={() => props.onView(v)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${props.view === v ? "bg-primary text-primary-foreground" : "border hover:bg-accent"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      ),
      dateCellWrapper,
      event: eventComponent,
      dateHeader: dateHeaderComponent,
    }),
    [dateCellWrapper, eventComponent, dateHeaderComponent]
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        {ALL_AREAS.map((area) => {
          const color = area === "SCHEDULE" ? GCAL_DEFAULT_COLOR : AREA_COLORS[area];
          const active = visibleAreas.has(area);
          return (
            <button key={area} onClick={() => toggleArea(area)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${active ? "text-white border-transparent" : "bg-transparent text-muted-foreground border-border"}`}
              style={active ? { backgroundColor: color, borderColor: color } : {}}>
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: active ? "rgba(255,255,255,0.7)" : color }} />
              {area === "SCHEDULE" ? "Google Calendar" : AREA_LABELS[area]}
            </button>
          );
        })}
        <span className="flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground">
          🏠 = WFH (click weekday to toggle)
        </span>
      </div>

      {/* Calendar */}
      <div className={`
        h-[calc(100vh-13rem)]
        [&_.rbc-calendar]:font-sans [&_.rbc-header]:text-xs [&_.rbc-header]:font-medium
        [&_.rbc-today]:bg-purple-900/30 [&_.rbc-off-range-bg]:bg-muted/30
        [&_.rbc-month-view]:bg-card [&_.rbc-header]:bg-card [&_.rbc-time-view]:bg-card
        [&_.rbc-agenda-view]:bg-card [&_.rbc-day-bg]:bg-card [&_.rbc-show-more]:text-primary
        [&_.rbc-current-time-indicator]:bg-purple-500 [&_.rbc-current-time-indicator]:h-0.5
        [&_.rbc-time-slot]:text-xs [&_.rbc-time-slot]:text-muted-foreground
        [&_.rbc-label]:text-xs [&_.rbc-label]:text-muted-foreground
        [&_.rbc-agenda-date-cell]:font-medium [&_.rbc-agenda-time-cell]:text-muted-foreground
        [&_.rbc-agenda-event-cell]:text-sm [&_.rbc-day-slot_.rbc-event]:min-h-[24px]
        [&_.rbc-event-label]:text-[10px] [&_.rbc-event-label]:font-medium
      `}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          allDayAccessor="allDay"
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          onRangeChange={handleRangeChange}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(e) => setSelectedEvent(e as RBCEvent)}
          eventPropGetter={eventStyleGetter}
          components={components as Record<string, unknown>}
          selectable
          popup
          scrollToTime={SCROLL_TO}
          min={MIN_TIME}
          max={MAX_TIME}
          step={15}
          timeslots={4}
        />
      </div>

      {/* Create event dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) setCreateOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit event" : "New Google Calendar event"}</DialogTitle>
          </DialogHeader>
          <GoogleEventForm
            initialStart={slotStart}
            initialEnd={slotEnd}
            initialData={editingEvent ? {
              id: editingEvent.id,
              title: editingEvent.title as string,
              start: editingEvent.start.toISOString(),
              end: editingEvent.end.toISOString(),
              allDay: editingEvent.allDay,
              description: editingEvent.description ?? "",
              location: editingEvent.location ?? "",
              colorId: editingEvent.colorId ?? "",
              calendarId: editingEvent.calendarId,
            } : undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => { setCreateOpen(false); setEditingEvent(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Event detail dialog */}
      <Dialog open={!!selectedEvent && !createOpen} onOpenChange={(o) => { if (!o) setSelectedEvent(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base pr-6">{selectedEvent?.title as string}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedEvent.color ?? AREA_COLORS[selectedEvent.area] ?? "#6b7280" }} />
                <span className="text-muted-foreground">
                  {selectedEvent.isGoogleEvent ? "Google Calendar" : (AREA_LABELS[selectedEvent.area] ?? selectedEvent.area)}
                  {selectedEvent.isRecurring && " · Recurring"}
                  {selectedEvent.isWFH && " · Working from home"}
                </span>
              </div>
              {!selectedEvent.allDay && (
                <p className="text-muted-foreground">
                  {format(selectedEvent.start, "EEE d MMM, HH:mm")} – {format(selectedEvent.end, "HH:mm")}
                </p>
              )}
              {selectedEvent.allDay && (
                <p className="text-muted-foreground">{format(selectedEvent.start, "EEE d MMM")} · All day</p>
              )}
              {selectedEvent.location && (
                <p className="text-muted-foreground">📍 {selectedEvent.location}</p>
              )}
              {selectedEvent.description && (
                <p className="text-muted-foreground">{selectedEvent.description}</p>
              )}
              {selectedEvent.isGoogleEvent && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1"
                    onClick={() => { setEditingEvent(selectedEvent); setSelectedEvent(null); setCreateOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1"
                    disabled={deleting}
                    onClick={() => handleDeleteEvent(selectedEvent)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> {deleting ? "Deleting…" : "Delete"}
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
