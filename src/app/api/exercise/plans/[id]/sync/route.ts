import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncDeleteFromGCal, pushWorkoutPlanToGCal } from "@/lib/gcal-sync";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const plan = await prisma.workoutPlan.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      scheduledDays: true,
      scheduledTime: true,
      description: true,
      gcalEventId: true,
    },
  });

  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const days: number[] = (() => {
    try { return JSON.parse(plan.scheduledDays); } catch { return []; }
  })();

  if (days.length === 0 || !plan.scheduledTime) {
    return NextResponse.json({ error: "Plan has no scheduled days or time" }, { status: 422 });
  }

  // Clear stale gcalEventId then delete from GCal (best-effort)
  if (plan.gcalEventId) {
    await prisma.workoutPlan.update({ where: { id }, data: { gcalEventId: null } });
    await syncDeleteFromGCal(plan.gcalEventId).catch(() => {});
  }

  await pushWorkoutPlanToGCal(plan.id, plan.name, days, plan.scheduledTime, plan.description);

  const updated = await prisma.workoutPlan.findUnique({
    where: { id },
    select: { gcalEventId: true },
  });

  return NextResponse.json({ synced: true, gcalEventId: updated?.gcalEventId });
}
