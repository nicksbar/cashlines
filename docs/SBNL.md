# Spent But Not Listed (SBNL)

## What is SBNL?

**Spent But Not Listed (SBNL)** is a financial metric that reveals how much you're spending beyond what you've explicitly tracked.

It's calculated as:

```
SBNL = Total CC Payment (next month) - Tracked Expenses (this month)
```

## Why This Matters

Traditional expense tracking fails because it requires you to log every single purchase. In reality:

- You make impulse purchases you forget to log
- You spend cash that's harder to track
- You have small discretionary purchases that add up
- You might use multiple payment methods

**SBNL quantifies the gap between your "official" spending and your actual spending.**

## How It Works

### Example

**November spending:**
- Tracked expenses (bills, known purchases): **$1,200**

**December CC payment:**
- You pay off your CC: **$1,850**

**SBNL calculation:**
- SBNL = $1,850 - $1,200 = **$650**
- Percentage = ($650 / $1,850) = **35%**

This means **$650 (35% of your spending)** was untracked purchases in November.

## Why This Reveals Truth

You can't ignore SBNL because it's based on actual money leaving your account. It's:

- **Honest**: Based on real transactions and payments
- **Comprehensive**: Catches everything, including forgotten expenses
- **Actionable**: Shows you where your tracking gaps are
- **Trend-revealing**: Helps you spot spending pattern changes

## Using SBNL in Cashlines

### View SBNL Report

Get the SBNL calculation via API:

```bash
GET /api/reports/untracked?month=11&year=2024
```

Response includes:
- Tracked expenses amount
- CC payment amount
- SBNL in dollars
- SBNL as percentage of total payment

### Interpret the Results

**SBNL < 5%**
- Excellent tracking
- You're capturing almost all expenses
- Keep up your system

**SBNL 5-15%**
- Good tracking
- Minor gaps are normal
- Consider if you want tighter tracking

**SBNL 15-25%**
- Moderate gaps
- You're missing meaningful spending
- Review which categories might be missing

**SBNL > 25%**
- Significant untracked spending
- Consider adding spending categories
- Identify where discretionary spending occurs

## Common Reasons for SBNL

1. **Cash spending** - Not tracked in your digital system
2. **Forgotten expenses** - Small purchases you didn't log
3. **Other payment methods** - Using multiple cards/apps
4. **Categorization issues** - Spending logged but to wrong account
5. **Subscriptions** - Recurring charges you overlooked
6. **Discretionary spending** - Impulse purchases not fitting into categories

## Strategies to Reduce SBNL

### 1. Identify the Source
- Review your actual CC statement
- Mark which items you already logged
- What's left? That's your SBNL

### 2. Add Missing Categories
- Look for patterns in untracked spending
- Add new expense categories for gap areas
- Update your routing rules

### 3. Create Discretionary Category
- Add "Discretionary" or "Unallocated" category
- Use it for small purchases you didn't plan
- Review monthly to understand spending

### 4. Tighten Your Tracking
- Log purchases immediately (mobile app or quick entry)
- Batch log purchases weekly
- Use templates for recurring unplanned expenses

### 5. Review Payment Methods
- Ensure you're tracking all CC accounts
- Check if spending is split across multiple cards
- Look for debit transactions you haven't logged

## Technical Details

### API Endpoint

```
GET /api/reports/untracked
```

**Query Parameters:**
- `month` (1-12): Month to analyze
- `year`: Year to analyze
- `accountId` (optional): Specific CC account

**Response:**
```json
{
  "month": 11,
  "year": 2024,
  "creditCards": [
    {
      "accountId": "acc_123",
      "accountName": "Chase Sapphire",
      "trackedExpenses": 1200.00,
      "estimatedCCPayment": 1850.00,
      "spentButNotListed": 650.00,
      "percentage": 35
    }
  ],
  "totalSpentButNotListed": 650.00,
  "percentageOfPayment": 35
}
```

### Utility Functions

```typescript
// Calculate SBNL
const { spentButNotListed, percentage, description } = calculateSBNL(
  1850, // CC payment amount
  1200  // Tracked expenses
)

// Analyze trends
const trend = analyzeSBNLTrend([
  { month: 9, year: 2024, sbnl: 400, payment: 2000 },
  { month: 10, year: 2024, sbnl: 500, payment: 2100 },
  { month: 11, year: 2024, sbnl: 650, payment: 1850 },
])

// Get insights
const insights = generateSBNLInsights(650, 35, 1850)
```

## Monthly Tracking

For best results, track SBNL monthly:

| Month | Tracked | Payment | SBNL | % |
|-------|---------|---------|------|---|
| Sept  | $1,600  | $2,000  | $400 | 20% |
| Oct   | $1,550  | $2,100  | $550 | 26% |
| Nov   | $1,200  | $1,850  | $650 | 35% |
| Dec   | $1,400  | $1,900  | $500 | 26% |

**Insights from trend:**
- November had highest SBNL (holiday shopping?)
- Relatively consistent at 20-26% range
- Consider if this is acceptable or wants improvement

## The Philosophy

SBNL is about **honest financial awareness**, not guilt or blame.

- It's not a bug in your tracking—it's a feature
- It reveals your *actual* spending patterns
- It shows where your money really goes
- It enables better decision-making

Traditional budgets fail because they try to predict and constrain. SBNL succeeds because it measures reality and lets you decide what to do with that knowledge.

---

Use SBNL to transform untracked spending from a mystery into actionable insight.
