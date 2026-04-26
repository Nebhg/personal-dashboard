import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workoutPlanSchema } from "@/lib/validations/exercise";
import { pushWorkoutPlanToGCal, syncDeleteFromGCal } from "@/lib/gcal-sync";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.workoutPlan.findUnique({
    where: { id },
    include: { exercises: { orderBy: { order: "asc" } } },
  });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = workoutPlanSchema.parse(body);

  // Grab the old GCal event ID before updating
  const existing = await prisma.workoutPlan.findUnique({
    where: { id },
    select: { gcalEventId: true },
  });

  // Replace all exercises
  await prisma.workoutPlanExercise.deleteMany({ where: { planId: id } });

  const plan = await prisma.workoutPlan.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description ?? null,
      scheduledDays: JSON.stringify(data.scheduledDays ?? []),
      scheduledTime: data.scheduledTime ?? null,
      gcalEventId: null, // will be set after re-push
      exercises: {
        create: data.exercises.map((ex, i) => ({
          name: ex.name,
          sets: ex.sets ?? null,
          reps: ex.reps ?? null,
          weightKg: ex.weightKg ?? null,
          restSec: ex.restSec ?? null,
          notes: ex.notes ?? null,
          order: ex.order ?? i,
        })),
      },
    },
    include: { exercises: { orderBy: { order: "asc" } } },
  });

  // Delete old GCal event
  if (existing?.gcalEventId) {
    syncDeleteFromGCal(existing.gcalEventId).catch(() => {});
  }

  // Create new GCal recurring event if scheduled
  const days = data.scheduledDays ?? [];
  if (days.length > 0 && data.scheduledTime) {
    pushWorkoutPlanToGCal(
      plan.id,
      plan.name,
      days,
      data.scheduledTime,
      data.description
    ).catch(() => {});
  }

  return NextResponse.json(plan);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const plan = await prisma.workoutPlan.findUnique({
    where: { id },
    select: { gcalEventId: true },
  });

  await prisma.workoutPlan.delete({ where: { id } });

  if (plan?.gcalEventId) {
    syncDeleteFromGCal(plan.gcalEventId).catch(() => {});
  }

  return new NextResponse(null, { status: 204 });
}
