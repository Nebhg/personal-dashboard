"use client";

interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
}

export function Sparkline({ data, color, className }: SparklineProps) {
  if (!data || data.length < 2) return null;
  const w = 100;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y] as [number, number];
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;
  const accentColor = color ?? "var(--primary)";
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      width="100%"
      height={h}
      aria-hidden
    >
      <path d={areaPath} fill={accentColor} fillOpacity={0.12} stroke="none" />
      <path d={linePath} fill="none" stroke={accentColor} strokeWidth={1.25} strokeLinecap="round" />
    </svg>
  );
}
