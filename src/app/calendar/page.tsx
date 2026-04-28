import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/calendar/CalendarView";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { type CalendarEventDTO } from "@/types";
import { generateScheduleEvents } from "@/lib/calendar-utils";
import { Topbar } from "@/components/ui/topbar";

export default async function CalendarPage() {
  const now        = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd   = endOfMonth(now);

  const [storedEvents, workoutPlans, mealPlanEntries, recurringBlocks, wfhDays] =
    await Promise.all([
      prisma.calendarEvent.findMany({
        where: {
          start: { gte: monthStart },
          end:   { lte: monthEnd },
          area:  { not: "SCHEDULE" },
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

  const viewLabel = `${Object.keys({DIET:1,EXERCISE:1,LEARNING:1,HABITS:1,SCHEDULE:1}).length} CATEGORIES`;

  return (
    <>
      <Topbar
        title="Calendar"
        crumb={`MONTH VIEW · ${viewLabel}`}
      />
      <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-10 lg:pb-16">
        <div
          className="rounded-[6px] overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <CalendarView
            initialEvents={serialized}
            initialWfhDates={Array.from(wfhDateSet)}
          />
        </div>
      </div>
    </>
  );
}
