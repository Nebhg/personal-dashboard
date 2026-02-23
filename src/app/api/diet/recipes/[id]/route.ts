import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recipeSchema } from "@/lib/validations/diet";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { stepNum: "asc" } },
    },
  });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = recipeSchema.parse(body);

  await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
  await prisma.recipeStep.deleteMany({ where: { recipeId: id } });

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description ?? null,
      prepTimeMins: data.prepTimeMins ?? null,
      cookTimeMins: data.cookTimeMins ?? null,
      servings: data.servings ?? null,
      calories: data.calories ?? null,
      protein: data.protein ?? null,
      carbs: data.carbs ?? null,
      fat: data.fat ?? null,
      notes: data.notes ?? null,
      ingredients: {
        create: data.ingredients.map((ing, i) => ({
          name: ing.name,
          amount: ing.amount ?? null,
          order: ing.order ?? i,
        })),
      },
      steps: {
        create: data.steps.map((step, i) => ({
          stepNum: step.stepNum ?? i + 1,
          text: step.text,
        })),
      },
    },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { stepNum: "asc" } },
    },
  });

  return NextResponse.json(recipe);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.recipe.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
