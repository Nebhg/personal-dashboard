/**
 * gcal-sync.ts — server-only helpers for syncing domain events to Google Calendar.
 *
 * All functions are fire-and-forget safe (they never throw — they log errors internally).
 * Call them after your DB write, attach a `.catch(() => {})` and move on.
 *
 * GCal color mapping:
 *   workouts  → colorId "2" (green)
 *   learning  → colorId "9" (indigo/blue)
 */

import { prisma } from "./prisma";
import { createEvent, updateEvent, deleteEvent } from "./google-calendar";

// ─────────────────────────────────────────
// Recurring event utilities
// ─────────────────────────────────────────

const GCAL_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

/**
 * Build a RRULE string for a weekly recurring event.
 * daysOfWeek uses 0=Sun…6=Sat (same as DB storage).
 */
function buildRRule(daysOfWeek: number[], endsOn?: Date | null): string {
  const byDay = daysOfWeek.map((d) => GCAL_DAYS[d]).join(",");
  let rule = `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`;
  if (endsOn) {
    // UNTIL must be in UTC basic format e.g. 20261231T235959Z
    const until = endsOn.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
    rule += `;UNTIL=${until}`;
  }
  return rule;
}

/**
 * Find the next (or today's) date that falls on one of the given days of week,
 * then combine with a "HH:MM" time string to produce a full local datetime.
 * Returns ISO string in London time.
 */
function nextOccurrenceISO(daysOfWeek: number[], timeStr: string): string {
  const now = new Date();
  const todayDow = now.getDay();
  const sorted = [...daysOfWeek].sort((a, b) => a - b);
  const targetDow = sorted.find((d) => d >= todayDow) ?? sorted[0];
  const daysAhead = ((targetDow - todayDow) + 7) % 7;

  const date = new Date(now);
  date.setDate(date.getDate() + daysAhead);
  const [hh, mm] = timeStr.split(":").map(Number);
  date.setHours(hh, mm, 0, 0);

  // Format as local datetime string (no Z — GCal interprets with the timeZone field)
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hh)}:${pad(mm)}:00`;
}

// ─────────────────────────────────────────
// Push a workout session to Google Calendar
// ─────────────────────────────────────────

export async function pushWorkoutToGCal(
  workoutSessionId: string,
  calendarEventId: string,
  title: string,
  start: Date,
  end: Date,
  notes?: string | null
): Promise<void> {
  try {
    const gcal = await createEvent({
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: false,
      description: notes ?? undefined,
      colorId: "2", // green
    });
    await prisma.calendarEvent.update({
      where: { id: calendarEventId },
      data: { gcalEventId: gcal.id },
    });
  } catch (err) {
    console.error(`gcal-sync: failed to push workout ${workoutSessionId} to GCal`, err);
  }
}

// ─────────────────────────────────────────
// Push a learning session to Google Calendar
// ─────────────────────────────────────────

export async function pushLearningToGCal(
  learningSessionId: string,
  calendarEventId: string,
  title: string,
  start: Date,
  end: Date,
  notes?: string | null,
  resource?: string | null
): Promise<void> {
  try {
    const description = [notes, resource ? `Resource: ${resource}` : null]
      .filter(Boolean)
      .join("\n") || undefined;

    const gcal = await createEvent({
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: false,
      description,
      colorId: "9", // indigo
    });
    await prisma.calendarEvent.update({
      where: { id: calendarEventId },
      data: { gcalEventId: gcal.id },
    });
  } catch (err) {
    console.error(`gcal-sync: failed to push learning session ${learningSessionId} to GCal`, err);
  }
}

// ─────────────────────────────────────────
// Update an existing GCal event
// ─────────────────────────────────────────

export async function syncUpdateToGCal(
  gcalEventId: string,
  data: { title?: string; start?: Date; end?: Date; description?: string | null }
): Promise<void> {
  try {
    await updateEvent(gcalEventId, {
      title: data.title,
      start: data.start?.toISOString(),
      end: data.end?.toISOString(),
      description: data.description ?? undefined,
    });
  } catch (err) {
    console.error(`gcal-sync: failed to update GCal event ${gcalEventId}`, err);
  }
}

// ─────────────────────────────────────────
// Delete a GCal event by its ID
// ─────────────────────────────────────────

export async function syncDeleteFromGCal(gcalEventId: string): Promise<void> {
  try {
    await deleteEvent(gcalEventId);
  } catch (err) {
    // 404 = already deleted — not worth logging as an error
    const msg = String(err);
    if (!msg.includes("404") && !msg.includes("Not Found")) {
      console.error(`gcal-sync: failed to delete GCal event ${gcalEventId}`, err);
    }
  }
}

// ─────────────────────────────────────────
// Push a RecurringBlock to Google Calendar
// ─────────────────────────────────────────

export async function pushRecurringBlockToGCal(
  blockId: string,
  title: string,
  daysOfWeek: number[],
  startTime: string, // "HH:MM"
  endTime: string,   // "HH:MM"
  endsOn?: Date | null,
  notes?: string | null,
  colorId = "7"      // cyan — distinct from workout green / learning indigo
): Promise<void> {
  if (daysOfWeek.length === 0) return;
  try {
    const startISO = nextOccurrenceISO(daysOfWeek, startTime);
    const endISO = nextOccurrenceISO(daysOfWeek, endTime);
    const rrule = buildRRule(daysOfWeek, endsOn);

    const gcal = await createEvent({
      title,
      start: startISO,
      end: endISO,
      description: notes ?? undefined,
      colorId,
      recurrence: [rrule],
    });

    await prisma.recurringBlock.update({
      where: { id: blockId },
      data: { gcalEventId: gcal.id },
    });
  } catch (err) {
    console.error(`gcal-sync: failed to push recurring block ${blockId} to GCal`, err);
  }
}

// ─────────────────────────────────────────
// Push a WorkoutPlan to Google Calendar
// ─────────────────────────────────────────

export async function pushWorkoutPlanToGCal(
  planId: string,
  name: string,
  daysOfWeek: number[],
  scheduledTime: string, // "HH:MM"
  description?: string | null
): Promise<void> {
  if (daysOfWeek.length === 0 || !scheduledTime) return;
  try {
    // Assume 1 hour duration for plan events (no end time stored)
    const startISO = nextOccurrenceISO(daysOfWeek, scheduledTime);
    const [hh, mm] = scheduledTime.split(":").map(Number);
    const endHH = hh + 1;
    const endTime = `${String(endHH).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    const endISO = nextOccurrenceISO(daysOfWeek, endTime);
    const rrule = buildRRule(daysOfWeek);

    const gcal = await createEvent({
      title: `🏋️ ${name}`,
      start: startISO,
      end: endISO,
      description: description ?? undefined,
      colorId: "2", // green — matches logged workout sessions
      recurrence: [rrule],
    });

    await prisma.workoutPlan.update({
      where: { id: planId },
      data: { gcalEventId: gcal.id },
    });
  } catch (err) {
    console.error(`gcal-sync: failed to push workout plan ${planId} to GCal`, err);
  }
}
