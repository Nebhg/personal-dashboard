import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regenerateTrackerMd } from "@/lib/career-sync";

export async function GET() {
  const applications = await prisma.jobApplication.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(applications);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.appliedDate === "string" && body.appliedDate) {
      body.appliedDate = new Date(body.appliedDate);
    } else {
      body.appliedDate = null;
    }

    const application = await prisma.jobApplication.create({
      data: {
        firm:        body.firm,
        role:        body.role        ?? null,
        stage:       body.stage       ?? "APPLIED",
        appliedDate: body.appliedDate ?? null,
        lastAction:  body.lastAction  ?? null,
        nextAction:  body.nextAction  ?? null,
        prepNeeded:  body.prepNeeded  ?? false,
        prepNotes:   body.prepNotes   ?? null,
        notes:       body.notes       ?? null,
      },
    });

    regenerateTrackerMd().catch(() => {});
    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
