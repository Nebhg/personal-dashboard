import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regeneratePortfolioMd } from "@/lib/investments-sync";

export async function GET() {
  const accounts = await prisma.investmentAccount.findMany({
    include: { holdings: { orderBy: { valueGbp: "desc" } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const account = await prisma.investmentAccount.create({
      data: {
        name:             body.name,
        broker:           body.broker          ?? "Unknown",
        accountType:      body.accountType     ?? "INVEST",
        cashBalanceGbp:   body.cashBalanceGbp  ?? 0,
        interestRate:     body.interestRate    ?? null,
        isaAllowanceUsed: body.isaAllowanceUsed ?? null,
        notes:            body.notes           ?? null,
      },
      include: { holdings: true },
    });
    regeneratePortfolioMd().catch(() => {});
    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
