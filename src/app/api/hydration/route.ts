import { NextRequest, NextResponse } from "next/server";
import { prisma, createFreshPrismaClient } from "@/lib/prisma";
import { hydrationSchema } from "@/lib/validations/hydration";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateStr = searchParams.get("date");

  const where = dateStr
    ? {
        date: {
          gte: new Date(dateStr + "T00:00:00"),
          lte: new Date(dateStr + "T23:59:59"),
        },
      }
    : {};

  const client = createFreshPrismaClient();
  try {
    const logs = await client.hydrationLog.findMany({
      where,
      orderBy: { date: "desc" },
    });
    return NextResponse.json(logs);
  } finally {
    await client.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.date === "string") body.date = new Date(body.date);
    if (body.date == null) body.date = new Date();
    const data = hydrationSchema.parse(body);

    const log = await prisma.hydrationLog.create({
      data: {
        date: data.date,
        amountMl: data.amountMl,
        notes: data.notes ?? null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
