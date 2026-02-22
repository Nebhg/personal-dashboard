import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { habitSchema } from "@/lib/validations/habits";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const habit = await prisma.habit.findUnique({
    where: { id },
    include: { logs: { orderBy: { date: "desc" }, take: 90 } },
  });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(habit);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = habitSchema.partial().parse(body);
    const habit = await prisma.habit.update({ where: { id }, data });
    return NextResponse.json(habit);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.habit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
