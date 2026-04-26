"use client";

import { format } from "date-fns";
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

interface Props {
  today: Date;
  events: CalEvent[];
  wfhDates: Set<string>;
}

export function TodayRail({ today, events, wfhDates }: Props) {
  const nowMs = today.getTime();
  const todayStr = format(today, "yyyy-MM-dd");
  const isWfh = wfhDates.has(todayStr);

  const todayEvs = events
    .filter((e) => !e.allDay && format(e.start, "yyyy-MM-dd") === todayStr)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const bookedMin = todayEvs.reduce((s, e) => s + (e.end.getTime() - e.start.getTime()) / 60000, 0);
  const freeMin   = Math.max(0, (22 - 7) * 60 - bookedMin);

  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="rounded-[6px] overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono, monospace)",
            fontSize: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--fg-3)",
          }}
        >
          Today · {dateStr}
        </div>
        <div
          className="mt-1.5"
          style={{ fontSize: 12, fontWeight: 600, letterSpacing: "-0.005em" }}
        >
          Up next
        </div>
      </div>

      {todayEvs.length === 0 ? (
        <p className="label text-center py-4">No events today</p>
      ) : (
        <div
          className="relative flex flex-col"
          style={{ "--rail-line": "1px" } as React.CSSProperties}
        >
          {/* Hairline connector */}
          <div
            className="absolute"
            style={{
              left: 38,
              top: 6,
              bottom: 6,
              width: 1,
              background: "var(--border)",
            }}
          />

          {todayEvs.map((e) => {
            const isPast = e.end.getTime() < nowMs;
            const isNow  = e.start.getTime() <= nowMs && e.end.getTime() >= nowMs;
            const c      = e.color ?? AREA_COLOR[e.area] ?? "var(--primary)";
            const durMin = Math.round((e.end.getTime() - e.start.getTime()) / 60000);

            return (
              <div
                key={e.id}
                className="relative grid"
                style={{
                  gridTemplateColumns: "38px 1fr",
                  gap: 10,
                  padding: "8px 0",
                  opacity: isPast ? 0.4 : 1,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono, monospace)",
                    fontSize: 10,
                    color: isNow ? "var(--primary)" : "var(--fg-3)",
                    textAlign: "right",
                    paddingTop: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {format(e.start, "HH:mm")}
                </div>
                <div
                  style={{
                    borderLeft: `2px solid ${c}`,
                    paddingLeft: 10,
                    marginLeft: 4,
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                    {e.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono, monospace)",
                      fontSize: 9,
                      color: "var(--fg-3)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}
                  >
                    {e.area} · {durMin >= 60 ? `${durMin / 60}h` : `${durMin}m`}
                  </div>
                </div>

                {/* Now dot */}
                {isNow && (
                  <div
                    style={{
                      position: "absolute",
                      left: 35,
                      top: 13,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      border: "2px solid var(--background)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "Booked", value: `${Math.floor(bookedMin / 60)}h ${bookedMin % 60}m` },
          { label: "Free",   value: `${Math.floor(freeMin / 60)}h ${Math.floor(freeMin % 60)}m` },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-3)",
                fontWeight: 500,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono, monospace)",
                fontSize: 11,
                fontVariantNumeric: "tabular-nums",
                color: "var(--fg-2)",
              }}
            >
              {value}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--fg-3)",
              fontWeight: 500,
            }}
          >
            Mode
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              fontSize: 11,
              color: "var(--primary)",
            }}
          >
            {isWfh ? "WFH" : "Office"}
          </span>
        </div>
      </div>
    </div>
  );
}
