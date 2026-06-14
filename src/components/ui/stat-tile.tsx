import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";
import { LineChart, type LinePoint } from "./line-chart";

interface StatTileProps {
  label: string;
  num: string | number;
  unit?: string;
  sub?: React.ReactNode;
  delta?: string;
  deltaDir?: "up" | "down" | "flat";
  spark?: number[];
  /** Interactive day-by-day series (renders LineChart instead of Sparkline) */
  series?: LinePoint[];
  /** Serializable tooltip value affixes for the interactive series */
  valuePrefix?: string;
  valueSuffix?: string;
  sparkColor?: string;
  onClick?: () => void;
  className?: string;
}

export function StatTile({
  label,
  num,
  unit,
  sub,
  delta,
  deltaDir = "flat",
  spark,
  series,
  valuePrefix,
  valueSuffix,
  sparkColor,
  onClick,
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-[6px] overflow-hidden",
        "flex flex-col gap-1 p-2 sm:p-[9px] cursor-pointer transition-colors",
        "hover:border-[oklch(1_0_0/0.12)]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {delta && (
          <span
            className={cn(
              "mono text-[10px] px-1 py-px rounded-[2px]",
              deltaDir === "up" && "text-[oklch(0.80_0.14_145)] bg-[oklch(0.80_0.14_145/0.12)]",
              deltaDir === "down" && "text-[oklch(0.80_0.13_25)] bg-[oklch(0.80_0.13_25/0.12)]",
              deltaDir === "flat" && "text-[var(--fg-3,oklch(0.58_0.01_240))]"
            )}
          >
            {delta}
          </span>
        )}
      </div>
      <div className="leading-none">
        <span className="mono text-[24px] sm:text-[28px] font-[500] tracking-[-0.02em] text-foreground tabular-nums">
          {num}
        </span>
        {unit && (
          <span className="mono text-[11px] ml-1 text-[var(--fg-3,oklch(0.58_0.01_240))]">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="text-[11px] text-[var(--fg-3,oklch(0.58_0.01_240))] flex items-center gap-2">
          {sub}
        </div>
      )}
      {series && series.length >= 2 ? (
        <div className="mt-auto pt-1">
          <LineChart data={series} color={sparkColor} valuePrefix={valuePrefix} valueSuffix={valueSuffix} height={36} />
        </div>
      ) : (
        spark && <Sparkline data={spark} color={sparkColor} />
      )}
    </div>
  );
}
