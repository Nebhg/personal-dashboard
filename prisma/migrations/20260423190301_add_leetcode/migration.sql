-- CreateTable
CREATE TABLE "LeetCodeProblem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER,
    "pattern" TEXT,
    "difficulty" TEXT,
    "timeMins" INTEGER,
    "approach" TEXT,
    "confidence" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
