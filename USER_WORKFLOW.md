# User Workflow Guide: Bulk Import Recurring Expenses

> This guide explains how to replicate recurring expenses from one month to the next using Cashlines.

---

## 🎯 Quick Start (5 minutes)

### Scenario: You have October's recurring expenses and want to import them into November

**Required:**
- ✓ CSV file with transactions (Date, Amount, Description, Method, Account)
- ✓ Account names that match your Cashlines accounts exactly (case-insensitive)
- ✓ Date format: YYYY-MM-DD (e.g., 2025-11-15)

**How:**
1. Click **"Download Template"** button on import page
2. Replace example data with your transactions
3. Click **"Step 1: Upload CSV"**
4. Review the preview
5. Click **"Import Transactions"**
6. ✓ Done!

---

## 📋 Step-by-Step Workflow

### **Step 1: Export Your Previous Month's Transactions**

#### Option A: Using Cashlines Transactions Table
```
1. Go to Transactions page
2. Look at October entries you want to repeat in November
3. Manually note them or screenshot
4. OR copy-paste into spreadsheet
```

#### Option B: Manual Entry (Easy for Recurring)
```
1. Open Excel/Google Sheets/Numbers
2. Create columns: Date, Amount, Description, Method, Account
3. Enter your recurring transactions
```

### **Step 2: Prepare Your CSV File**

#### Template Format:
```csv
Date,Amount,Description,Method,Account
2025-10-05,75.99,Gym Membership,ach,Checking
2025-10-01,89.99,Internet Bill,ach,Checking
2025-10-15,150.50,Groceries,cc,Checking
```

#### Valid Payment Methods:
| Method | Meaning | Example |
|--------|---------|---------|
| `cc` | Credit Card | Amex, Chase, etc. |
| `cash` | Physical Cash | Cash envelope system |
| `ach` | Bank Transfer | ACH, wire transfer |
| `other` | Other | PayPal, Venmo, etc. |

#### Valid Date Format:
```
YYYY-MM-DD
✓ 2025-11-15
✓ 2025-12-01
✗ 11/15/2025 (wrong format)
✗ 2025/11/15 (wrong format)
```

#### Account Names Must Match:
Your Cashlines accounts:
- "Checking"
- "Savings"
- "Amex"
- "Credit Union"

