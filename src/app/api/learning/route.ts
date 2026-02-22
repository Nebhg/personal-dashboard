import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { learningSessionSchema } from "@/lib/validations/learning";
import { AREA_COLORS } from "@/types";

export async function GET() {
  const sessions = await prisma.learningSession.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.date === "string") body.date = new Date(body.date);
    const data = learningSessionSchema.parse(body);

    const endTime = new Date(data.date.getTime() + data.durationMin * 60 * 1000);

    const session = await prisma.learningSession.create({
      data: {
        date: data.date,
        category: data.category,
        title: data.title,
        durationMin: data.durationMin,
        notes: data.notes ?? null,
        resource: data.resource ?? null,
        calendarEvent: {
          create: {
            title: `${data.category}: ${data.title}`,
            start: data.date,
            end: endTime,
            allDay: false,
            area: "LEARNING",
            color: AREA_COLORS.LEARNING,
          },
        },
      },
      include: { calendarEvent: true },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
