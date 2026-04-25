-- CreateTable
CREATE TABLE "InvestmentAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "cashBalanceGbp" REAL NOT NULL DEFAULT 0,
    "interestRate" REAL,
    "isaAllowanceUsed" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InvestmentHolding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "ticker" TEXT,
    "name" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "priceCurrency" TEXT NOT NULL DEFAULT 'USD',
    "lastPrice" REAL,
    "valueGbp" REAL,
    "costGbp" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvestmentHolding_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "InvestmentAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
