import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";

function getClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export const PRIMARY_CALENDAR = "primary";

import { GCAL_COLORS } from "./gcal-colors";
export { GCAL_COLORS } from "./gcal-colors";

export type GCalEvent = {
  id: string;
  title: string;
  start: string;        // ISO string
  end: string;          // ISO string
  allDay: boolean;
  description?: string | null;
  location?: string | null;
  colorId?: string | null;
  color?: string | null; // resolved hex
  calendarId: string;
};

function toDTO(event: calendar_v3.Schema$Event, calendarId: string): GCalEvent {
  const allDay = !!event.start?.date;
  // All-day: use noon UTC to avoid timezone-shifting the date
  const start = allDay
    ? `${event.start!.date}T12:00:00.000Z`
    : (event.start?.dateTime ?? "");
  const end = allDay
    ? `${event.end!.date}T12:00:00.000Z`
    : (event.end?.dateTime ?? "");
  return {
    id: event.id!,
    title: event.summary ?? "(no title)",
    start,
    end,
    allDay,
    description: event.description ?? null,
    location: event.location ?? null,
    colorId: event.colorId ?? null,
    color: event.colorId ? (GCAL_COLORS[event.colorId] ?? null) : null,
    calendarId,
  };
}

export async function listCalendars() {
  const cal = getClient();
  const res = await cal.calendarList.list();
  return (res.data.items ?? []).map((c) => ({
    id: c.id!,
    name: c.summary ?? c.id!,
    primary: !!c.primary,
    color: c.backgroundColor ?? null,
  }));
}

export async function listEvents(from: Date, to: Date, calendarId = PRIMARY_CALENDAR): Promise<GCalEvent[]> {
  const cal = getClient();
  const res = await cal.events.list({
    calendarId,
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 500,
  });
  return (res.data.items ?? []).map((e) => toDTO(e, calendarId));
}

export async function createEvent(
  data: { title: string; start: string; end: string; allDay?: boolean; description?: string; location?: string; colorId?: string },
  calendarId = PRIMARY_CALENDAR
): Promise<GCalEvent> {
  const cal = getClient();
  const res = await cal.events.insert({
    calendarId,
    requestBody: {
      summary: data.title,
      description: data.description || undefined,
      location: data.location || undefined,
      colorId: data.colorId || undefined,
      start: data.allDay
        ? { date: data.start.split("T")[0] }
        : { dateTime: data.start, timeZone: "Europe/London" },
      end: data.allDay
        ? { date: data.end.split("T")[0] }
        : { dateTime: data.end, timeZone: "Europe/London" },
    },
  });
  return toDTO(res.data, calendarId);
}

export async function updateEvent(
  eventId: string,
  data: { title?: string; start?: string; end?: string; allDay?: boolean; description?: string; location?: string; colorId?: string },
  calendarId = PRIMARY_CALENDAR
): Promise<GCalEvent> {
  const cal = getClient();
  const patch: calendar_v3.Schema$Event = {
    summary: data.title,
    description: data.description ?? undefined,
    location: data.location ?? undefined,
    colorId: data.colorId ?? undefined,
  };
  if (data.start) {
    patch.start = data.allDay
      ? { date: data.start.split("T")[0] }
      : { dateTime: data.start, timeZone: "Europe/London" };
  }
  if (data.end) {
    patch.end = data.allDay
      ? { date: data.end.split("T")[0] }
      : { dateTime: data.end, timeZone: "Europe/London" };
  }
  const res = await cal.events.patch({ calendarId, eventId, requestBody: patch });
  return toDTO(res.data, calendarId);
}

export async function deleteEvent(eventId: string, calendarId = PRIMARY_CALENDAR): Promise<void> {
  const cal = getClient();
  await cal.events.delete({ calendarId, eventId });
}
