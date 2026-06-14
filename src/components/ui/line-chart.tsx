"use client";

import { useRef, useState } from "react";
import { format, parseISO } from "date-fns";

export interface LinePoint {
  /** ISO date "yyyy-MM-dd" */
  date: string;
  value: number;
}

interface LineChartProps {
  data: LinePoint[];
  color?: string;
  /** Format the value shown in the tooltip (client parents only — not serializable across the server boundary) */
  valueFormat?: (n: number) => string;
  /** Serializable alternatives to valueFormat for use from Server Components */
  valuePrefix?: string;
  valueSuffix?: string;
  /** Chart drawing height in px (excludes axis label row) */
  height?: number;
  className?: string;
}

const PAD_TOP = 4;
const PAD_BOTTOM = 4;

export function LineChart({
  data,
  color,
  valueFormat,
  valuePrefix = "",
  valueSuffix = "",
  height = 52,
  className,
}: LineChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    idx: number;
    clientX: number;
    clientY: number;
  } | null>(null);

  if (!data || data.length < 2) {
    return (
      <div
        className={className}
        style={{ height: height + 16, display: "flex", alignItems: "center" }}
      >
        <span className="label" style={{ fontSize: 9 }}>
          Not enough data
        </span>
      </div>
    );
  }

  const W = 100;
  const H = height;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const xOf = (i: number) => (i / (data.length - 1)) * W;
  const yOf = (v: number) =>
    H - ((v - min) / range) * (H - PAD_TOP - PAD_BOTTOM) - PAD_BOTTOM;

  const points = data.map((d, i) => [xOf(i), yOf(d.value)] as [number, number]);
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`)
    .join(" ");
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;
  const accent = color ?? "var(--primary)";
  const fmt =
    valueFormat ?? ((n: number) => `${valuePrefix}${n.toLocaleString()}${valueSuffix}`);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(frac * (data.length - 1));
    setHover({ idx, clientX: e.clientX, clientY: rect.top });
  };

  const hoverPt = hover ? points[hover.idx] : null;

  // X-axis labels: first / middle / last
  const labelIdxs = [0, Math.floor((data.length - 1) / 2), data.length - 1];
  const dateLabel = (d: string) => format(parseISO(d), "d MMM");

  return (
    <div className={className}>
      <div
        ref={ref}
        className="relative"
        style={{ height: H, cursor: "crosshair" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          width="100%"
          height={H}
          style={{ display: "block", overflow: "visible" }}
        >
          <path d={areaPath} fill={accent} fillOpacity={0.12} stroke="none" />
          <path
            d={linePath}
            fill="none"
            stroke={accent}
            strokeWidth={1.25}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {hoverPt && (
            <>
              <line
                x1={hoverPt[0]}
                y1={0}
                x2={hoverPt[0]}
                y2={H}
                stroke={accent}
                strokeOpacity={0.4}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={hoverPt[0]}
                cy={hoverPt[1]}
                r={2.5}
                fill={accent}
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
      </div>

      {/* X-axis day labels */}
      <div className="flex justify-between mt-1">
        {labelIdxs.map((li, i) => (
          <span
            key={li}
            className="label"
            style={{
              fontSize: 9,
              textAlign: i === 0 ? "left" : i === 2 ? "right" : "center",
            }}
          >
            {dateLabel(data[li].date)}
          </span>
        ))}
      </div>

      {/* Tooltip — fixed so the tile's overflow:hidden never clips it */}
      {hover && (
        <div
          className="pointer-events-none fixed z-[9999]"
          style={{ left: hover.clientX + 12, top: hover.clientY - 8, transform: "translateY(-100%)" }}
        >
          <div
            style={{
              background: "var(--popover, oklch(0.13 0.01 240))",
              border: "1px solid var(--hairline-strong, oklch(1 0 0 / 0.12))",
              borderRadius: 6,
              padding: "6px 9px",
              boxShadow: "0 4px 20px oklch(0 0 0 / 0.5)",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--fg-3, oklch(0.58 0.01 240))",
                marginBottom: 2,
              }}
            >
              {dateLabel(data[hover.idx].date)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: accent }}>
              {fmt(data[hover.idx].value)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
