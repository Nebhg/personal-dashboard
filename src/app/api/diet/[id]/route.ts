import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mealSchema } from "@/lib/validations/diet";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meal = await prisma.mealLog.findUnique({
    where: { id },
    include: { calendarEvent: true },
  });
  if (!meal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(meal);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = mealSchema.partial().parse(body);

    const meal = await prisma.mealLog.update({
      where: { id },
      data: {
        ...(data.date && { date: data.date }),
        ...(data.mealType && { mealType: data.mealType }),
        ...(data.description && { description: data.description }),
        calories: data.calories ?? undefined,
        protein: data.protein ?? undefined,
        carbs: data.carbs ?? undefined,
        fat: data.fat ?? undefined,
        notes: data.notes ?? undefined,
      },
    });

    if (data.description || data.mealType || data.date) {
      const updated = await prisma.mealLog.findUnique({
        where: { id },
        select: { description: true, mealType: true, date: true, calendarEvent: { select: { id: true } } },
      });
      if (updated?.calendarEvent?.id) {
        const label = updated.mealType.charAt(0).toUpperCase() + updated.mealType.slice(1);
        await prisma.calendarEvent.update({
          where: { id: updated.calendarEvent.id },
          data: {
            title: `${label}: ${updated.description}`,
            start: updated.date,
            end: updated.date,
          },
        });
      }
    }

    return NextResponse.json(meal);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.mealLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
