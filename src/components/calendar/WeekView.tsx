"use client";

import { useEffect, useRef, useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import type { CalEvent } from "./MonthView";

const AREA_COLOR: Record<string, string> = {
  DIET:     "oklch(0.80 0.14 145)",
  EXERCISE: "oklch(0.78 0.13 165)",
  LEARNING: "oklch(0.78 0.14 280)",
  HABITS:   "oklch(0.82 0.13 75)",
  SCHEDULE: "oklch(0.78 0.15 285)",
  WORK:     "oklch(0.78 0.15 285)",
  PERSONAL: "oklch(0.80 0.13 25)",
};

const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const START_HOUR = 7;
const END_HOUR   = 21;
const HOUR_PX    = 56;
const TOTAL_PX   = (END_HOUR - START_HOUR) * HOUR_PX;

function pxFromTime(h: number, m: number) {
  return ((h - START_HOUR) * 60 + m) / 60 * HOUR_PX;
}

interface Props {
  weekStart: Date;
  today: Date;
  events: CalEvent[];
  onSelectEvent: (e: CalEvent) => void;
  onSelectSlot: (start: Date, end: Date) => void;
}

export function WeekView({ weekStart, today, events, onSelectEvent, onSelectSlot }: Props) {
  const [nowTop, setNowTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setNowTop(pxFromTime(now.getHours(), now.getMinutes()));
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  // Group events by day
  const eventsByDay = new Map<string, CalEvent[]>();
  for (const e of events) {
    const key = format(e.start, "yyyy-MM-dd");
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(e);
  }

  const handleColumnClick = (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y    = e.clientY - rect.top;
    const mins = (y / HOUR_PX) * 60;
    const hour = Math.floor(mins / 60) + START_HOUR;
    const min  = Math.round((mins % 60) / 15) * 15;
    const start = new Date(day);
    start.setHours(hour, min, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    onSelectSlot(start, end);
  };

  return (
    <div ref={containerRef} style={{ overflowY: "auto", maxHeight: "calc(100vh - 240px)" }}>
      {/* Column headers */}
      <div
        className="grid sticky top-0 z-10"
        style={{
          gridTemplateColumns: `56px repeat(7, 1fr)`,
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ borderRight: "1px solid var(--border)" }} />
        {days.map((d, i) => {
          const isToday = format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          return (
            <div
              key={i}
              className="py-[10px] px-2 text-center"
              style={{ borderRight: i < 6 ? "1px solid var(--border)" : "none" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-jetbrains-mono, monospace)",
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-3)",
                }}
              >
                {DOW[i]}
              </div>
              {isToday ? (
                <div
                  className="inline-block rounded-[3px] font-semibold mt-0.5 px-1.5"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono, monospace)",
                    fontSize: 18,
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 600,
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {String(d.getDate()).padStart(2, "0")}
                </div>
              ) : (
                <div
                  className="mt-0.5"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono, monospace)",
                    fontSize: 18,
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 500,
                    color: "var(--foreground)",
                  }}
                >
                  {String(d.getDate()).padStart(2, "0")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div
        className="grid"
        style={{ gridTemplateColumns: `56px repeat(7, 1fr)` }}
      >
        {/* Time column */}
        <div style={{ borderRight: "1px solid var(--border)" }}>
          {hours.map((h) => (
            <div
              key={h}
              style={{
                height: HOUR_PX,
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                paddingRight: 8,
                paddingTop: 0,
                transform: "translateY(-6px)",
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: 9,
                letterSpacing: "0.06em",
                color: "var(--fg-3)",
              }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((d, di) => {
          const isToday = format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          const dayEvs  = eventsByDay.get(format(d, "yyyy-MM-dd")) ?? [];

          return (
            <div
              key={di}
              className="relative cursor-pointer"
              style={{
                height: TOTAL_PX,
                borderRight: di < 6 ? "1px solid var(--border)" : "none",
                borderBottom: "1px solid var(--border)",
                backgroundImage: `repeating-linear-gradient(to bottom, transparent calc(${HOUR_PX}px - 1px), var(--border) ${HOUR_PX}px)`,
                backgroundSize: `100% ${HOUR_PX}px`,
                backgroundColor: isToday
                  ? "color-mix(in oklab, var(--primary) 4%, transparent)"
                  : undefined,
              }}
              onClick={(e) => handleColumnClick(d, e)}
            >
              {dayEvs.map((ev) => {
                if (ev.allDay) return null;
                const startH = ev.start.getHours();
                const startM = ev.start.getMinutes();
                if (startH < START_HOUR || startH >= END_HOUR) return null;
                const top    = pxFromTime(startH, startM);
                const durMs  = ev.end.getTime() - ev.start.getTime();
                const durMin = durMs / 60000;
                const height = Math.max((durMin / 60) * HOUR_PX - 2, 20);
                const c      = ev.color ?? AREA_COLOR[ev.area] ?? "var(--primary)";
                return (
                  <div
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); onSelectEvent(ev); }}
                    className="absolute left-1 right-1 rounded-[2px] overflow-hidden cursor-pointer"
                    style={{
                      top,
                      height,
                      background: `color-mix(in oklab, ${c} 16%, var(--card))`,
                      borderLeft: `2px solid ${c}`,
                      padding: "4px 6px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains-mono, monospace)",
                        fontSize: 9,
                        color: "var(--fg-3)",
                        marginBottom: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {format(ev.start, "HH:mm")} · {Math.round(durMin / 60 * 10) / 10}h
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--foreground)",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ev.title}
                    </div>
                  </div>
                );
              })}

              {/* Now line */}
              {isToday && nowTop > 0 && nowTop < TOTAL_PX && (
                <div
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{ top: nowTop, height: 1, background: "var(--primary)", zIndex: 2 }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: -3,
                      top: -3,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--primary)",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
