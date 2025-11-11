# Financial Metrics for Dashboard

Strategic metrics that provide deep financial insight, organized by use case.

## 1. **Discretionary vs Committed Spending**

**What it measures**: How much of your spending is locked in (recurring/bills) vs optional

**Formula**:
```
Discretionary Spending = Need + Want spending
Committed Spending = Debt + Tax + (fixed bills)
Discretionary % = (Discretionary / Total) * 100
```

**Why it matters**:
- Shows your financial flexibility
- If discretionary is too low, you're constrained
- Helps identify spending you can actually control
- Reveals true lifestyle inflation

**Implementation**:
- Track which transactions are recurring/tagged as "recurring"
- Calculate percentage for the month
- Compare trend over time

---

## 2. **True Disposable Income** (After Fixed Obligations)

**What it measures**: What actually remains after taxes, debt, and essential needs

**Formula**:
```
True Disposable = Net Income - Taxes - Debt Payments - Need Spending
This is what you can actually spend on wants or save
```

**Why it matters**:
- Most budgets use "discretionary income" which is vague
- True disposable shows realistic spending power
- Highlights whether "wants" are sustainable
- Catches hidden mandatory spending

**Dashboard insight**:
- Compare to actual Want spending
- If true disposable < want spending, you're over-committed

---

## 3. **Spending Velocity** (Recent vs Historical)

**What it measures**: Are you spending faster or slower than your baseline?

**Formula**:
```
3-month Average Spending = Average of last 3 months
Velocity = Current Month vs 3-Month Average
If current > 3-month avg, spending is accelerating
```

**Why it matters**:
- Catches spending creep early
- Shows if seasonal patterns are forming
- Different from month-to-month (more stable)
- Alerts to behavior change

**Example**:
- "Your spending is 12% above your 3-month average"
- "Average spending: $2,100/month, this month: $2,352"

---

## 4. **Income Stability Score**

**What it measures**: Consistency of your income (for variable income earners)

**Formula**:
```
Coefficient of Variation = (Std Dev of last 3 months) / (Average Income) * 100
Lower = more stable (< 10% is stable)
Higher = more variable (> 25% is volatile)
```

**Why it matters**:
- Variable income needs different financial strategy
- Shows if you can plan or need emergency buffer
- Affects how much buffer savings you need
- Validates whether spending is sustainable

**Example**:
- "Income Stability: 8% (STABLE) - Can plan with confidence"
- "Income Stability: 35% (VARIABLE) - Maintain 2-month emergency buffer"

---

## 5. **Debt Service Ratio**

**What it measures**: What percentage of income goes to debt payments

**Formula**:
```
Debt Service Ratio = (Debt Payments) / (Gross Income) * 100
Financial Health: <10% excellent, 10-20% good, 20-35% concerning, >35% overextended
```

**Why it matters**:
- Standard financial health metric
- Shows debt burden
- Helps gauge if debt payoff is on track
- Indicates financial flexibility

---

## 6. **Essential Expenses Ratio**

**What it measures**: What % of income is locked in for essentials (Need + Tax + Debt)

**Formula**:
```
Essential Ratio = (Need + Tax + Debt) / Gross Income * 100
Rule of Thumb: <50% healthy, 50-70% tight, >70% unsustainable
```

**Why it matters**:
- Shows financial slack
- If > 70%, any income disruption is dangerous
- Reveals if you can absorb emergencies
- Critical for retirement planning

---

## 7. **Savings Efficiency** (Quality of Savings)

**What it measures**: Are you saving more than you want, less, or on track?

**Formula**:
```
Actual Savings Rate = (Income - Expenses) / Income * 100
Target Savings Rate = (Set your goal, e.g., 20%)
Savings Efficiency = (Actual / Target) * 100
- 80-120% = on track
- <80% = underperforming
- >120% = over-performing
```

**Why it matters**:
- Not just "are you saving" but "are you meeting YOUR goals"
- Motivates behavior change
- Shows if current allocation is achievable
- Tracks progress toward goals

---

## 8. **Expense Per Transaction** (Average Transaction Value)

**What it measures**: Are your transactions getting bigger or smaller?

**Formula**:
```
Avg Transaction = Total Expenses / Transaction Count
Trend Analysis: Compare 3-month rolling average
```

**Why it matters**:
- $50/transaction vs $150/transaction are different behaviors
- Lower avg = more frequent small purchases (impulse control issue?)
- Higher avg = fewer, larger purchases (planned spending?)
- Helps identify spending pattern changes

