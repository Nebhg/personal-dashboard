import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { learningSessionSchema } from "@/lib/validations/learning";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await prisma.learningSession.findUnique({
    where: { id },
    include: { calendarEvent: true },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = learningSessionSchema.partial().parse(body);
    const session = await prisma.learningSession.update({ where: { id }, data });
    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.learningSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
