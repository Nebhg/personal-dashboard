"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { format, startOfDay, subDays, addDays, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

export interface HeatmapDay {
  /** ISO date string "YYYY-MM-DD" */
  date: string;
  count: number;
  items?: { label: string; area?: string }[];
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
  /** Number of days to show (default 91 = 13 weeks) */
  days?: number;
  className?: string;
}

const MIN_CELL = 10;
const GAP = 3;
const DAY_LABEL_W = 16; // day-label column + gap
const DAY_LABELS = ["M", "", "W", "", "F", "", "S"];

interface TooltipState {
  clientX: number;
  clientY: number;
  dateLabel: string;
  count: number;
  items?: { label: string; area?: string }[];
}

export function ActivityHeatmap({ data, days = 91, className }: ActivityHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [cellSize, setCellSize] = useState(MIN_CELL);

  const { weeks, monthLabels } = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, days - 1);

    // Build lookup map
    const dataMap = new Map<string, HeatmapDay>();
    for (const d of data) dataMap.set(d.date, d);

    // Align to the Monday on or before startDate
    const firstMonday = startOfWeek(startDate, { weekStartsOn: 1 });

    type Cell = { date: Date | null; count: number; items?: { label: string; area?: string }[] };
    const weeks: Cell[][] = [];
    const monthLabels: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;

    let ws = firstMonday;
    while (ws <= today) {
      const week: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(ws, d);
        if (date < startDate || date > today) {
          week.push({ date: null, count: 0 });
        } else {
          const key = format(date, "yyyy-MM-dd");
          const dayData = dataMap.get(key);
          week.push({ date, count: dayData?.count ?? 0, items: dayData?.items });
        }
      }

      // Month label: emit when first valid day in week is a new month
      const firstValid = week.find((c) => c.date !== null);
      if (firstValid?.date) {
        const m = firstValid.date.getMonth();
        if (m !== lastMonth) {
          monthLabels.push({ label: format(firstValid.date, "MMM"), weekIdx: weeks.length });
          lastMonth = m;
        }
      }

      weeks.push(week);
      ws = addDays(ws, 7);
    }

    return { weeks, monthLabels };
  }, [data, days]);

  const maxCount = useMemo(
    () => Math.max(1, ...data.map((d) => d.count)),
    [data]
  );

  // Compute cell size to fill the container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const width = el.getBoundingClientRect().width;
      if (width === 0) return;
      const numWeeks = weeks.length || Math.ceil(days / 7) + 1;
      // available px = total - day-label column - gaps between weeks
      const available = width - DAY_LABEL_W - (numWeeks - 1) * GAP;
      const size = Math.max(MIN_CELL, Math.floor(available / numWeeks));
      setCellSize(size);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [weeks.length, days]);

  function cellColor(count: number): string {
    if (count === 0) return "var(--muted)";
    const pct = Math.round(18 + (Math.min(count, maxCount) / maxCount) * 65);
    return `color-mix(in oklab, var(--primary) ${pct}%, var(--muted))`;
  }

  const showTooltip = useCallback((
    e: React.MouseEvent | React.TouchEvent,
    dateLabel: string,
    count: number,
    items?: { label: string; area?: string }[]
  ) => {
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    setTooltip({ clientX, clientY, dateLabel, count, items });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const handleCellTouch = useCallback((
    e: React.TouchEvent,
    dateLabel: string,
    count: number,
    items?: { label: string; area?: string }[]
  ) => {
    if (count === 0) { hideTooltip(); return; }
    e.preventDefault();
    if (tooltip?.dateLabel === dateLabel) { hideTooltip(); } else { showTooltip(e, dateLabel, count, items); }
  }, [tooltip, showTooltip, hideTooltip]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)} onMouseLeave={hideTooltip}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* Month labels row */}
        <div style={{ display: "flex", marginLeft: 20, gap: GAP, marginBottom: 4 }}>
          {weeks.map((_, wi) => {
            const ml = monthLabels.find((m) => m.weekIdx === wi);
            return (
              <div
                key={wi}
                style={{
                  width: cellSize,
                  fontSize: 9,
                  color: "var(--fg-3, oklch(0.55 0.01 240))",
                  fontFamily: "var(--font-mono, monospace)",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {ml?.label ?? ""}
              </div>
            );
          })}
        </div>

        {/* Grid: day labels + week columns */}
        <div style={{ display: "flex", gap: GAP }}>
          {/* Day-of-week labels */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: GAP,
              marginRight: 2,
            }}
          >
            {DAY_LABELS.map((lbl, i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: cellSize,
                  fontSize: 10,
                  color: "var(--fg-4, oklch(0.42 0.01 240))",
                  fontFamily: "var(--font-mono, monospace)",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {lbl}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
              {week.map((cell, di) => {
                if (cell.date === null) {
                  return <div key={di} style={{ width: cellSize, height: cellSize, flexShrink: 0 }} />;
                }

                const dateLabel = format(cell.date, "MMM d, yyyy");

                return (
                  <div
                    key={di}
                    onMouseEnter={(e) => cell.count > 0 && showTooltip(e, dateLabel, cell.count, cell.items)}
                    onMouseMove={(e) => cell.count > 0 && showTooltip(e, dateLabel, cell.count, cell.items)}
                    onMouseLeave={hideTooltip}
                    onTouchStart={(e) => handleCellTouch(e, dateLabel, cell.count, cell.items)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: Math.max(2, Math.round(cellSize * 0.2)),
                      background: cellColor(cell.count),
                      flexShrink: 0,
                      cursor: cell.count > 0 ? "pointer" : "default",
                      transition: "opacity 0.1s",
                    }}
                    className={cell.count > 0 ? "hover:opacity-80" : ""}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip — rendered as fixed so parent overflow never clips it */}
      {tooltip && ((() => {
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const nearRight = tooltip.clientX > vw * 0.6;
        const nearTop = tooltip.clientY < 120;
        return (
          <div
            className="pointer-events-none fixed z-[9999]"
            style={{
              ...(nearRight ? { right: vw - tooltip.clientX + 8 } : { left: tooltip.clientX + 12 }),
              ...(nearTop
                ? { top: tooltip.clientY + 12 }
                : { top: tooltip.clientY - 8, transform: "translateY(-100%)" }),
            }}
          >
          <div
            style={{
              background: "var(--popover, oklch(0.13 0.01 240))",
              border: "1px solid var(--hairline-strong, oklch(1 0 0 / 0.12))",
              borderRadius: 6,
              padding: "8px 10px",
              minWidth: 160,
              maxWidth: 240,
              boxShadow: "0 4px 20px oklch(0 0 0 / 0.5)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--fg-2, oklch(0.78 0.01 240))",
                marginBottom: 4,
                fontWeight: 500,
              }}
            >
              {tooltip.dateLabel}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--primary)",
                marginBottom: tooltip.items && tooltip.items.length > 0 ? 6 : 0,
              }}
            >
              {tooltip.count} {tooltip.count === 1 ? "activity" : "activities"}
            </div>
            {tooltip.items && tooltip.items.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {tooltip.items.slice(0, 8).map((it, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11,
                      color: "var(--fg-2, oklch(0.78 0.01 240))",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: it.area === "habits" ? "oklch(0.82 0.13 75)"
                          : it.area === "exercise" ? "oklch(0.78 0.13 165)"
                          : it.area === "diet" ? "oklch(0.80 0.14 145)"
                          : it.area === "leetcode" ? "oklch(0.78 0.15 285)"
                          : it.area === "macro" ? "oklch(0.78 0.14 280)"
                          : "var(--primary)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.label}
                    </span>
                  </div>
                ))}
                {tooltip.items.length > 8 && (
                  <div style={{ fontSize: 10, color: "var(--fg-4)", marginTop: 1 }}>
                    +{tooltip.items.length - 8} more
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        );
      })())}
    </div>
  );
}
