import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../.env.local") });

import { createClient } from "@libsql/client";
const db = createClient({ url: `file:${path.join(__dirname, "../prisma/dev.db")}` });

async function main() {
  const tables = [
    "WorkoutSession",
    "LearningSession",
    "WorkoutPlan",
    "RecurringBlock",
    "CalendarEvent",
    "HabitLog",
    "MealLog",
  ];
  for (const t of tables) {
    const r = await db.execute(`SELECT COUNT(*) as n FROM "${t}"`);
    console.log(`${t.padEnd(20)}: ${r.rows[0].n}`);
  }

  // Also check CalendarEvent breakdown by area
  console.log("\nCalendarEvent by area:");
  const areas = await db.execute(
    `SELECT area, COUNT(*) as n FROM CalendarEvent GROUP BY area ORDER BY n DESC`
  );
  for (const row of areas.rows) {
    console.log(`  ${String(row.area).padEnd(12)}: ${row.n}`);
  }

  // Check gcalEventId column exists
  console.log("\ngcalEventId column exists:");
  const cols = await db.execute(`PRAGMA table_info(CalendarEvent)`);
  const has = cols.rows.some((r) => r.name === "gcalEventId");
  console.log(`  ${has ? "YES ✓" : "NO ✗ — run: npx prisma migrate dev --name add_gcal_event_id"}`);

  await db.close();
}

main().catch(console.error);
