import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScheduleEvents } from "@/lib/calendar-utils";

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

  const [storedEvents, workoutPlans, mealPlanEntries] = await Promise.all([
    prisma.calendarEvent.findMany({ where, orderBy: { start: "asc" } }),
    prisma.workoutPlan.findMany({ select: { id: true, name: true, scheduledDays: true } }),
    prisma.mealPlanEntry.findMany({
      include: { recipe: { select: { name: true, calories: true } } },
    }),
  ]);

  const virtualEvents =
    fromStr && toStr
      ? generateScheduleEvents(new Date(fromStr), new Date(toStr), workoutPlans, mealPlanEntries)
      : [];

  return NextResponse.json([...storedEvents, ...virtualEvents]);
}
