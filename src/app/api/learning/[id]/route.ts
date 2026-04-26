import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { learningSessionSchema } from "@/lib/validations/learning";
import { syncUpdateToGCal, syncDeleteFromGCal } from "@/lib/gcal-sync";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await prisma.learningSession.findUnique({
    where: { id },
    include: { calendarEvent: true },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = learningSessionSchema.partial().parse(body);
    const session = await prisma.learningSession.update({ where: { id }, data });

    // Sync to GCal if title/time changed and we have a gcalEventId
    if (data.title || data.category || data.durationMin || data.date || data.notes) {
      const updated = await prisma.learningSession.findUnique({
        where: { id },
        select: {
          category: true,
          title: true,
          durationMin: true,
          date: true,
          notes: true,
          resource: true,
          calendarEvent: { select: { id: true, gcalEventId: true } },
        },
      });
      if (updated?.calendarEvent) {
        const endTime = new Date(updated.date.getTime() + updated.durationMin * 60 * 1000);
        const title = `${updated.category}: ${updated.title}`;

        await prisma.calendarEvent.update({
          where: { id: updated.calendarEvent.id },
          data: { title, start: updated.date, end: endTime },
        });

        if (updated.calendarEvent.gcalEventId) {
          const description = [
            updated.notes,
            updated.resource ? `Resource: ${updated.resource}` : null,
          ]
            .filter(Boolean)
            .join("\n") || undefined;

          syncUpdateToGCal(updated.calendarEvent.gcalEventId, {
            title,
            start: updated.date,
            end: endTime,
            description: description ?? null,
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Look up gcalEventId before cascade-deleting
  const session = await prisma.learningSession.findUnique({
    where: { id },
    select: { calendarEvent: { select: { gcalEventId: true } } },
  });
  const gcalEventId = session?.calendarEvent?.gcalEventId;

  await prisma.learningSession.delete({ where: { id } });

  // Fire-and-forget GCal delete
  if (gcalEventId) {
    syncDeleteFromGCal(gcalEventId).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
