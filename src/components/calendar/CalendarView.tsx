"use client";

import { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, type View, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { type CalendarEventDTO, AREA_COLORS } from "@/types";
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

export function CalendarView({ initialEvents }: Props) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<RBCEvent[]>(toRBCEvents(initialEvents));

  const fetchRange = useCallback(async (start: Date, end: Date) => {
    const res = await fetch(
      `/api/calendar?from=${start.toISOString()}&to=${end.toISOString()}`
    );
    const data: CalendarEventDTO[] = await res.json();
    setEvents(toRBCEvents(data));
  }, []);

  const handleRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      if (Array.isArray(range)) {
        fetchRange(range[0], range[range.length - 1]);
      } else {
        fetchRange(range.start, range.end);
      }
    },
    [fetchRange]
  );

  const eventStyleGetter = useCallback((event: RBCEvent) => {
    const bg = event.color ?? AREA_COLORS[event.area as keyof typeof AREA_COLORS] ?? "#6b7280";
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
        <div className="flex items-center justify-between mb-4">
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
    <div className="h-[calc(100vh-10rem)] [&_.rbc-calendar]:font-sans [&_.rbc-header]:text-xs [&_.rbc-header]:font-medium [&_.rbc-today]:bg-blue-50 [&_.rbc-off-range-bg]:bg-muted/30">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        allDayAccessor="allDay"
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        onRangeChange={handleRangeChange}
        eventPropGetter={eventStyleGetter}
        components={components as Record<string, unknown>}
        popup
      />
    </div>
  );
}
