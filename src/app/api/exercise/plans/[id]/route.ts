import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workoutPlanSchema } from "@/lib/validations/exercise";

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

  // Replace all exercises
  await prisma.workoutPlanExercise.deleteMany({ where: { planId: id } });

  const plan = await prisma.workoutPlan.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description ?? null,
      scheduledDays: JSON.stringify(data.scheduledDays ?? []),
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

  return NextResponse.json(plan);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.workoutPlan.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
