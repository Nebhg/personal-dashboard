import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scheduleBlockSchema } from "@/lib/validations/schedule";
import { SCHEDULE_CATEGORIES } from "@/types";

export async function GET() {
  const blocks = await prisma.scheduleBlock.findMany({
    orderBy: { start: "asc" },
  });
  return NextResponse.json(blocks);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (typeof body.start === "string") body.start = new Date(body.start);
  if (typeof body.end === "string") body.end = new Date(body.end);

  const data = scheduleBlockSchema.parse(body);
  const cat = SCHEDULE_CATEGORIES[data.category];
  const color = cat?.color ?? "#6366f1";

  const block = await prisma.scheduleBlock.create({
    data: {
      title: data.title,
      start: data.start,
      end: data.end,
      allDay: data.allDay,
      category: data.category,
      color,
      notes: data.notes ?? null,
      calendarEvent: {
        create: {
          title: data.title,
          start: data.start,
          end: data.end,
          allDay: data.allDay,
          area: "SCHEDULE",
          color,
          description: data.notes ?? null,
        },
      },
    },
  });

  return NextResponse.json(block, { status: 201 });
}
