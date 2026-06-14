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
    // Support arbitrary date for retroactive logging, default to today
    const targetDate = data.date
      ? startOfDay(new Date(data.date))
      : startOfDay(new Date());

    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check if log already exists — if so, update (or delete if toggling off)
    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date: targetDate } },
      include: { calendarEvent: true },
    });

    if (existing) {
      // Update the existing log
      const log = await prisma.habitLog.update({
        where: { id: existing.id },
        data: { kept: data.kept, notes: data.notes ?? null },
        include: { calendarEvent: true },
      });
      // Update calendar event if it exists
      if (existing.calendarEvent) {
        await prisma.calendarEvent.update({
          where: { id: existing.calendarEvent.id },
          data: {
            title: `${habit.name}: ${data.kept ? "✓ Kept" : "✗ Missed"}`,
            color: data.kept ? AREA_COLORS.HABITS : "#ef4444",
          },
        });
      }
      return NextResponse.json(log, { status: 200 });
    }

    const log = await prisma.habitLog.create({
      data: {
        habitId: id,
        date: targetDate,
        kept: data.kept,
        notes: data.notes ?? null,
        calendarEvent: {
          create: {
            title: `${habit.name}: ${data.kept ? "✓ Kept" : "✗ Missed"}`,
            start: targetDate,
            end: targetDate,
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
