import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recurringBlockSchema } from "@/lib/validations/recurring-block";
import { SCHEDULE_CATEGORIES } from "@/types";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (typeof body.endsOn === "string") body.endsOn = new Date(body.endsOn);

  const data = recurringBlockSchema.parse(body);
  const cat = SCHEDULE_CATEGORIES[data.category];
  const color = cat?.color ?? "#6366f1";

  const block = await prisma.recurringBlock.update({
    where: { id },
    data: {
      title: data.title,
      category: data.category,
      color,
      startTime: data.startTime,
      endTime: data.endTime,
      daysOfWeek: JSON.stringify(data.daysOfWeek),
      endsOn: data.endsOn ?? null,
      notes: data.notes ?? null,
    },
  });

  return NextResponse.json(block);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.recurringBlock.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
