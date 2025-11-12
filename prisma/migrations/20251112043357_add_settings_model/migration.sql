-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "monthlyIncomeTarget" REAL,
    "monthlyExpenseTarget" REAL,
    "savingsTarget" REAL,
    "savingsRate" REAL,
    "needPercent" REAL NOT NULL DEFAULT 50,
    "wantPercent" REAL NOT NULL DEFAULT 30,
    "savingsPercent" REAL NOT NULL DEFAULT 20,
    "lowBalanceThreshold" REAL,
    "highCreditCardThreshold" REAL,
    "trackedCategories" TEXT NOT NULL,
    "excludeFromBudget" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "fiscalYearStart" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Setting_userId_idx" ON "Setting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_userId_key" ON "Setting"("userId");
