import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regenerateProgressMd } from "@/lib/leetcode-sync";

export async function GET() {
  const problems = await prisma.leetCodeProblem.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(problems);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.date === "string" && body.date) {
      body.date = new Date(body.date);
    } else {
      body.date = new Date();
    }

    const problem = await prisma.leetCodeProblem.create({
      data: {
        date:       body.date,
        name:       body.name,
        number:     body.number     ?? null,
        pattern:    body.pattern    ?? null,
        difficulty: body.difficulty ?? null,
        timeMins:   body.timeMins   ?? null,
        approach:   body.approach   ?? null,
        confidence: body.confidence ?? null,
        notes:      body.notes      ?? null,
      },
    });

    regenerateProgressMd().catch(() => {});
    return NextResponse.json(problem, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
