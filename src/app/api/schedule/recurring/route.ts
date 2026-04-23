import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recurringBlockSchema } from "@/lib/validations/recurring-block";
import { SCHEDULE_CATEGORIES } from "@/types";

export async function GET() {
  const blocks = await prisma.recurringBlock.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(blocks);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (typeof body.endsOn === "string") body.endsOn = new Date(body.endsOn);

  const data = recurringBlockSchema.parse(body);
  const cat = SCHEDULE_CATEGORIES[data.category];
  const color = cat?.color ?? "#6366f1";

  const block = await prisma.recurringBlock.create({
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

  return NextResponse.json(block, { status: 201 });
}
