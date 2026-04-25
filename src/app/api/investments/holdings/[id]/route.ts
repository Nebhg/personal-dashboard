import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regeneratePortfolioMd } from "@/lib/investments-sync";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const holding = await prisma.investmentHolding.update({
      where: { id },
      data: {
        ...(body.ticker        !== undefined && { ticker:        body.ticker }),
        ...(body.name          !== undefined && { name:          body.name }),
        ...(body.quantity      !== undefined && { quantity:      body.quantity }),
        ...(body.priceCurrency !== undefined && { priceCurrency: body.priceCurrency }),
        ...(body.lastPrice     !== undefined && { lastPrice:     body.lastPrice }),
        ...(body.valueGbp      !== undefined && { valueGbp:      body.valueGbp }),
        ...(body.costGbp       !== undefined && { costGbp:       body.costGbp }),
        ...(body.notes         !== undefined && { notes:         body.notes }),
      },
    });
    regeneratePortfolioMd().catch(() => {});
    return NextResponse.json(holding);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.investmentHolding.delete({ where: { id } });
    regeneratePortfolioMd().catch(() => {});
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
