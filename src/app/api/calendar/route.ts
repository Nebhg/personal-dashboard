import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScheduleEvents } from "@/lib/calendar-utils";
import { format, startOfDay } from "date-fns";
import { type CalendarEventDTO } from "@/types";

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

  const [storedEvents, workoutPlans, mealPlanEntries, recurringBlocks, wfhDays] =
    await Promise.all([
      prisma.calendarEvent.findMany({ where, orderBy: { start: "asc" } }),
      prisma.workoutPlan.findMany({
        select: { id: true, name: true, scheduledDays: true, scheduledTime: true },
      }),
      prisma.mealPlanEntry.findMany({
        include: { recipe: { select: { name: true, calories: true } } },
      }),
      prisma.recurringBlock.findMany(),
      fromStr && toStr
        ? prisma.workFromHomeDay.findMany({
            where: {
              date: { gte: startOfDay(new Date(fromStr)), lte: startOfDay(new Date(toStr)) },
            },
          })
        : Promise.resolve([]),
    ]);

  const wfhDateSet = new Set(wfhDays.map((d) => format(d.date, "yyyy-MM-dd")));

  const virtualEvents =
    fromStr && toStr
      ? generateScheduleEvents(
          new Date(fromStr),
          new Date(toStr),
          workoutPlans,
          mealPlanEntries,
          recurringBlocks,
          wfhDateSet
        )
      : [];

  const serialized: CalendarEventDTO[] = storedEvents.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
    allDay: e.allDay,
    area: e.area as CalendarEventDTO["area"],
    color: e.color,
    description: e.description,
  }));

  return NextResponse.json([...serialized, ...virtualEvents]);
}
