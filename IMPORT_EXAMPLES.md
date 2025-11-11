# Bulk Import CSV Examples

## Example 1: Replicating October's Recurring Expenses for November

**Original October transactions exported from Cashlines:**
```csv
Date,Amount,Description,Method,Account,Notes,Tags
2025-10-03,150.50,Whole Foods,cc,Checking,Weekly groceries,groceries
2025-10-10,150.75,Whole Foods,cc,Checking,Weekly groceries,groceries
2025-10-17,148.20,Whole Foods,cc,Checking,Weekly groceries,groceries
2025-10-24,155.00,Whole Foods,cc,Checking,Weekly groceries,groceries
2025-10-05,75.99,Gym Membership,ach,Checking,Monthly recurring,fitness;recurring
2025-10-01,89.99,Internet Bill,ach,Checking,Monthly recurring,utilities;recurring
```

**Modified for November (just change dates):**
```csv
Date,Amount,Description,Method,Account,Notes,Tags
2025-11-03,150.50,Whole Foods,cc,Checking,Weekly groceries,groceries
2025-11-10,150.75,Whole Foods,cc,Checking,Weekly groceries,groceries
2025-11-17,148.20,Whole Foods,cc,Checking,Weekly groceries,groceries
2025-11-24,155.00,Whole Foods,cc,Checking,Weekly groceries,groceries
2025-11-05,75.99,Gym Membership,ach,Checking,Monthly recurring,fitness;recurring
2025-11-01,89.99,Internet Bill,ach,Checking,Monthly recurring,utilities;recurring
```

**Import result:**
```
✓ 6 valid rows detected
✓ Total amount: $770.43
✓ Click "Import Transactions"
✓ Created: 6, Failed: 0
✓ Page reloads with November transactions
```

---

## Example 2: Mixed Personal & Household Expenses

```csv
Date,Amount,Description,Method,Account,Notes,Tags
2025-11-11,85.50,Costco Membership,cc,Amex,Annual renewal,subscriptions
2025-11-12,45.00,Gas Fill-up,cc,Checking,Regular drive,transportation
2025-11-13,23.47,Coffee Shop,cash,Cash,Morning coffee,food;daily
2025-11-14,156.00,Rent,ach,Checking,Monthly rent,housing;fixed
2025-11-15,92.50,Electric Bill,ach,Checking,Monthly utilities,utilities;fixed
2025-11-16,35.00,Groceries,cc,Checking,Quick shop,groceries
2025-11-17,12.99,Spotify,ach,Checking,Monthly subscription,subscriptions;recurring
```

**Preview in app would show:**
```
┌─────────────┬─────────┬────────────────────┬─────────┬───────────┬──────────┐
│ Status      │ Date    │ Amount             │ Method  │ Account   │ Account  │
├─────────────┼─────────┼────────────────────┼─────────┼───────────┼──────────┤
│ ✓ Valid     │ 2025... │ $85.50             │ cc      │ Amex      │          │
│ ✓ Valid     │ 2025... │ $45.00             │ cc      │ Checking  │          │
│ ✓ Valid     │ 2025... │ $23.47             │ cash    │ Cash      │          │
│ ✓ Valid     │ 2025... │ $156.00            │ ach     │ Checking  │          │
│ ✓ Valid     │ 2025... │ $92.50             │ ach     │ Checking  │          │
│ ✓ Valid     │ 2025... │ $35.00             │ cc      │ Checking  │          │
│ ✓ Valid     │ 2025... │ $12.99             │ ach     │ Checking  │          │
└─────────────┴─────────┴────────────────────┴─────────┴───────────┴──────────┘

✓ Valid Rows: 7
✗ Invalid Rows: 0
💰 Total Amount: $450.46
```

---

## Example 3: Handling Errors (Invalid Data)

```csv
Date,Amount,Description,Method,Account,Notes,Tags
2025-11-11,150.50,Groceries,cc,Checking,Valid row,groceries
2025-13-01,75.00,Gym,ach,Checking,Invalid month,fitness
2025-11-10,abc,Coffee,cc,Checking,Invalid amount,coffee
2025-11-12,50.00,,cc,Checking,Missing description,
2025-11-13,100.00,Gas,cc,UnknownBank,Account doesn't exist,transportation
2025-11-14,200.00,Rent,ach,Checking,Valid row,housing
```

