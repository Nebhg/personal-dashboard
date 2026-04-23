import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regenerateProgressMd } from "@/lib/leetcode-sync";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (typeof body.date === "string" && body.date) {
      body.date = new Date(body.date);
    }

    const problem = await prisma.leetCodeProblem.update({
      where: { id },
      data: {
        ...(body.date       !== undefined && { date:       body.date }),
        ...(body.name       !== undefined && { name:       body.name }),
        ...(body.number     !== undefined && { number:     body.number }),
        ...(body.pattern    !== undefined && { pattern:    body.pattern }),
        ...(body.difficulty !== undefined && { difficulty: body.difficulty }),
        ...(body.timeMins   !== undefined && { timeMins:   body.timeMins }),
        ...(body.approach   !== undefined && { approach:   body.approach }),
        ...(body.confidence !== undefined && { confidence: body.confidence }),
        ...(body.notes      !== undefined && { notes:      body.notes }),
      },
    });

    regenerateProgressMd().catch(() => {});
    return NextResponse.json(problem);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.leetCodeProblem.delete({ where: { id } });
    regenerateProgressMd().catch(() => {});
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
