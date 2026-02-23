import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recipeSchema } from "@/lib/validations/diet";

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { stepNum: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = recipeSchema.parse(body);

  const recipe = await prisma.recipe.create({
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

  return NextResponse.json(recipe, { status: 201 });
}
