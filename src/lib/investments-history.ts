import { prisma } from "@/lib/prisma";
import { format, subDays } from "date-fns";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

// LSE-listed securities need a .L suffix in Yahoo Finance (mirrors prices route)
function toYfTicker(ticker: string, priceCurrency: string): string {
  if (priceCurrency === "GBP" && !ticker.endsWith(".L")) return `${ticker}.L`;
  return ticker;
}

export interface PortfolioHistory {
  series: { date: string; value: number }[];
}

/**
 * Reconstruct a daily portfolio-value series (in GBP) over the last `days`
 * by pulling historical closes per holding from Yahoo Finance. USD holdings are
 * converted via the GBPUSD=X historical series. Each account's current cash
 * balance is added as a flat contribution (covers cash-only accounts).
 */
export async function getPortfolioHistory(days = 30): Promise<PortfolioHistory> {
  const accounts = await prisma.investmentAccount.findMany({ include: { holdings: true } });
  const holdings = accounts.flatMap((a) => a.holdings).filter((h) => h.ticker);
  const totalCash = accounts.reduce((s, a) => s + (a.cashBalanceGbp ?? 0), 0);

  const period1 = subDays(new Date(), days);
  const period2 = new Date();

  // Helper: fetch a chart and return a date(yyyy-MM-dd) -> close map
  async function closeMap(symbol: string): Promise<Map<string, number>> {
    const m = new Map<string, number>();
    try {
      const res = await yahooFinance.chart(symbol, { period1, period2, interval: "1d" });
      for (const q of res.quotes ?? []) {
        if (q.date && q.close != null) m.set(format(new Date(q.date), "yyyy-MM-dd"), q.close);
      }
    } catch {
      /* unknown ticker / network — skip */
    }
    return m;
  }

  const needFx = holdings.some((h) => h.priceCurrency !== "GBP");
  const [fxMap, ...holdingMaps] = await Promise.all([
    needFx ? closeMap("GBPUSD=X") : Promise.resolve(new Map<string, number>()),
    ...holdings.map((h) => closeMap(toYfTicker(h.ticker!, h.priceCurrency))),
  ]);

  // Union of all trading dates, sorted ascending
  const dateSet = new Set<string>();
  for (const m of holdingMaps) for (const k of m.keys()) dateSet.add(k);
  const dates = [...dateSet].sort();

  // If we have no price data at all, return a flat cash-only line across the window
  if (dates.length === 0) {
    const series = Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      date: format(subDays(period2, days - 1 - i), "yyyy-MM-dd"),
      value: totalCash,
    }));
    return { series };
  }

  // Forward-fill helper: latest known value at or before a date
  function ffill(m: Map<string, number>, sortedKeys: string[], upto: string): number | null {
    let v: number | null = null;
    for (const k of sortedKeys) {
      if (k > upto) break;
      v = m.get(k) ?? v;
    }
    return v;
  }

  const fxKeys = [...fxMap.keys()].sort();
  const holdingKeys = holdingMaps.map((m) => [...m.keys()].sort());

  const series = dates.map((date) => {
    let value = totalCash;
    holdings.forEach((h, i) => {
      const close = ffill(holdingMaps[i], holdingKeys[i], date);
      if (close == null) return;
      if (h.priceCurrency === "GBP") {
        value += close * h.quantity;
      } else {
        const rate = ffill(fxMap, fxKeys, date);
        value += rate ? (close / rate) * h.quantity : close * h.quantity;
      }
    });
    return { date, value: Math.round(value) };
  });

  return { series };
}