Your CSV must use **exact same names** (case doesn't matter):
```csv
checking  ← OK (matched to "Checking")
CHECKING  ← OK (matched to "Checking")
Checking  ← OK (exact match)
Cheking   ← ERROR (typo)
```

---

### **Step 3: Modify Dates for New Month**

#### Using a Spreadsheet:
```
1. Open your CSV file in Excel/Google Sheets
2. Select the Date column (e.g., column A)
3. Use Find & Replace:
   Find:    "2025-10-"
   Replace: "2025-11-"
4. Save the file
```

#### Using Command Line (Mac/Linux/Windows):
```bash
# Replace Oct dates with Nov dates
sed 's/2025-10-/2025-11-/g' october_expenses.csv > november_expenses.csv
```

#### After Modification:
```csv
Date,Amount,Description,Method,Account
2025-11-05,75.99,Gym Membership,ach,Checking      ← Changed from 10-05
2025-11-01,89.99,Internet Bill,ach,Checking       ← Changed from 10-01
2025-11-15,150.50,Groceries,cc,Checking           ← Changed from 10-15
```

---

### **Step 4: Upload to Cashlines**

1. **Open Import Page**
   ```
   http://localhost:3000/import
   ```

2. **Click "Step 1: Upload CSV"**
   - Select your CSV file
   - File must be `.csv` format

3. **Review Step 2: Preview**
   - Green checkmark (✓) = Valid row
   - Yellow warning (⚠) = Invalid row
   - Check the error message for each invalid row

4. **Fix Any Errors (if needed)**
   - Go back to Excel/Google Sheets
   - Fix the rows with errors
   - Re-upload the corrected file

5. **Click "Step 3: Import Transactions"**
   - System creates all valid transactions
   - You'll see "Created: X, Failed: Y"
   - All done! Refresh page to see new transactions

---

## ✓ Common Validation Rules

### Date Validation
```
✓ 2025-11-15          Valid date
✗ 2025-13-01          Month doesn't exist
✗ 2025-11-31          November only has 30 days
✗ 11/15/2025          Wrong format
✗ [empty]             Required field
```

### Amount Validation
```
✓ 150.50              Valid decimal
✓ 100                 Valid integer
✓ 1500.99             Valid large amount
✗ $150.50             Don't include currency symbol
✗ 150,50              Use period not comma
✗ [empty]             Required field
```

### Description Validation
```
✓ Whole Foods         Any text is OK
✓ Rent Payment        Text with spaces OK
✓ Gym #15 Downtown    Numbers and symbols OK
✗ [empty]             Required field
```

### Account Validation
```
✓ Checking            Exact match to your accounts
✓ checking            Case-insensitive OK
✓ Amex                Exact match
✗ Cheking             Typo - account doesn't exist
✗ [empty]             Required field if "Account" column present
```

### Method Validation
```
✓ cc                  Credit Card
✓ cash                Cash
✓ ach                 Bank Transfer
✓ other               Other payment
✗ credit              Use "cc" instead
✗ [empty]             Defaults to "other"
```

---

## 🔍 Preview Tab Understanding

### Example Preview:

```
Valid Rows: 5
Invalid Rows: 2
Total Amount: $850.25

┌────────┬───────────┬────────┬──────────────┐
│ Status │ Date      │ Amount │ Description  │
├────────┼───────────┼────────┼──────────────┤
│ ✓      │ 2025-11-01│ $89.99 │ Internet     │
│ ✓      │ 2025-11-05│ $75.99 │ Gym          │
│ ✓      │ 2025-11-15│$150.50 │ Groceries    │
│ ⚠      │ 2025-13-01│  -     │ [Invalid]    │
│ ⚠      │ 2025-11-10│  -     │ [Invalid]    │
│ ✓      │ 2025-11-20│ $45.00 │ Gas          │
│ ✓      │ 2025-11-25│$293.77 │ Rent         │
└────────┴───────────┴────────┴──────────────┘
```

**What it means:**
- **Valid Rows (5):** These will be imported
- **Invalid Rows (2):** These will be skipped
- **Total Amount:** Sum of valid rows only
- **Status Indicator:**
  - ✓ = Will import
  - ⚠ = Will skip, shows reason

---

## ⚠️ Common Errors & Solutions

### Error: "Account not found"
```
Problem:  CSV says "checkings" but your account is "Checking"
Solution: Fix the typo in your CSV file
Fix:      Change "checkings" → "Checking"
```

### Error: "Invalid date"
```
Problem:  Date format is "11/15/2025" instead of "2025-11-15"
Solution: Reformat to YYYY-MM-DD
Fix:      Change "11/15/2025" → "2025-11-15"
```

### Error: "Invalid amount"
```
Problem:  Amount shows "$150.50" instead of "150.50"
Solution: Remove currency symbol
Fix:      Change "$150.50" → "150.50"
```

### Error: "Missing description"
```
Problem:  Description column is empty
Solution: Add a description for the transaction
Fix:      Add text like "Rent" or "Groceries"
```

### Error: "Missing amount"
```
Problem:  Amount field is blank
Solution: Enter a valid number
Fix:      Add amount like "150.50"
```

---

## 💡 Pro Tips

### ✓ For Monthly Recurring Expenses:

1. **Create a Template**
   - Save your monthly recurring expenses CSV
   - Each month, just change the dates
   - Much faster than re-entering

2. **Use Tags**
   ```csv
   Date,Amount,Description,Method,Account,Tags
   2025-11-01,89.99,Internet,ach,Checking,utilities;recurring
   2025-11-05,75.99,Gym,ach,Checking,fitness;recurring
   ```

3. **Use Notes**
   ```csv
   Date,Amount,Description,Method,Account,Notes
   2025-11-15,150.50,Groceries,cc,Checking,Whole Foods weekly
   ```

4. **Batch Similar Transactions**
   - All grocery store visits together
   - All utility payments together
   - Makes it easier to spot patterns

### ✓ For Irregular Expenses:

1. **Keep Old CSVs**
   - Save each month's import file
   - Reference for future similar expenses
   - Track patterns over time

2. **Make Notes**
   - Add context in "Notes" column
   - "Rent for Nov (due 1st)"
   - Helps when reviewing later

3. **Use Amounts Smartly**
   - Round to nearest dollar if exact amount varies
   - Or use average amount
   - Helps match budget targets

---

## 🚀 Workflow Shortcuts

### Quick Recurring Expenses (Same Every Month)

```
Month 1:  Enter transactions normally
          (or import from bank export)
          
Month 2:  1. Export Month 1 CSV from Cashlines
          2. Change dates for Month 2
          3. Import to Cashlines
          
Month 3:  Repeat step 1-3
          Takes ~5 minutes total!
```

### Bulk Transaction Clean-up

```
Scenario: You have a spreadsheet with 50 transactions

Option A: Copy to CSV → Import at once (2 min)
Option B: Manual entry in Cashlines (30+ min)

Always use Option A! CSV import saves hours.
```

### Bank Statement Import

```
1. Download CSV from your bank
2. Manually map columns to Cashlines format
3. Upload to import page
4. Done!
```

---

## 📊 What Happens After Import

### Immediate:
- ✓ Transactions appear in Transactions table
- ✓ Dashboard updates with new totals
- ✓ Month-to-month comparisons update

### Dashboard Shows:
- YTD Income & Expenses
- Month-to-month changes
- Financial ratios
- Payment method breakdown
- Money allocation summary

### You Can Now:
- Edit any imported transaction
- Delete mistakes
- Add notes/tags after import
- Export for external tracking

---

## 🔐 Privacy & Safety

- All files processed locally (no cloud upload)
- CSV not stored after import
- No tracking of imported data
- Only stored in your local database
- Can delete transactions anytime

---

## ❓ FAQ

### Q: Can I import into multiple accounts?
**A:** Yes! Your CSV can have different accounts in the "Account" column. All will be imported to their respective accounts.

### Q: What if I upload wrong data?
**A:** Just delete the wrong transactions and re-import the correct file. Takes 30 seconds.

### Q: Can I import the same month twice?
**A:** Yes, but you'll create duplicates. System doesn't prevent this - be careful!

### Q: How often can I import?
**A:** Unlimited! Import daily if you want.

### Q: Can I import without an account name?
**A:** If "Account" column is missing, imports will fail. Always include account names.

### Q: What's the file size limit?
**A:** Up to 1000 rows tested. Larger files should work too.

### Q: Can I import from Excel?
**A:** Yes! Save Excel file as `.csv` (Comma-Separated Values) first.

### Q: Does order matter?
**A:** No! Rows can be in any order. System sorts by date in the app.

### Q: Can I undo an import?
**A:** Not automatically. You'd need to delete each transaction manually. Be careful!

---

## 📞 Need Help?

- Check the **Preview** tab - it shows exactly what will import
- Look at **Tips** card on import page
- Download **Template** for correct format
- Review **Error Messages** - they're specific to fix issues

---

## 🎓 Learning Resources

- See **IMPORT_EXAMPLES.md** for real-world examples
- Check **IMPORT_IMPLEMENTATION.md** for technical details
- Review test cases in **src/app/import/__tests__/import.test.ts**

---

## Next Steps

1. **Try it now:** Go to http://localhost:3000/import
2. **Download the template:** Click "Download Template"
3. **Add your transactions:** Open template in Excel/Sheets
4. **Upload:** Drag & drop or click to upload
5. **Review:** Check the preview
6. **Import:** Click import button
7. **Celebrate:** Your transactions are imported! 🎉

---

**Happy importing!**

This feature is designed to save you hours each month on recurring expense entry. Enjoy!
