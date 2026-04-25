import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regeneratePortfolioMd } from "@/lib/investments-sync";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const holding = await prisma.investmentHolding.create({
      data: {
        accountId:     body.accountId,
        ticker:        body.ticker        ?? null,
        name:          body.name,
        quantity:      body.quantity,
        priceCurrency: body.priceCurrency ?? "USD",
        lastPrice:     body.lastPrice     ?? null,
        valueGbp:      body.valueGbp      ?? null,
        costGbp:       body.costGbp,
        notes:         body.notes         ?? null,
      },
    });
    regeneratePortfolioMd().catch(() => {});
    return NextResponse.json(holding, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
