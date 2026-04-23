import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regenerateMacroProgress } from "@/lib/macro-sync";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (typeof body.coveredAt === "string" && body.coveredAt) {
      body.coveredAt = new Date(body.coveredAt);
    }

    const topic = await prisma.macroTopic.update({
      where: { id },
      data: {
        ...(body.topic     !== undefined && { topic:     body.topic }),
        ...(body.track     !== undefined && { track:     body.track }),
        ...(body.level     !== undefined && { level:     body.level }),
        ...(body.coveredAt !== undefined && { coveredAt: body.coveredAt }),
        ...(body.notes     !== undefined && { notes:     body.notes }),
      },
    });

    regenerateMacroProgress().catch(() => {});
    return NextResponse.json(topic);
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
    await prisma.macroTopic.delete({ where: { id } });
    regenerateMacroProgress().catch(() => {});
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
