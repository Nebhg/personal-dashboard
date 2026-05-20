import { NextRequest, NextResponse } from "next/server";
import { listEvents, createEvent, PRIMARY_CALENDAR } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  // Return empty list gracefully if Google Calendar is not configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json([]);
  }
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
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ error: "Google Calendar not configured" }, { status: 503 });
  }
  const body = await req.json();
  const calendarId = body.calendarId ?? PRIMARY_CALENDAR;
  try {
    const event = await createEvent(body, calendarId);
    return NextResponse.json(event);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
