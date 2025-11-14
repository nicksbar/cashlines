-- Add website URL fields for links to recurring expenses and transactions
ALTER TABLE "RecurringExpense" ADD COLUMN "websiteUrl" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "websiteUrl" TEXT;
