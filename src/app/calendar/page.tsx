import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/calendar/CalendarView";
import { startOfMonth, endOfMonth } from "date-fns";
import { type CalendarEventDTO } from "@/types";
import { Calendar } from "lucide-react";

export default async function CalendarPage() {
  const now = new Date();
  const events = await prisma.calendarEvent.findMany({
    where: {
      start: { gte: startOfMonth(now) },
      end: { lte: endOfMonth(now) },
    },
    orderBy: { start: "asc" },
  });

  const serialized: CalendarEventDTO[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
    allDay: e.allDay,
    area: e.area as CalendarEventDTO["area"],
    color: e.color,
    description: e.description,
  }));

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