---

## 9. **Credit Card Utilization Health**

**What it measures**: Combining SBNL with CC spending patterns

**Formula**:
```
Tracked CC Spending = Transactions marked 'cc'
Actual CC Payment (next month) = From bank account
SBNL = Actual - Tracked
SBNL Efficiency Score = (Tracked / Actual) * 100
- >95% = excellent tracking
- 85-95% = good tracking
- 75-85% = decent tracking  
- <75% = concerning gaps
```

**Why it matters**:
- Combines your SBNL metric with actionability
- Shows if you're getting better at tracking
- Trend shows if discipline is improving
- Alerts when tracking breaks down

---

## 10. **Allocation Adherence** (vs Rules)

**What it measures**: Are you following your routing rules or deviating?

**Formula**:
```
Expected Allocation = Sum from active routing rules
Actual Allocation = Observed split totals
Deviation = (Actual - Expected) / Expected * 100
For each allocation type (need, want, debt, etc.)
```

**Why it matters**:
- Shows if rules are realistic vs actual behavior
- Highlights where spending deviates from plan
- Helps calibrate rules
- Shows discipline

---

## 11. **Month-over-Month Volatility** (Spending Stability)

**What it measures**: How consistent is your spending?

**Formula**:
```
Calculate for each category (need, want, debt, tax, savings)
Volatility = (Max - Min) / Average * 100 (over last 3 months)
- <15% = very stable
- 15-30% = normal variation
- 30-50% = moderate volatility  
- >50% = unstable
```

**Why it matters**:
- Different from velocity (this is stability)
- High volatility in "need" category = concerning
- High volatility in "want" = expected
- Shows if you can predict future spending

---

## 12. **Income-to-Need Ratio** (Financial Runway)

**What it measures**: How many months could you survive on savings if income stopped?

**Formula**:
```
Monthly Need Spending = Average need category spending
Savings Available = Sum of savings account balance
Financial Runway = Savings Available / Monthly Need
- <3 months = insufficient buffer
- 3-6 months = healthy
- 6+ months = very secure
```

**Why it matters**:
- Most actionable emergency fund metric
- Shows true financial security
- Drives savings goals
- Different from "emergency fund" (which is arbitrary)

---

## Implementation Priority

### **Phase 1 (Immediate - 1-2 weeks)**
1. Spending Velocity (3-month comparison)
2. Essential Expenses Ratio
3. Credit Card Utilization Health (enhancement to SBNL)

### **Phase 2 (Short-term - 1 month)**
4. Discretionary vs Committed Spending
5. True Disposable Income
6. Expense Per Transaction trend

### **Phase 3 (Medium-term - 2-3 months)**
7. Income Stability Score
8. Savings Efficiency (if user sets goals)
9. Month-over-Month Volatility

### **Phase 4 (Future)**
10. Debt Service Ratio (when multi-debt tracking added)
11. Allocation Adherence (requires more rules data)
12. Financial Runway (requires savings account integration)

---

## Dashboard Layout Suggestion

**Current Metrics Section** (Top):
- Total Income / Total Expenses / Net Balance / Expense Ratio (keep these)

**Efficiency Metrics** (New):
- Spending Velocity (vs 3-month avg)
- Essential Ratio (% locked in)
- True Disposable Income

**Tracking Quality** (New):
- SBNL & CC Utilization Health
- Expense Per Transaction trend

**Financial Health** (New):
- Income Stability Score
- Savings Efficiency vs Goal

**Trends** (New section):
- Spending Volatility chart
- Category trend lines

---

## Data Requirements

To implement these, you need:

**Already have**:
- Total income/expenses ✓
- Category breakdowns ✓
- Payment method tracking ✓
- SBNL calculation ✓

**Need to add**:
- Recurring transaction tagging (label transactions as "recurring")
- User-set savings goals (optional, for Phase 2)
- Multi-month history queries (need to refactor summary API)
- Savings account balance tracking (for future)

---

## Why These Matter for Your Philosophy

These metrics align with your "tracking beats budgeting" philosophy:

1. **Honest Data**: All based on actual transactions, not predictions
2. **Pattern Recognition**: Help spot trends in real behavior
3. **No Shame**: Focus on understanding, not judgment
4. **Actionable**: Show what changed and why
5. **Personal**: Each metric helps YOU understand YOUR money, not force a standard budget

The key insight: You're not telling people "you should spend less on X." You're showing them "here's what you actually spent and here's how it compares to your recent pattern."
