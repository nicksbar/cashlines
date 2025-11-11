# Dashboard Charts & Visualizations

## Overview

The Cashlines dashboard now includes comprehensive visualizations to help you understand your financial patterns.

## Charts Available

### 1. Spending by Category (Pie Chart)
Shows how your expenses are distributed across different spending categories:
- **Need** (Housing, Food, Transport, Utilities, Insurance)
- **Want** (Dining, Entertainment, Shopping, Kids)
- **Debt** (Loan payments)
- **Tax** (Tax payments)
- **Savings** (Transfers to savings)

**Use case**: Understand where your money is actually going at a glance.

### 2. Income vs Expenses (Bar Chart)
Compares your income and expenses for the current month vs the previous month.

**Use case**: See if you're earning more/less and spending more/less month-over-month.

### 3. Spending by Method (Horizontal Bar Chart)
Shows how much you spent using each payment method:
- **Credit Card** - Tracked transactions
- **Cash** - Cash payments
- **ACH** - Bank transfers
- **Other** - Check, etc.

**Use case**: Understand your payment method preferences and potential credit card rewards.

### 4. Budget Allocation Target (Pie Chart)
Shows the ideal budget distribution:
- **Need**: 50% (Essential expenses)
- **Want**: 30% (Discretionary spending)
- **Other**: 20% (Debt, savings, taxes)

**Use case**: Reference point for healthy financial allocation.

## Test Data Generation

### Generate 12 Months of Data

To populate your dashboard with a full year of realistic test data:

```bash
npm run seed:year
```

This creates:
- **50+ income entries** - Multiple salary, bonus, and freelance income sources
- **600+ transactions** - Realistic monthly expenses with natural variation
- **Full 12-month history** - See patterns and trends across a year

**Data includes:**
- Regular income (Sarah salary: $85k/year, Mike salary: $60k/year)
- Quarterly bonuses
- Freelance/1099 income
- Realistic expenses:
  - Housing (Mortgage, taxes, insurance)
  - Transportation (2 car payments, insurance, gas)
  - Food (Groceries, dining out)
  - Utilities
  - Kids activities
  - Entertainment & shopping
- Monthly savings transfers

## Using the Charts

1. **Navigate to Dashboard** - The main page shows all charts
2. **Select Month/Year** - Use the date picker to view different periods
3. **Hover for Details** - Charts show exact values on hover
4. **Compare Trends** - Switch months to see patterns emerge

## Chart Updates

Charts automatically update when you:
- Switch households
- Create new transactions
- Change the month/year selection
- Add income entries

## Tips

- **Look for patterns**: Are you consistently over-budget on wants?
- **Track improvements**: See if your savings rate improves over time
- **Method awareness**: Are credit card purchases consistently higher?
- **Income timing**: Notice when bonuses and freelance income arrive
- **Seasonal changes**: Some expenses vary by season (utilities, holidays)

## Technical Details

Charts are built with **Recharts**, a React charting library:
- Responsive design - works on desktop and mobile
- Dark mode support - charts adapt to theme
- Interactive tooltips - hover for exact values
- Fast rendering - even with 12 months of data

## Future Enhancements

Potential additions:
- Cumulative net income trend line
- Budget vs actual comparison
- Person-by-person breakdown charts
- Category drill-down capability
- Expense heatmap by day of month
- Year-over-year comparison
