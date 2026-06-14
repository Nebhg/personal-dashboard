import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncDeleteFromGCal, pushRecurringBlockToGCal } from "@/lib/gcal-sync";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const block = await prisma.recurringBlock.findUnique({ where: { id } });
  if (!block) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const daysOfWeek: number[] = (() => {
    try { return JSON.parse(block.daysOfWeek); } catch { return []; }
  })();

  if (daysOfWeek.length === 0) {
    return NextResponse.json({ error: "Block has no scheduled days" }, { status: 422 });
  }

  // Clear stale gcalEventId then delete from GCal (best-effort)
  if (block.gcalEventId) {
    await prisma.recurringBlock.update({ where: { id }, data: { gcalEventId: null } });
    await syncDeleteFromGCal(block.gcalEventId).catch(() => {});
  }

  await pushRecurringBlockToGCal(
    block.id,
    block.title,
    daysOfWeek,
    block.startTime,
    block.endTime,
    block.endsOn,
    block.notes
  );

  const updated = await prisma.recurringBlock.findUnique({
    where: { id },
    select: { gcalEventId: true },
  });

  return NextResponse.json({ synced: true, gcalEventId: updated?.gcalEventId });
}
