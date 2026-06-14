import { NextRequest, NextResponse } from "next/server";
import { getPortfolioHistory } from "@/lib/investments-history";

export const dynamic = "force-dynamic";

// GET /api/investments/history?days=30 — reconstructed daily portfolio value series
export async function GET(req: NextRequest) {
  try {
    const daysParam = req.nextUrl.searchParams.get("days");
    const days = Math.min(365, Math.max(7, Number(daysParam) || 30));
    const history = await getPortfolioHistory(days);
    return NextResponse.json(history);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
