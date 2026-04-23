"use client";

import { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, type View, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { type CalendarEventDTO, AREA_COLORS, AREA_LABELS } from "@/types";
import { ScheduleBlockForm } from "@/components/calendar/ScheduleBlockForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

interface RBCEvent extends Event {
  id: string;
  area: string;
  color: string | null;
  description: string | null;
  start: Date;
  end: Date;
  isWFH?: boolean;
  isRecurring?: boolean;
}

function toRBCEvents(events: CalendarEventDTO[]): RBCEvent[] {
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    start: new Date(e.start),
    end: new Date(e.end),
    allDay: e.allDay,
    area: e.area,
    color: e.color,
    description: e.description,
    isWFH: e.isWFH,
    isRecurring: e.isRecurring,
  }));
}

interface Props {
  initialEvents: CalendarEventDTO[];
  initialWfhDates?: string[]; // "YYYY-MM-DD" strings
}

const ALL_AREAS = Object.keys(AREA_LABELS);

// scroll to 7am on week/day view
const SCROLL_TO = new Date();
SCROLL_TO.setHours(7, 0, 0, 0);

const MIN_TIME = new Date();
MIN_TIME.setHours(5, 0, 0, 0);

const MAX_TIME = new Date();
MAX_TIME.setHours(23, 0, 0, 0);

