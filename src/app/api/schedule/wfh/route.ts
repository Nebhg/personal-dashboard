import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  const where =
    fromStr && toStr
      ? {
          date: {
            gte: startOfDay(new Date(fromStr)),
            lte: startOfDay(new Date(toStr)),
          },
        }
      : {};

  const days = await prisma.workFromHomeDay.findMany({ where, orderBy: { date: "asc" } });
  return NextResponse.json(days);
}

export async function POST(req: Request) {
  const body = await req.json();
  const date = startOfDay(new Date(body.date));

  const day = await prisma.workFromHomeDay.upsert({
    where: { date },
    create: { date },
    update: {},
  });

  return NextResponse.json(day, { status: 201 });
}
