import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workoutSchema } from "@/lib/validations/exercise";
import { AREA_COLORS } from "@/types";

export async function GET() {
  const workouts = await prisma.workoutSession.findMany({
    orderBy: { date: "desc" },
    include: { exercises: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(workouts);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.date === "string") body.date = new Date(body.date);
    const data = workoutSchema.parse(body);

    const endTime = new Date(data.date.getTime() + data.durationMin * 60 * 1000);

    const workout = await prisma.workoutSession.create({
      data: {
        date: data.date,
        name: data.name,
        type: data.type,
        durationMin: data.durationMin,
        notes: data.notes ?? null,
        exercises: {
          create: data.exercises.map((ex, i) => ({
            name: ex.name,
            sets: ex.sets ?? null,
            reps: ex.reps ?? null,
            weightKg: ex.weightKg ?? null,
            distanceKm: ex.distanceKm ?? null,
            order: i,
          })),
        },
        calendarEvent: {
          create: {
            title: `${data.name} (${data.durationMin}min)`,
            start: data.date,
            end: endTime,
            allDay: false,
            area: "EXERCISE",
            color: AREA_COLORS.EXERCISE,
          },
        },
      },
      include: { exercises: true, calendarEvent: true },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
