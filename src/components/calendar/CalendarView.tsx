"use client";

import { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, type View, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
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
  }));
}

interface Props {
  initialEvents: CalendarEventDTO[];
}

const ALL_AREAS = Object.keys(AREA_LABELS);

export function CalendarView({ initialEvents }: Props) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<RBCEvent[]>(toRBCEvents(initialEvents));
  const [visibleAreas, setVisibleAreas] = useState<Set<string>>(new Set(ALL_AREAS));
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [slotStart, setSlotStart] = useState<Date | undefined>();
  const [slotEnd, setSlotEnd] = useState<Date | undefined>();
  const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date } | null>(null);

  const fetchRange = useCallback(async (start: Date, end: Date) => {
    const res = await fetch(
      `/api/calendar?from=${start.toISOString()}&to=${end.toISOString()}`
    );
    const data: CalendarEventDTO[] = await res.json();
    setEvents(toRBCEvents(data));
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
        padding: "1px 4px",
      },
    };
  }, []);

  const components = useMemo(
    () => ({
      toolbar: (props: { label: string; onNavigate: (action: string) => void; onView: (view: View) => void; view: View }) => (
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
            {(["month", "week", "day", "agenda"] as View[]).map((v) => (
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
    }),
    []
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
      </div>

      <div className="h-[calc(100vh-12rem)] [&_.rbc-calendar]:font-sans [&_.rbc-header]:text-xs [&_.rbc-header]:font-medium [&_.rbc-today]:bg-purple-900/20 [&_.rbc-off-range-bg]:bg-muted/30 [&_.rbc-month-view]:bg-card [&_.rbc-header]:bg-card [&_.rbc-time-view]:bg-card [&_.rbc-agenda-view]:bg-card [&_.rbc-day-bg]:bg-card [&_.rbc-show-more]:text-primary">
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
          eventPropGetter={eventStyleGetter}
          components={components as Record<string, unknown>}
          selectable
          popup
        />
      </div>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
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
    </div>
  );
}
