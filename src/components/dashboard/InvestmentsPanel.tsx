"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Panel, PanelHead, PanelTitle } from "@/components/ui/panel";
import { LineChart, type LinePoint } from "@/components/ui/line-chart";

interface Holding {
  id: string;
  ticker: string | null;
  name: string;
  quantity: number;
  priceCurrency: string;
  valueGbp: number | null;
}
interface Account {
  id: string;
  name: string;
  cashBalanceGbp: number;
  holdings: Holding[];
}
interface PriceInfo {
  valueGbp: number;
  changePercent: number | null;
  dayChangeGbp: number | null;
}

const POS = "var(--c-diet, oklch(0.80 0.14 145))";
const NEG = "var(--c-personal, oklch(0.80 0.13 25))";

const gbp = (n: number) =>
  `£${Math.round(n).toLocaleString("en-GB")}`;

export function InvestmentsPanel({ initialSeries }: { initialSeries: LinePoint[] }) {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [prices, setPrices] = useState<Record<string, PriceInfo> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/investments").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/investments/prices").then((r) => (r.ok ? r.json() : { prices: {} })),
    ])
      .then(([accts, priceRes]) => {
        if (!active) return;
        setAccounts(Array.isArray(accts) ? accts : []);
        setPrices(priceRes?.prices ?? {});
      })
      .catch(() => active && setAccounts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Build display rows + totals
  type Row = { key: string; label: string; sub: string; value: number; changePct: number | null; isCash: boolean };
  const rows: Row[] = [];
  let totalValue = 0;
  let dayPnl = 0;

  if (accounts) {
    for (const a of accounts) {
      for (const h of a.holdings) {
        const p = prices?.[h.id];
        const value = p?.valueGbp ?? h.valueGbp ?? 0;
        totalValue += value;
        dayPnl += p?.dayChangeGbp ?? 0;
        rows.push({
          key: h.id,
          label: h.ticker ?? h.name,
          sub: a.name,
          value,
          changePct: p?.changePercent ?? null,
          isCash: false,
        });
      }
      if (a.cashBalanceGbp > 0) {
        totalValue += a.cashBalanceGbp;
        rows.push({
          key: `${a.id}-cash`,
          label: "Cash",
          sub: a.name,
          value: a.cashBalanceGbp,
          changePct: 0,
          isCash: true,
        });
      }
    }
  }
  rows.sort((x, y) => y.value - x.value);

  const dayPnlPct = totalValue - dayPnl !== 0 ? (dayPnl / (totalValue - dayPnl)) * 100 : 0;
  const pnlColor = dayPnl >= 0 ? POS : NEG;
  const sign = dayPnl >= 0 ? "+" : "−";

  return (
    <Panel className="flex-1 flex flex-col">
      <PanelHead>
        <PanelTitle>Investments</PanelTitle>
        <Link
          href="/investments"
          className="inline-flex items-center gap-1 text-[12px] text-[var(--fg-2)] hover:text-foreground transition-colors"
        >
          Open <ChevronRight className="h-3 w-3" />
        </Link>
      </PanelHead>

      {/* Headline value + today's P&L */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="leading-none">
          <span className="mono text-[22px] sm:text-[26px] font-[500] tracking-[-0.02em] tabular-nums">
            {loading && !accounts ? "—" : gbp(totalValue)}
          </span>
          <span className="label ml-2">Portfolio value</span>
        </div>
        <div className="text-right leading-none">
          <span className="mono text-[14px] font-[500] tabular-nums" style={{ color: pnlColor }}>
            {sign}{gbp(Math.abs(dayPnl))}
          </span>
          <span className="label ml-1.5" style={{ color: pnlColor }}>
            {sign}{Math.abs(dayPnlPct).toFixed(2)}% today
          </span>
        </div>
      </div>

      {/* Portfolio value line graph */}
      <div className="px-4 pb-1">
        <LineChart data={initialSeries} color="var(--primary)" valueFormat={gbp} height={44} />
      </div>

      {/* Per-holding / account rows */}
      <div className="flex-1 overflow-y-auto border-t border-border min-h-0">
        {accounts && rows.length === 0 ? (
          <div className="px-4 py-8 text-center label">No holdings yet</div>
        ) : (
          rows.map((r) => {
            const up = (r.changePct ?? 0) >= 0;
            return (
              <div
                key={r.key}
                className="flex items-center justify-between px-4 py-[7px] border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="shrink-0 rounded-[1px]"
                    style={{ width: 3, height: 24, background: r.isCash ? "var(--c-sleep, oklch(0.65 0.04 250))" : "var(--primary)" }}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">{r.label}</div>
                    <div className="label" style={{ marginTop: 2 }}>{r.sub}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="mono text-[12px] tabular-nums">{gbp(r.value)}</span>
                  {r.changePct != null && (
                    <span
                      className="mono text-[10px] px-1 py-px rounded-[2px] tabular-nums"
                      style={{
                        color: r.isCash ? "var(--fg-3)" : up ? POS : NEG,
                        background: r.isCash
                          ? "transparent"
                          : up
                          ? "oklch(0.80 0.14 145 / 0.12)"
                          : "oklch(0.80 0.13 25 / 0.12)",
                        minWidth: 52,
                        textAlign: "right",
                      }}
                    >
                      {up ? "+" : ""}
                      {r.changePct.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Panel>
  );
}
