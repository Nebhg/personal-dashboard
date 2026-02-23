import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const mealPlanEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  recipeId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function GET() {
  const entries = await prisma.mealPlanEntry.findMany({
    include: {
      recipe: { select: { id: true, name: true, calories: true, protein: true, carbs: true, fat: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }],
  });
  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const body = await req.json();

  // Accept a single entry or an array
  const entries = Array.isArray(body) ? body : [body];
  const parsed = entries.map((e) => mealPlanEntrySchema.parse(e));

  const results = await Promise.all(
    parsed.map((data) =>
      prisma.mealPlanEntry.upsert({
        where: { dayOfWeek_mealType: { dayOfWeek: data.dayOfWeek, mealType: data.mealType } },
        update: { recipeId: data.recipeId ?? null, description: data.description ?? null },
        create: {
          dayOfWeek: data.dayOfWeek,
          mealType: data.mealType,
          recipeId: data.recipeId ?? null,
          description: data.description ?? null,
        },
        include: {
          recipe: { select: { id: true, name: true, calories: true, protein: true, carbs: true, fat: true } },
        },
      })
    )
  );

  return NextResponse.json(results, { status: 200 });
}

export async function DELETE(req: Request) {
  const { dayOfWeek, mealType } = await req.json();
  await prisma.mealPlanEntry.deleteMany({ where: { dayOfWeek, mealType } });
  return new NextResponse(null, { status: 204 });
}
