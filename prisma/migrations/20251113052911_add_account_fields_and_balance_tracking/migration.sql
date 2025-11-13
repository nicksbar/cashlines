-- AlterTable
ALTER TABLE "Account" ADD COLUMN "accountNumber" TEXT;
ALTER TABLE "Account" ADD COLUMN "annualFee" REAL;
ALTER TABLE "Account" ADD COLUMN "cashBackPercent" REAL;
ALTER TABLE "Account" ADD COLUMN "currentBalance" REAL;
ALTER TABLE "Account" ADD COLUMN "interestRate" REAL;
ALTER TABLE "Account" ADD COLUMN "interestRateApy" REAL;
ALTER TABLE "Account" ADD COLUMN "isFdic" BOOLEAN;
ALTER TABLE "Account" ADD COLUMN "location" TEXT;
ALTER TABLE "Account" ADD COLUMN "minimumBalance" REAL;
ALTER TABLE "Account" ADD COLUMN "monthlyFee" REAL;
ALTER TABLE "Account" ADD COLUMN "pointsPerDollar" REAL;
ALTER TABLE "Account" ADD COLUMN "principalBalance" REAL;
ALTER TABLE "Account" ADD COLUMN "rewardsProgram" TEXT;

-- CreateTable
CREATE TABLE "BalanceSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "snapshotDate" DATETIME NOT NULL,
    "balance" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BalanceSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BalanceSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BalanceSnapshot_userId_idx" ON "BalanceSnapshot"("userId");

-- CreateIndex
CREATE INDEX "BalanceSnapshot_accountId_idx" ON "BalanceSnapshot"("accountId");

-- CreateIndex
CREATE INDEX "BalanceSnapshot_snapshotDate_idx" ON "BalanceSnapshot"("snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceSnapshot_accountId_snapshotDate_key" ON "BalanceSnapshot"("accountId", "snapshotDate");
