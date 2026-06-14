import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncDeleteFromGCal } from "@/lib/gcal-sync";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const event = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { gcalEventId: true },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.calendarEvent.delete({ where: { id } });

  if (event.gcalEventId) {
    syncDeleteFromGCal(event.gcalEventId).catch(() => {});
  }

  return new NextResponse(null, { status: 204 });
}
