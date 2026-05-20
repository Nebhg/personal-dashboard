import { NextRequest, NextResponse } from "next/server";
import { updateEvent, deleteEvent, PRIMARY_CALENDAR } from "@/lib/google-calendar";

const gcalConfigured = () =>
  !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  if (!gcalConfigured()) return NextResponse.json({ error: "Google Calendar not configured" }, { status: 503 });
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
  if (!gcalConfigured()) return NextResponse.json({ error: "Google Calendar not configured" }, { status: 503 });
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
