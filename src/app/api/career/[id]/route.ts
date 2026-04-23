import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regenerateTrackerMd } from "@/lib/career-sync";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (typeof body.appliedDate === "string" && body.appliedDate) {
      body.appliedDate = new Date(body.appliedDate);
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(body.firm        !== undefined && { firm:        body.firm }),
        ...(body.role        !== undefined && { role:        body.role }),
        ...(body.stage       !== undefined && { stage:       body.stage }),
        ...(body.appliedDate !== undefined && { appliedDate: body.appliedDate }),
        ...(body.lastAction  !== undefined && { lastAction:  body.lastAction }),
        ...(body.nextAction  !== undefined && { nextAction:  body.nextAction }),
        ...(body.prepNeeded  !== undefined && { prepNeeded:  body.prepNeeded }),
        ...(body.prepNotes   !== undefined && { prepNotes:   body.prepNotes }),
        ...(body.notes       !== undefined && { notes:       body.notes }),
      },
    });

    // Keep tracker.md in sync — fire and forget, never block the response
    regenerateTrackerMd().catch(() => {});

    return NextResponse.json(application);
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
    await prisma.jobApplication.delete({ where: { id } });
    regenerateTrackerMd().catch(() => {});
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
