-- CreateTable
CREATE TABLE "MacroTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topic" TEXT NOT NULL,
    "track" INTEGER,
    "level" TEXT NOT NULL DEFAULT 'recall',
    "coveredAt" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
