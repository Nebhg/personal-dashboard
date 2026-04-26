/**
 * sync-existing-to-gcal.ts
 *
 * One-shot script to push existing dashboard events to Google Calendar.
 * Handles: WorkoutSessions, LearningSessions, RecurringBlocks, WorkoutPlans.
 * Only processes items that don't already have a gcalEventId — safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/sync-existing-to-gcal.ts
 */

import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env.local") });

import { createClient } from "@libsql/client";
import { google } from "googleapis";

const DB_PATH = process.env.DATABASE_URL?.replace("file:", "") ?? path.join(__dirname, "../prisma/dev.db");
const db = createClient({ url: `file:${DB_PATH}` });

// ── GCal helpers ──────────────────────────────────────────────────────────────

function getGCalClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: "v3", auth: oauth2 });
}

type CalClient = ReturnType<typeof getGCalClient>;

async function insertEvent(
  cal: CalClient,
  title: string,
  startISO: string,
  endISO: string,
  description: string | null,
  colorId: string,
  recurrence?: string[]
): Promise<string> {
  const res = await cal.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: title,
      description: description ?? undefined,
      colorId,
      recurrence: recurrence ?? undefined,
      start: { dateTime: startISO, timeZone: "Europe/London" },
      end: { dateTime: endISO, timeZone: "Europe/London" },
    },
  });
  return res.data.id!;
}

// ── Recurring event helpers ───────────────────────────────────────────────────

