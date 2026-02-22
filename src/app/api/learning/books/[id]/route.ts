import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookSchema } from "@/lib/validations/learning";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = bookSchema.partial().parse(body);

    const finishedAt =
      data.status === "finished"
        ? { finishedAt: new Date() }
        : {};

    const book = await prisma.book.update({
      where: { id },
      data: { ...data, ...finishedAt },
    });

    return NextResponse.json(book);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
