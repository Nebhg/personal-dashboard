import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scheduleBlockSchema } from "@/lib/validations/schedule";
import { SCHEDULE_CATEGORIES } from "@/types";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (typeof body.start === "string") body.start = new Date(body.start);
  if (typeof body.end === "string") body.end = new Date(body.end);

  const data = scheduleBlockSchema.parse(body);
  const cat = SCHEDULE_CATEGORIES[data.category];
  const color = cat?.color ?? "#6366f1";

  const block = await prisma.scheduleBlock.update({
    where: { id },
    data: {
      title: data.title,
      start: data.start,
      end: data.end,
      allDay: data.allDay,
      category: data.category,
      color,
      notes: data.notes ?? null,
    },
  });

  // Update the linked calendar event title/times too
  await prisma.calendarEvent.updateMany({
    where: { scheduleBlockId: id },
    data: {
      title: data.title,
      start: data.start,
      end: data.end,
      allDay: data.allDay,
      color,
      description: data.notes ?? null,
    },
  });

  return NextResponse.json(block);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.scheduleBlock.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
