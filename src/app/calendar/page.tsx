import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/calendar/CalendarView";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { type CalendarEventDTO } from "@/types";
import { generateScheduleEvents } from "@/lib/calendar-utils";
import { Calendar } from "lucide-react";

export default async function CalendarPage() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd   = endOfMonth(now);

  // Load domain events (workouts, meals, learning, habits) as read-only overlays.
  // Schedule blocks are excluded — Google Calendar is now the source of truth for those.
  const [storedEvents, workoutPlans, mealPlanEntries, recurringBlocks, wfhDays] =
    await Promise.all([
      prisma.calendarEvent.findMany({
        where: {
          start: { gte: monthStart },
          end:   { lte: monthEnd },
          area:  { not: "SCHEDULE" }, // exclude old schedule blocks
        },
        orderBy: { start: "asc" },
      }),
      prisma.workoutPlan.findMany({
        select: { id: true, name: true, scheduledDays: true, scheduledTime: true },
      }),
      prisma.mealPlanEntry.findMany({
        include: { recipe: { select: { name: true, calories: true } } },
      }),
      prisma.recurringBlock.findMany(),
      prisma.workFromHomeDay.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
      }),
    ]);

  const wfhDateSet = new Set(wfhDays.map((d) => format(d.date, "yyyy-MM-dd")));

  const virtualEvents = generateScheduleEvents(
    monthStart, monthEnd, workoutPlans, mealPlanEntries, recurringBlocks, wfhDateSet
  );

  const serialized: CalendarEventDTO[] = [
    ...storedEvents.map((e) => ({
      id:          e.id,
      title:       e.title,
      start:       e.start.toISOString(),
      end:         e.end.toISOString(),
      allDay:      e.allDay,
      area:        e.area as CalendarEventDTO["area"],
      color:       e.color,
      description: e.description,
    })),
    ...virtualEvents,
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Calendar className="h-6 w-6 text-blue-500" />
        Calendar
      </h1>
      <CalendarView
        initialEvents={serialized}
        initialWfhDates={Array.from(wfhDateSet)}
      />
    </div>
  );
}
