import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regenerateMacroProgress } from "@/lib/macro-sync";

export async function GET() {
  const topics = await prisma.macroTopic.findMany({
    orderBy: [{ track: "asc" }, { coveredAt: "asc" }],
  });
  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.coveredAt === "string" && body.coveredAt) {
      body.coveredAt = new Date(body.coveredAt);
    } else {
      body.coveredAt = new Date();
    }

    const topic = await prisma.macroTopic.create({
      data: {
        topic:     body.topic,
        track:     body.track     ?? null,
        level:     body.level     ?? "recall",
        coveredAt: body.coveredAt,
        notes:     body.notes     ?? null,
      },
    });

    regenerateMacroProgress().catch(() => {});
    return NextResponse.json(topic, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