const GCAL_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function buildRRule(daysOfWeek: number[], endsOn?: string | null): string {
  const byDay = daysOfWeek.map((d) => GCAL_DAYS[d]).join(",");
  let rule = `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`;
  if (endsOn) {
    const until = new Date(endsOn).toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
    rule += `;UNTIL=${until}`;
  }
  return rule;
}

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
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hh)}:${pad(mm)}:00`;
}

function addHour(timeStr: string): string {
  const [hh, mm] = timeStr.split(":").map(Number);
  return `${String(hh + 1).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const cal = getGCalClient();
  let synced = 0;
  let failed = 0;

  // ── Recurring blocks ────────────────────────────────────────────────────────
  console.log("\n── Recurring blocks ─────────────────────────────────────────");
  const blocks = await db.execute(`
    SELECT id, title, daysOfWeek, startTime, endTime, endsOn, notes
    FROM RecurringBlock
    WHERE gcalEventId IS NULL OR gcalEventId = ''
  `);

  for (const row of blocks.rows) {
    const daysOfWeek: number[] = JSON.parse(row.daysOfWeek as string);
    if (daysOfWeek.length === 0) { console.log(`  ~ skipped (no days): ${row.title}`); continue; }

    const startISO = nextOccurrenceISO(daysOfWeek, row.startTime as string);
    const endISO = nextOccurrenceISO(daysOfWeek, row.endTime as string);
    const rrule = buildRRule(daysOfWeek, row.endsOn as string | null);

    try {
      const gcalId = await insertEvent(
        cal, row.title as string, startISO, endISO,
        row.notes as string | null, "7", [rrule]
      );
      await db.execute({
        sql: `UPDATE RecurringBlock SET gcalEventId = ? WHERE id = ?`,
        args: [gcalId, row.id as string],
      });
      console.log(`  ✓ ${row.title} (${daysOfWeek.map(d => GCAL_DAYS[d]).join(",")} @ ${row.startTime})`);
      synced++;
      await sleep(300);
    } catch (err) {
      console.error(`  ✗ Failed: ${row.title}`, err);
      failed++;
    }
  }
  if (blocks.rows.length === 0) console.log("  (none to sync)");

  // ── Workout plans ───────────────────────────────────────────────────────────
  console.log("\n── Workout plans ────────────────────────────────────────────");
  const plans = await db.execute(`
    SELECT id, name, scheduledDays, scheduledTime, description
    FROM WorkoutPlan
    WHERE (gcalEventId IS NULL OR gcalEventId = '')
      AND scheduledTime IS NOT NULL AND scheduledTime != ''
  `);

  for (const row of plans.rows) {
    const daysOfWeek: number[] = JSON.parse(row.scheduledDays as string);
    if (daysOfWeek.length === 0) { console.log(`  ~ skipped (no days): ${row.name}`); continue; }

    const startTime = row.scheduledTime as string;
    const endTime = addHour(startTime);
    const startISO = nextOccurrenceISO(daysOfWeek, startTime);
    const endISO = nextOccurrenceISO(daysOfWeek, endTime);
    const rrule = buildRRule(daysOfWeek);

    try {
      const gcalId = await insertEvent(
        cal, `🏋️ ${row.name}`, startISO, endISO,
        row.description as string | null, "2", [rrule]
      );
      await db.execute({
        sql: `UPDATE WorkoutPlan SET gcalEventId = ? WHERE id = ?`,
        args: [gcalId, row.id as string],
      });
      console.log(`  ✓ ${row.name} (${daysOfWeek.map(d => GCAL_DAYS[d]).join(",")} @ ${startTime})`);
      synced++;
      await sleep(300);
    } catch (err) {
      console.error(`  ✗ Failed: ${row.name}`, err);
      failed++;
    }
  }
  if (plans.rows.length === 0) console.log("  (none to sync)");

  // ── One-off workout sessions ────────────────────────────────────────────────
  console.log("\n── Workout sessions ─────────────────────────────────────────");
  const workouts = await db.execute(`
    SELECT ws.id, ws.date, ws.name, ws.durationMin, ws.notes,
           ce.id as calEventId, ce.gcalEventId
    FROM WorkoutSession ws
    LEFT JOIN CalendarEvent ce ON ce.workoutSessionId = ws.id
    WHERE ce.id IS NOT NULL AND (ce.gcalEventId IS NULL OR ce.gcalEventId = '')
    ORDER BY ws.date DESC
  `);

  for (const row of workouts.rows) {
    const start = new Date(row.date as string);
    const end = new Date(start.getTime() + (row.durationMin as number) * 60 * 1000);
    const title = `${row.name} (${row.durationMin}min)`;
    try {
      const gcalId = await insertEvent(
        cal, title, start.toISOString(), end.toISOString(),
        row.notes as string | null, "2"
      );
      await db.execute({
        sql: `UPDATE CalendarEvent SET gcalEventId = ? WHERE id = ?`,
        args: [gcalId, row.calEventId as string],
      });
      console.log(`  ✓ ${title} (${(row.date as string).slice(0, 10)})`);
      synced++;
      await sleep(200);
    } catch (err) {
      console.error(`  ✗ Failed: ${title}`, err);
      failed++;
    }
  }
  if (workouts.rows.length === 0) console.log("  (none to sync)");

  // ── Learning sessions ───────────────────────────────────────────────────────
  console.log("\n── Learning sessions ────────────────────────────────────────");
  const learning = await db.execute(`
    SELECT ls.id, ls.date, ls.category, ls.title, ls.durationMin, ls.notes, ls.resource,
           ce.id as calEventId, ce.gcalEventId
    FROM LearningSession ls
    LEFT JOIN CalendarEvent ce ON ce.learningSessionId = ls.id
    WHERE ce.id IS NOT NULL AND (ce.gcalEventId IS NULL OR ce.gcalEventId = '')
    ORDER BY ls.date DESC
  `);

  for (const row of learning.rows) {
    const start = new Date(row.date as string);
    const end = new Date(start.getTime() + (row.durationMin as number) * 60 * 1000);
    const title = `${row.category}: ${row.title}`;
    const description = [
      row.notes as string | null,
      row.resource ? `Resource: ${row.resource}` : null,
    ].filter(Boolean).join("\n") || null;

    try {
      const gcalId = await insertEvent(
        cal, title, start.toISOString(), end.toISOString(),
        description, "9"
      );
      await db.execute({
        sql: `UPDATE CalendarEvent SET gcalEventId = ? WHERE id = ?`,
        args: [gcalId, row.calEventId as string],
      });
      console.log(`  ✓ ${title} (${(row.date as string).slice(0, 10)})`);
      synced++;
      await sleep(200);
    } catch (err) {
      console.error(`  ✗ Failed: ${title}`, err);
      failed++;
    }
  }
  if (learning.rows.length === 0) console.log("  (none to sync)");

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log(`\n── Done ─────────────────────────────────────────────────────`);
  console.log(`  Synced:  ${synced}`);
  console.log(`  Failed:  ${failed}`);
  console.log();

  await db.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
