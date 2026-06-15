import { NextRequest, NextResponse } from "next/server";
import { prisma, createFreshPrismaClient } from "@/lib/prisma";
import { sleepSchema } from "@/lib/validations/sleep";
import { AREA_COLORS } from "@/types";

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
    const logs = await client.sleepLog.findMany({
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
    for (const key of ["date", "bedTime", "wakeTime"] as const) {
      if (typeof body[key] === "string") body[key] = new Date(body[key]);
    }
    const data = sleepSchema.parse(body);

    const durationMin = Math.round(
      (data.wakeTime.getTime() - data.bedTime.getTime()) / 60000
    );
    const hours = Math.floor(durationMin / 60);
    const mins = durationMin % 60;
    const qualityStr = data.quality ? ` · quality ${data.quality}/10` : "";

    const log = await prisma.sleepLog.create({
      data: {
        date: data.date,
        bedTime: data.bedTime,
        wakeTime: data.wakeTime,
        durationMin,
        quality: data.quality ?? null,
        notes: data.notes ?? null,
        calendarEvent: {
          create: {
            title: `Sleep: ${hours}h ${mins}m${qualityStr}`,
            start: data.bedTime,
            end: data.wakeTime,
            allDay: false,
            area: "SLEEP",
            color: AREA_COLORS.SLEEP,
          },
        },
      },
      include: { calendarEvent: true },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
