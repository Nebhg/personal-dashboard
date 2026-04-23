-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firm" TEXT NOT NULL,
    "role" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'APPLIED',
    "appliedDate" DATETIME,
    "lastAction" TEXT,
    "nextAction" TEXT,
    "prepNeeded" BOOLEAN NOT NULL DEFAULT false,
    "prepNotes" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
