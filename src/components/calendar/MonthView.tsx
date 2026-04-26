"use client";

import { format } from "date-fns";

export interface CalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  area: string;
  color: string | null;
  isGoogleEvent?: boolean;
  isWFH?: boolean;
}

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

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function startDow(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon = 0
}

interface Props {
  year: number;
  month: number;
  today: Date;
  events: CalEvent[];
  wfhDates: Set<string>;
  onSelectDay: (date: Date) => void;
  onSelectEvent: (e: CalEvent) => void;
  onToggleWfh: (dateStr: string) => void;
}

export function MonthView({
  year,
  month,
  today,
  events,
  wfhDates,
  onSelectDay,
  onSelectEvent,
  onToggleWfh,
}: Props) {
  const dim     = daysInMonth(year, month);
  const sd      = startDow(year, month);
  const prevDim = daysInMonth(year, month - 1);

  const cells: Array<{ d: number; out: boolean }> = [];
  for (let i = 0; i < sd; i++) cells.push({ d: prevDim - sd + i + 1, out: true });
  for (let d = 1; d <= dim; d++) cells.push({ d, out: false });
  while (cells.length % 7 !== 0) cells.push({ d: cells.length - sd - dim + 1, out: true });

  const eventMap = new Map<string, CalEvent[]>();
  for (const e of events) {
    const key = format(e.start, "yyyy-MM-dd");
    if (!eventMap.has(key)) eventMap.set(key, []);
    eventMap.get(key)!.push(e);
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
    >
      {/* Day-of-week headers */}
      {DOW.map((d) => (
        <div
          key={d}
          className="px-[10px] py-2"
          style={{
            fontFamily: "var(--font-jetbrains-mono, monospace)",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-3, oklch(0.58 0.01 240))",
            borderBottom: "1px solid var(--border)",
            borderRight: "1px solid var(--border)",
          }}
        >
          {d}
        </div>
      ))}

      {/* Day cells */}
      {cells.map((c, i) => {
        const dateKey   = `${year}-${String(month + 1).padStart(2, "0")}-${String(c.d).padStart(2, "0")}`;
        const altKey    = `${year}-${month}-${c.d}`;
        const evs = !c.out
          ? (eventMap.get(format(new Date(year, month, c.d), "yyyy-MM-dd")) ?? [])
          : [];
        const isToday   = !c.out && c.d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const dow       = new Date(year, month, c.d).getDay();
        const isWeekend = dow === 0 || dow === 6;
        const isWfh     = !c.out && !isWeekend && wfhDates.has(format(new Date(year, month, c.d), "yyyy-MM-dd"));
        const isLastCol = (i + 1) % 7 === 0;

        return (
          <div
            key={i}
            onClick={() => !c.out && onSelectDay(new Date(year, month, c.d))}
            className="group relative flex flex-col gap-1 transition-colors cursor-pointer"
            style={{
              padding: "8px 10px 10px",
              minHeight: 110,
              borderRight: isLastCol ? "none" : "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              background: c.out
                ? "color-mix(in oklab, var(--background) 70%, transparent)"
                : undefined,
            }}
            onMouseEnter={(e) => {
              if (!c.out) (e.currentTarget as HTMLElement).style.background = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              if (!c.out) (e.currentTarget as HTMLElement).style.background = "";
            }}
          >
            {/* Day head */}
            <div className="flex items-center justify-between mb-0.5">
              {isToday ? (
                <span
                  className="inline-flex items-center justify-center rounded-[3px] font-semibold"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono, monospace)",
                    fontSize: 11,
                    fontVariantNumeric: "tabular-nums",
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    width: 20,
                    height: 20,
                    margin: -2,
                  }}
                >
                  {String(c.d).padStart(2, "0")}
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono, monospace)",
                    fontSize: 11,
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 500,
                    color: c.out
                      ? "var(--fg-4, oklch(0.42 0.01 240))"
                      : isWeekend
                      ? "var(--fg-3, oklch(0.58 0.01 240))"
                      : "var(--fg-2, oklch(0.78 0.01 240))",
                  }}
                >
                  {String(c.d).padStart(2, "0")}
                </span>
              )}

              {/* WFH pill */}
              {!c.out && !isWeekend && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWfh(format(new Date(year, month, c.d), "yyyy-MM-dd"));
                  }}
                  className={`transition-opacity ${isWfh ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  style={{
                    fontFamily: "var(--font-jetbrains-mono, monospace)",
                    fontSize: 8,
                    letterSpacing: "0.1em",
                    padding: "1px 4px",
                    border: `1px solid ${isWfh ? "var(--primary)" : "var(--hairline-strong, oklch(1 0 0 / 0.12))"}`,
                    borderRadius: 2,
                    color: isWfh ? "var(--primary)" : "var(--fg-3)",
                    background: "transparent",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {isWfh ? "WFH" : "OFF"}
                </button>
              )}
            </div>

            {/* Events */}
            {evs.slice(0, 3).map((e) => (
              <button
                key={e.id}
                onClick={(ev) => { ev.stopPropagation(); onSelectEvent(e); }}
                className="w-full text-left overflow-hidden"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  color: "var(--fg-2, oklch(0.78 0.01 240))",
                  padding: "1px 0",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span
                  className="shrink-0 rounded-[1px]"
                  style={{
                    width: 2,
                    height: 11,
                    background: e.color ?? AREA_COLOR[e.area] ?? "var(--primary)",
                  }}
                />
                {!e.allDay && (
                  <span
                    className="shrink-0"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono, monospace)",
                      fontSize: 10,
                      color: "var(--fg-3)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {format(e.start, "HH:mm")}
                  </span>
                )}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</span>
              </button>
            ))}
            {evs.length > 3 && (
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono, monospace)",
                  fontSize: 10,
                  color: "var(--fg-3)",
                  marginTop: 2,
                }}
              >
                +{evs.length - 3} more
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
