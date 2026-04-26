import { NextRequest, NextResponse } from "next/server";
import { listEvents, createEvent, PRIMARY_CALENDAR } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = new Date(searchParams.get("from") ?? Date.now());
  const to   = new Date(searchParams.get("to")   ?? Date.now() + 30 * 864e5);
  const calendarId = searchParams.get("calendarId") ?? PRIMARY_CALENDAR;
  try {
    const events = await listEvents(from, to, calendarId);
    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const calendarId = body.calendarId ?? PRIMARY_CALENDAR;
  try {
    const event = await createEvent(body, calendarId);
    return NextResponse.json(event);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
