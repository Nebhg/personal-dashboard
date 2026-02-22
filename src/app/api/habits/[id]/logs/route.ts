import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { habitLogSchema } from "@/lib/validations/habits";
import { startOfDay } from "date-fns";
import { AREA_COLORS } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logs = await prisma.habitLog.findMany({
    where: { habitId: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = habitLogSchema.parse(body);
    const today = startOfDay(new Date());

    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: id, date: today } },
      update: { kept: data.kept, notes: data.notes ?? null },
      create: {
        habitId: id,
        date: today,
        kept: data.kept,
        notes: data.notes ?? null,
        calendarEvent: {
          create: {
            title: `${habit.name}: ${data.kept ? "✓ Kept" : "✗ Missed"}`,
            start: today,
            end: today,
            allDay: true,
            area: "HABITS",
            color: data.kept ? AREA_COLORS.HABITS : "#ef4444",
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