**Preview would show:**
```
┌────────────┬─────────┬─────────┬──────────────────────┐
│ Status     │ Date    │ Amount  │ Errors               │
├────────────┼─────────┼─────────┼──────────────────────┤
│ ✓ Valid    │ 2025... │ $150.50 │ None                 │
│ ⚠ Invalid  │ 2025... │ N/A     │ Invalid date         │
│ ⚠ Invalid  │ 2025... │ N/A     │ Invalid amount       │
│ ⚠ Invalid  │ 2025... │ N/A     │ Missing description  │
│ ⚠ Invalid  │ 2025... │ N/A     │ Account not found    │
│ ✓ Valid    │ 2025... │ $200.00 │ None                 │
└────────────┴─────────┴─────────┴──────────────────────┘

✓ Valid Rows: 2
✗ Invalid Rows: 4
💰 Total Amount: $350.50

Would create 2 transactions, skip 4 invalid rows
```

---

## Example 4: Using Different Payment Methods

```csv
Date,Amount,Description,Method,Account
2025-11-11,150.50,Whole Foods,cc,Amex
2025-11-12,45.00,Gas,cc,Checking
2025-11-13,23.47,Coffee,cash,Cash
2025-11-14,156.00,Bank Transfer,ach,Checking
2025-11-15,75.00,PayPal Transfer,other,Cash
```

**Method values:**
- `cc` = Credit Card
- `cash` = Cash
- `ach` = ACH Bank Transfer
- `other` = Other payment method

---

## Example 5: Optional Fields (Notes & Tags)

```csv
Date,Amount,Description,Method,Account,Notes,Tags
2025-11-11,150.50,Groceries,cc,Checking,Whole Foods weekly run,groceries;recurring
2025-11-12,45.00,Gas,cc,Checking,Shell gas station on Oak St,transportation;gas
2025-11-13,23.47,Coffee,cash,Cash,Morning espresso,food;daily;coffee
2025-11-14,156.00,Rent,ach,Checking,Monthly rent for apartment,housing;fixed;recurring
```

**Notes field:** Free-form text for transaction details  
**Tags field:** Comma or semicolon-separated keywords for categorization

---

## Workflow: Monthly Recurring Expenses

### Step 1: Export Last Month
```bash
# Export from Cashlines (manual or future API):
- Filter: October 2025
- Format: CSV
- Download: october_transactions.csv
```

### Step 2: Modify Dates
```bash
# Edit in spreadsheet (Excel, Google Sheets, etc):
- Select "Date" column
- Find & Replace: "2025-10-" → "2025-11-"
- Save as: november_template.csv
```

### Step 3: Import
```bash
1. Go to: http://localhost:3000/import
2. Upload: november_template.csv
3. Review: Check preview (usually all valid)
4. Click: "Import Transactions"
5. Done: All recurring expenses for November created!
```

---

## Auto-Detection Examples

### The system is smart about column names:

```
Recognized as "Date": Date, date, DATE, transaction_date, Date Paid
Recognized as "Amount": Amount, amount, AMOUNT, cost, price, total
Recognized as "Description": Description, description, DESCRIPTION, notes, what
Recognized as "Method": Method, method, METHOD, payment_method, how_paid
Recognized as "Account": Account, account, ACCOUNT, where_to, destination
```

---

## Tips for Success

### ✓ Do:
- Use YYYY-MM-DD date format (2025-11-11)
- Use consistent account names (match exactly to Cashlines)
- Include method (cc, cash, ach, other)
- Use tags for easy categorization
- Replicate recurring expenses monthly

### ✗ Don't:
- Use currency symbols ($150.50 → 150.50)
- Use account names that don't exist
- Include invalid dates (2025-13-01)
- Leave amount empty
- Mix date formats

---

## Performance

**Import Speed:**
- 100 transactions: < 5 seconds
- 500 transactions: < 20 seconds
- Depends on network and server load

**CSV Size:**
- Up to 1000 rows (100KB) tested
- Larger files supported but may need optimization

---

## Future Enhancements

- [ ] Bank-specific CSV parsers (Chase, Amex, Venmo, etc.)
- [ ] Duplicate detection (warn if importing same transaction)
- [ ] Scheduled/recurring imports
- [ ] XLSX (Excel) file support
- [ ] Multi-sheet handling
- [ ] Column mapping UI (drag & drop)
- [ ] Category auto-assignment on import
