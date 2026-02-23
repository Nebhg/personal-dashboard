import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/calendar/CalendarView";
import { startOfMonth, endOfMonth } from "date-fns";
import { type CalendarEventDTO } from "@/types";
import { generateScheduleEvents } from "@/lib/calendar-utils";
import { Calendar } from "lucide-react";

export default async function CalendarPage() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [storedEvents, workoutPlans, mealPlanEntries] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { start: { gte: monthStart }, end: { lte: monthEnd } },
      orderBy: { start: "asc" },
    }),
    prisma.workoutPlan.findMany({ select: { id: true, name: true, scheduledDays: true } }),
    prisma.mealPlanEntry.findMany({
      include: { recipe: { select: { name: true, calories: true } } },
    }),
  ]);

  const virtualEvents = generateScheduleEvents(monthStart, monthEnd, workoutPlans, mealPlanEntries);

  const serialized: CalendarEventDTO[] = [
    ...storedEvents.map((e) => ({
      id: e.id,
      title: e.title,
      start: e.start.toISOString(),
      end: e.end.toISOString(),
      allDay: e.allDay,
      area: e.area as CalendarEventDTO["area"],
      color: e.color,
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
      <CalendarView initialEvents={serialized} />
    </div>
  );
}
