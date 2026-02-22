import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  const where =
    fromStr && toStr
      ? {
          start: { gte: new Date(fromStr) },
          end: { lte: new Date(toStr) },
        }
      : {};

  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { start: "asc" },
  });

  return NextResponse.json(events);
}
