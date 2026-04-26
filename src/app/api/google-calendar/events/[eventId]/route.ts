import { NextRequest, NextResponse } from "next/server";
import { updateEvent, deleteEvent, PRIMARY_CALENDAR } from "@/lib/google-calendar";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const body = await req.json();
  const calendarId = body.calendarId ?? PRIMARY_CALENDAR;
  try {
    const event = await updateEvent(eventId, body, calendarId);
    return NextResponse.json(event);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get("calendarId") ?? PRIMARY_CALENDAR;
  try {
    await deleteEvent(eventId, calendarId);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
