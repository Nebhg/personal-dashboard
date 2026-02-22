import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workoutSchema } from "@/lib/validations/exercise";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workout = await prisma.workoutSession.findUnique({
    where: { id },
    include: { exercises: { orderBy: { order: "asc" } }, calendarEvent: true },
  });
  if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(workout);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = workoutSchema.partial().parse(body);

    const workout = await prisma.workoutSession.update({
      where: { id },
      data: {
        ...(data.date && { date: data.date }),
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.durationMin && { durationMin: data.durationMin }),
        notes: data.notes ?? undefined,
      },
    });

    if (data.name || data.durationMin || data.date) {
      const updated = await prisma.workoutSession.findUnique({
        where: { id },
        select: { name: true, durationMin: true, date: true, calendarEvent: { select: { id: true } } },
      });
      if (updated?.calendarEvent?.id) {
        const endTime = new Date(updated.date.getTime() + updated.durationMin * 60 * 1000);
        await prisma.calendarEvent.update({
          where: { id: updated.calendarEvent.id },
          data: {
            title: `${updated.name} (${updated.durationMin}min)`,
            start: updated.date,
            end: endTime,
          },
        });
      }
    }

    return NextResponse.json(workout);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.workoutSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