export function CalendarView({ initialEvents, initialWfhDates = [] }: Props) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<RBCEvent[]>(toRBCEvents(initialEvents));
  const [visibleAreas, setVisibleAreas] = useState<Set<string>>(new Set(ALL_AREAS));
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [slotStart, setSlotStart] = useState<Date | undefined>();
  const [slotEnd, setSlotEnd] = useState<Date | undefined>();
  const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date } | null>(null);
  const [wfhDates, setWfhDates] = useState<Set<string>>(new Set(initialWfhDates));
  const [selectedEvent, setSelectedEvent] = useState<RBCEvent | null>(null);

  const fetchRange = useCallback(async (start: Date, end: Date) => {
    const res = await fetch(
      `/api/calendar?from=${start.toISOString()}&to=${end.toISOString()}`
    );
    const data: CalendarEventDTO[] = await res.json();
    setEvents(toRBCEvents(data));
    // Refresh WFH dates from the fetched data
    const wfhSet = new Set<string>();
    data.forEach((e) => {
      if (e.isWFH) {
        wfhSet.add(format(new Date(e.start), "yyyy-MM-dd"));
      }
    });
    // Also fetch WFH days explicitly to ensure state is correct
    const wfhRes = await fetch(
      `/api/schedule/wfh?from=${start.toISOString()}&to=${end.toISOString()}`
    );
    if (wfhRes.ok) {
      const wfhData: { date: string }[] = await wfhRes.json();
      const newSet = new Set(wfhData.map((d) => format(new Date(d.date), "yyyy-MM-dd")));
      setWfhDates(newSet);
    }
  }, []);

  const handleRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      let start: Date, end: Date;
      if (Array.isArray(range)) {
        start = range[0];
        end = range[range.length - 1];
      } else {
        start = range.start;
        end = range.end;
      }
      setCurrentRange({ start, end });
      fetchRange(start, end);
    },
    [fetchRange]
  );

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSlotStart(start);
    setSlotEnd(end);
    setScheduleOpen(true);
  }, []);

  const handleScheduleSuccess = useCallback(() => {
    setScheduleOpen(false);
    if (currentRange) fetchRange(currentRange.start, currentRange.end);
  }, [currentRange, fetchRange]);

  const toggleArea = useCallback((area: string) => {
    setVisibleAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  }, []);

  const toggleWfh = useCallback(async (dateStr: string) => {
    const isWFH = wfhDates.has(dateStr);
    if (isWFH) {
      await fetch(`/api/schedule/wfh/${encodeURIComponent(dateStr)}`, { method: "DELETE" });
      setWfhDates((prev) => {
        const next = new Set(prev);
        next.delete(dateStr);
        return next;
      });
    } else {
      await fetch("/api/schedule/wfh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr }),
      });
      setWfhDates((prev) => new Set([...prev, dateStr]));
    }
    // Re-fetch to update event titles
    if (currentRange) fetchRange(currentRange.start, currentRange.end);
  }, [wfhDates, currentRange, fetchRange]);

  const filteredEvents = useMemo(
    () => events.filter((e) => visibleAreas.has(e.area)),
    [events, visibleAreas]
  );

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
      },
    };
  }, []);

  // Custom date cell wrapper to show WFH toggle on weekdays
  const dateCellWrapper = useCallback(
    ({ value, children }: { value: Date; children: React.ReactNode }) => {
      const dayOfWeek = value.getDay();
      const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;
      const dateStr = format(value, "yyyy-MM-dd");
      const isToday = format(value, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      const isWFH = wfhDates.has(dateStr);

      return (
        <div className="relative flex-1 min-h-full">
          {children}
          {isWeekday && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleWfh(dateStr); }}
              title={isWFH ? "WFH — click to mark office day" : "Office — click to mark WFH"}
              className={`absolute top-1 right-1 z-10 text-xs leading-none transition-opacity ${
                isWFH ? "opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
              }`}
              style={{ fontSize: "14px" }}
            >
              {isWFH ? "🏠" : "🏢"}
            </button>
          )}
          {isToday && (
            <div className="absolute inset-0 ring-2 ring-purple-500 ring-inset pointer-events-none rounded-sm" />
          )}
        </div>
      );
    },
    [wfhDates, toggleWfh]
  );

  // Custom date header — highlights today's date number with a purple circle
  const dateHeaderComponent = useCallback(
    ({ date, label }: { date: Date; label: string }) => {
      const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      return (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full leading-none ${
            isToday
              ? "bg-purple-600 text-white font-bold"
              : "text-foreground"
          }`}
        >
          {label}
        </span>
      );
    },
    []
  );

  // Custom event component — shows time prefix on timed events so month view is useful
  const eventComponent = useCallback(({ event }: { event: RBCEvent }) => {
    const timeLabel = !event.allDay
      ? format(event.start, "HH:mm") + " "
      : "";
    return (
      <div
        className="truncate cursor-pointer"
        title={`${timeLabel}${event.title}${event.description ? `\n${event.description}` : ""}`}
      >
        {timeLabel && (
          <span className="opacity-80 font-semibold mr-0.5">{timeLabel}</span>
        )}
        {event.title as string}
      </div>
    );
  }, []);

  const components = useMemo(
    () => ({
      toolbar: (props: {
        label: string;
        onNavigate: (action: string) => void;
        onView: (view: View) => void;
        view: View;
      }) => (
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => props.onNavigate("PREV")}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => props.onNavigate("TODAY")}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => props.onNavigate("NEXT")}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors"
            >
              →
            </button>
            <span className="text-base font-semibold ml-2">{props.label}</span>
          </div>
          <div className="flex gap-1">
            {(["month", "day", "agenda"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => props.onView(v)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                  props.view === v
                    ? "bg-primary text-primary-foreground"
                    : "border hover:bg-accent"
                }`}
              >
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

  return (
    <div className="space-y-3">
      {/* Area filter chips */}
      <div className="flex flex-wrap gap-2">
        {ALL_AREAS.map((area) => {
          const color = AREA_COLORS[area];
          const active = visibleAreas.has(area);
          return (
            <button
              key={area}
              onClick={() => toggleArea(area)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                active ? "text-white border-transparent" : "bg-transparent text-muted-foreground border-border"
              }`}
              style={active ? { backgroundColor: color, borderColor: color } : {}}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: active ? "rgba(255,255,255,0.7)" : color }}
              />
              {AREA_LABELS[area]}
            </button>
          );
        })}
        <span className="flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground">
          🏠 = WFH day (click any weekday cell to toggle)
        </span>
      </div>

      <div
        className={`
          h-[calc(100vh-13rem)]
          [&_.rbc-calendar]:font-sans
          [&_.rbc-header]:text-xs [&_.rbc-header]:font-medium
          [&_.rbc-today]:bg-purple-900/30
          [&_.rbc-off-range-bg]:bg-muted/30
          [&_.rbc-month-view]:bg-card
          [&_.rbc-header]:bg-card
          [&_.rbc-time-view]:bg-card
          [&_.rbc-agenda-view]:bg-card
          [&_.rbc-day-bg]:bg-card
          [&_.rbc-show-more]:text-primary
          [&_.rbc-current-time-indicator]:bg-purple-500
          [&_.rbc-current-time-indicator]:h-0.5
          [&_.rbc-time-slot]:text-xs [&_.rbc-time-slot]:text-muted-foreground
          [&_.rbc-label]:text-xs [&_.rbc-label]:text-muted-foreground
          [&_.rbc-agenda-date-cell]:font-medium
          [&_.rbc-agenda-time-cell]:text-muted-foreground
          [&_.rbc-agenda-event-cell]:text-sm
          [&_.rbc-day-slot_.rbc-event]:min-h-[24px]
          [&_.rbc-event-label]:text-[10px] [&_.rbc-event-label]:font-medium
        `}
      >
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
          onSelectEvent={(event) => setSelectedEvent(event as RBCEvent)}
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

      {/* Add to calendar dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add to Calendar</DialogTitle>
          </DialogHeader>
          <ScheduleBlockForm
            initialStart={slotStart}
            initialEnd={slotEnd}
            onSuccess={handleScheduleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Event detail dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{selectedEvent?.title as string}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedEvent.color ?? AREA_COLORS[selectedEvent.area] ?? "#6b7280" }}
                />
                <span className="text-muted-foreground">
                  {AREA_LABELS[selectedEvent.area] ?? selectedEvent.area}
                  {selectedEvent.isRecurring && " · Recurring"}
                  {selectedEvent.isWFH && " · Working from home"}
                </span>
              </div>
              {!selectedEvent.allDay && (
                <p className="text-muted-foreground">
                  {format(selectedEvent.start, "EEE d MMM, HH:mm")}
                  {" – "}
                  {format(selectedEvent.end, "HH:mm")}
                </p>
              )}
              {selectedEvent.allDay && (
                <p className="text-muted-foreground">
                  {format(selectedEvent.start, "EEE d MMM")} · All day
                </p>
              )}
              {selectedEvent.description && (
                <p className="text-muted-foreground">{selectedEvent.description}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
