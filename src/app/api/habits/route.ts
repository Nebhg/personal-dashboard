import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { habitSchema } from "@/lib/validations/habits";
import { startOfDay, subDays } from "date-fns";

export async function GET() {
  const since = subDays(startOfDay(new Date()), 90);

  const habits = await prisma.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        where: { date: { gte: since } },
        orderBy: { date: "desc" },
      },
    },
  });

  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.startDate === "string") body.startDate = new Date(body.startDate);
    const data = habitSchema.parse(body);

    const habit = await prisma.habit.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description ?? null,
        startDate: data.startDate,
        targetDays: data.targetDays ?? null,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
