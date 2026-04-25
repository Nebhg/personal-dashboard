import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regeneratePortfolioMd } from "@/lib/investments-sync";
import YahooFinance from "yahoo-finance2";
// Instantiate once — v3 uses class-based API
const yahooFinance = new YahooFinance();

// LSE-listed securities need a .L suffix in Yahoo Finance
function toYfTicker(ticker: string, priceCurrency: string): string {
  if (priceCurrency === "GBP" && !ticker.endsWith(".L")) return `${ticker}.L`;
  return ticker;
}

// ── GET: fetch live prices ─────────────────────────────────────────────────────
export async function GET() {
  try {
    const accounts = await prisma.investmentAccount.findMany({
      include: { holdings: true },
    });

    const holdings = accounts.flatMap((a) => a.holdings).filter((h) => h.ticker);
    if (holdings.length === 0) {
      return NextResponse.json({ prices: {}, gbpUsd: null, fetchedAt: new Date().toISOString() });
    }

    // Build Yahoo ticker → holding(s) map
    const yfMap: Record<string, typeof holdings> = {};
    for (const h of holdings) {
      const yf = toYfTicker(h.ticker!, h.priceCurrency);
      if (!yfMap[yf]) yfMap[yf] = [];
      yfMap[yf].push(h);
    }
    const allSymbols = [...Object.keys(yfMap), "GBPUSD=X"];

    // Fetch all quotes in parallel — yahoo-finance2 handles auth/GDPR internally
    const settled = await Promise.allSettled(
      allSymbols.map(async (sym) => {
        const quote = await yahooFinance.quote(sym, {}, { validateResult: false });
        return { sym, quote };
      })
    );

    const priceMap: Record<string, { price: number; changePercent: number | null }> = {};
    const errors: string[] = [];

    for (const result of settled) {
      if (result.status === "fulfilled") {
        const { sym, quote } = result.value;
        if (quote?.regularMarketPrice != null) {
          priceMap[sym] = {
            price: quote.regularMarketPrice as number,
            changePercent: (quote.regularMarketChangePercent as number | undefined) ?? null,
          };
        }
      } else {
        errors.push(String(result.reason).slice(0, 80));
      }
    }

    if (Object.keys(priceMap).length === 0) {
      return NextResponse.json(
        { error: `No prices returned from Yahoo Finance. ${errors[0] ?? ""}`.trim() },
        { status: 502 }
      );
    }

    const gbpUsd = priceMap["GBPUSD=X"]?.price ?? null;

    const prices: Record<
      string,
      {
        holdingId: string;
        ticker: string;
        yfTicker: string;
        price: number;
        priceCurrency: string;
        valueGbp: number;
        changePercent: number | null;
        quantity: number;
        costGbp: number;
      }
    > = {};

    for (const [yfTicker, holdingList] of Object.entries(yfMap)) {
      const q = priceMap[yfTicker];
      if (!q) continue;

      for (const h of holdingList) {
        let valueGbp: number;
        if (h.priceCurrency === "GBP") {
          valueGbp = q.price * h.quantity;
        } else if (gbpUsd) {
          valueGbp = (q.price / gbpUsd) * h.quantity;
        } else {
          valueGbp = q.price * h.quantity;
        }

        prices[h.id] = {
          holdingId: h.id,
          ticker: h.ticker!,
          yfTicker,
          price: q.price,
          priceCurrency: h.priceCurrency,
          valueGbp,
          changePercent: q.changePercent,
          quantity: h.quantity,
          costGbp: h.costGbp,
        };
      }
    }

    if (Object.keys(prices).length === 0) {
      return NextResponse.json(
        { error: "Quotes returned but no holdings could be matched" },
        { status: 502 }
      );
    }

    return NextResponse.json({ prices, gbpUsd, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST: persist live prices to DB ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { prices } = (await req.json()) as {
      prices: Record<string, { price: number; valueGbp: number }>;
    };

    await Promise.all(
      Object.entries(prices).map(([id, d]) =>
        prisma.investmentHolding.update({
          where: { id },
          data: { lastPrice: d.price, valueGbp: d.valueGbp },
        })
      )
    );

    regeneratePortfolioMd().catch(() => {});
    return NextResponse.json({ saved: Object.keys(prices).length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
