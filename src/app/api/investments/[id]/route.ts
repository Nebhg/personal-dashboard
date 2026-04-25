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
    const account = await prisma.investmentAccount.update({
      where: { id },
      data: {
        ...(body.name             !== undefined && { name:             body.name }),
        ...(body.broker           !== undefined && { broker:           body.broker }),
        ...(body.accountType      !== undefined && { accountType:      body.accountType }),
        ...(body.cashBalanceGbp   !== undefined && { cashBalanceGbp:   body.cashBalanceGbp }),
        ...(body.interestRate     !== undefined && { interestRate:     body.interestRate }),
        ...(body.isaAllowanceUsed !== undefined && { isaAllowanceUsed: body.isaAllowanceUsed }),
        ...(body.totalReturnGbp   !== undefined && { totalReturnGbp:   body.totalReturnGbp }),
        ...(body.notes            !== undefined && { notes:            body.notes }),
      },
      include: { holdings: true },
    });
    regeneratePortfolioMd().catch(() => {});
    return NextResponse.json(account);
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
    await prisma.investmentAccount.delete({ where: { id } });
    regeneratePortfolioMd().catch(() => {});
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
