import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mealSchema } from "@/lib/validations/diet";
import { AREA_COLORS } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateStr = searchParams.get("date");

  const where = dateStr
    ? {
        date: {
          gte: new Date(dateStr + "T00:00:00"),
          lte: new Date(dateStr + "T23:59:59"),
        },
      }
    : {};

  const meals = await prisma.mealLog.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(meals);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.date === "string") body.date = new Date(body.date);
    const data = mealSchema.parse(body);

    const mealTypeLabel =
      data.mealType.charAt(0).toUpperCase() + data.mealType.slice(1);

    const meal = await prisma.mealLog.create({
      data: {
        date: data.date,
        mealType: data.mealType,
        description: data.description,
        calories: data.calories ?? null,
        protein: data.protein ?? null,
        carbs: data.carbs ?? null,
        fat: data.fat ?? null,
        notes: data.notes ?? null,
        calendarEvent: {
          create: {
            title: `${mealTypeLabel}: ${data.description}`,
            start: data.date,
            end: data.date,
            allDay: true,
            area: "DIET",
            color: AREA_COLORS.DIET,
          },
        },
      },
      include: { calendarEvent: true },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
