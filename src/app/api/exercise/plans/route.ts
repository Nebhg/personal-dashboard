import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workoutPlanSchema } from "@/lib/validations/exercise";

export async function GET() {
  const plans = await prisma.workoutPlan.findMany({
    include: { exercises: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = workoutPlanSchema.parse(body);

  const plan = await prisma.workoutPlan.create({
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

  return NextResponse.json(plan, { status: 201 });
}
