-- CreateTable
CREATE TABLE "HydrationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SleepLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "bedTime" DATETIME NOT NULL,
    "wakeTime" DATETIME NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "quality" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CalendarEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "area" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "mealLogId" TEXT,
    "workoutSessionId" TEXT,
    "learningSessionId" TEXT,
    "habitLogId" TEXT,
    "scheduleBlockId" TEXT,
    "sleepLogId" TEXT,
    "gcalEventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CalendarEvent_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_learningSessionId_fkey" FOREIGN KEY ("learningSessionId") REFERENCES "LearningSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_habitLogId_fkey" FOREIGN KEY ("habitLogId") REFERENCES "HabitLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_scheduleBlockId_fkey" FOREIGN KEY ("scheduleBlockId") REFERENCES "ScheduleBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_sleepLogId_fkey" FOREIGN KEY ("sleepLogId") REFERENCES "SleepLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CalendarEvent" ("allDay", "area", "color", "createdAt", "description", "end", "gcalEventId", "habitLogId", "id", "learningSessionId", "mealLogId", "scheduleBlockId", "start", "title", "updatedAt", "workoutSessionId") SELECT "allDay", "area", "color", "createdAt", "description", "end", "gcalEventId", "habitLogId", "id", "learningSessionId", "mealLogId", "scheduleBlockId", "start", "title", "updatedAt", "workoutSessionId" FROM "CalendarEvent";
DROP TABLE "CalendarEvent";
ALTER TABLE "new_CalendarEvent" RENAME TO "CalendarEvent";
CREATE UNIQUE INDEX "CalendarEvent_mealLogId_key" ON "CalendarEvent"("mealLogId");
CREATE UNIQUE INDEX "CalendarEvent_workoutSessionId_key" ON "CalendarEvent"("workoutSessionId");
CREATE UNIQUE INDEX "CalendarEvent_learningSessionId_key" ON "CalendarEvent"("learningSessionId");
CREATE UNIQUE INDEX "CalendarEvent_habitLogId_key" ON "CalendarEvent"("habitLogId");
CREATE UNIQUE INDEX "CalendarEvent_scheduleBlockId_key" ON "CalendarEvent"("scheduleBlockId");
CREATE UNIQUE INDEX "CalendarEvent_sleepLogId_key" ON "CalendarEvent"("sleepLogId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "HydrationLog_date_idx" ON "HydrationLog"("date");

-- CreateIndex
CREATE INDEX "SleepLog_date_idx" ON "SleepLog"("date");
