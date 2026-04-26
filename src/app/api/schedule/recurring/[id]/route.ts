import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recurringBlockSchema } from "@/lib/validations/recurring-block";
import { SCHEDULE_CATEGORIES } from "@/types";
import { pushRecurringBlockToGCal, syncDeleteFromGCal } from "@/lib/gcal-sync";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (typeof body.endsOn === "string") body.endsOn = new Date(body.endsOn);

  const data = recurringBlockSchema.parse(body);
  const cat = SCHEDULE_CATEGORIES[data.category];
  const color = cat?.color ?? "#6366f1";

  // Grab the old GCal event ID before updating
  const existing = await prisma.recurringBlock.findUnique({
    where: { id },
    select: { gcalEventId: true },
  });

  const block = await prisma.recurringBlock.update({
    where: { id },
    data: {
      title: data.title,
      category: data.category,
      color,
      startTime: data.startTime,
      endTime: data.endTime,
      daysOfWeek: JSON.stringify(data.daysOfWeek),
      endsOn: data.endsOn ?? null,
      notes: data.notes ?? null,
      gcalEventId: null, // will be set after re-push
    },
  });

  // Delete old GCal event (RRULE changes can't be patched cleanly — easier to replace)
  if (existing?.gcalEventId) {
    syncDeleteFromGCal(existing.gcalEventId).catch(() => {});
  }

  // Create new GCal recurring event
  pushRecurringBlockToGCal(
    block.id,
    block.title,
    data.daysOfWeek,
    data.startTime,
    data.endTime,
    data.endsOn,
    data.notes
  ).catch(() => {});

  return NextResponse.json(block);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const block = await prisma.recurringBlock.findUnique({
    where: { id },
    select: { gcalEventId: true },
  });

  await prisma.recurringBlock.delete({ where: { id } });

  if (block?.gcalEventId) {
    syncDeleteFromGCal(block.gcalEventId).catch(() => {});
  }

  return new NextResponse(null, { status: 204 });
}
