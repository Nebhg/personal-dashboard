-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prepTimeMins" INTEGER,
    "cookTimeMins" INTEGER,
    "servings" INTEGER,
    "calories" INTEGER,
    "protein" INTEGER,
    "carbs" INTEGER,
    "fat" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "stepNum" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorkoutPlanExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "weightKg" REAL,
    "restSec" INTEGER,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WorkoutPlanExercise_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduleBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL,
    "color" TEXT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CalendarEvent_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_learningSessionId_fkey" FOREIGN KEY ("learningSessionId") REFERENCES "LearningSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_habitLogId_fkey" FOREIGN KEY ("habitLogId") REFERENCES "HabitLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_scheduleBlockId_fkey" FOREIGN KEY ("scheduleBlockId") REFERENCES "ScheduleBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CalendarEvent" ("allDay", "area", "color", "createdAt", "description", "end", "habitLogId", "id", "learningSessionId", "mealLogId", "start", "title", "updatedAt", "workoutSessionId") SELECT "allDay", "area", "color", "createdAt", "description", "end", "habitLogId", "id", "learningSessionId", "mealLogId", "start", "title", "updatedAt", "workoutSessionId" FROM "CalendarEvent";
DROP TABLE "CalendarEvent";
ALTER TABLE "new_CalendarEvent" RENAME TO "CalendarEvent";
CREATE UNIQUE INDEX "CalendarEvent_mealLogId_key" ON "CalendarEvent"("mealLogId");
CREATE UNIQUE INDEX "CalendarEvent_workoutSessionId_key" ON "CalendarEvent"("workoutSessionId");
CREATE UNIQUE INDEX "CalendarEvent_learningSessionId_key" ON "CalendarEvent"("learningSessionId");
CREATE UNIQUE INDEX "CalendarEvent_habitLogId_key" ON "CalendarEvent"("habitLogId");
CREATE UNIQUE INDEX "CalendarEvent_scheduleBlockId_key" ON "CalendarEvent"("scheduleBlockId");
CREATE TABLE "new_MealLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "mealType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "calories" INTEGER,
    "protein" INTEGER,
    "carbs" INTEGER,
    "fat" INTEGER,
    "notes" TEXT,
    "recipeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MealLog_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MealLog" ("calories", "carbs", "createdAt", "date", "description", "fat", "id", "mealType", "notes", "protein", "updatedAt") SELECT "calories", "carbs", "createdAt", "date", "description", "fat", "id", "mealType", "notes", "protein", "updatedAt" FROM "MealLog";
DROP TABLE "MealLog";
ALTER TABLE "new_MealLog" RENAME TO "MealLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
