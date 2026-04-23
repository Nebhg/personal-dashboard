import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date: dateStr } = await params;
  const date = startOfDay(new Date(decodeURIComponent(dateStr)));

  await prisma.workFromHomeDay.deleteMany({ where: { date } });
  return new NextResponse(null, { status: 204 });
}
