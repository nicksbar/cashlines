# Export & Bulk Create Workflow

## Overview

Cashlines supports exporting transaction and income data for backup, analysis, or creating recurring entries from previous periods.

## Exporting Data

### From Transactions Page
1. Click the **Export** button in the top-right
2. A CSV file downloads: `transactions-YYYY-MM-DD.csv`
3. File contains all transactions with columns:
   - Type, Date, Description, Amount, Method, Account, Tags, Splits

### From Income Page
1. Click the **Export** button in the top-right
2. A CSV file downloads: `income-YYYY-MM-DD.csv`
3. File contains all income entries with columns:
   - Type, Date, Source, Amount, Account, Tags, Notes

## Using Exported Data

### Replicating Recurring Expenses

**Workflow:**
1. Export transactions for previous month
2. Open the CSV in a spreadsheet application (Excel, Google Sheets, etc.)
3. Modify dates to the current period
4. Optionally modify amounts or descriptions as needed
5. Save the file
6. Go to the Import page
7. Upload the modified CSV
8. Review the preview
9. Click "Import Transactions"

**Example:**
- Export October transactions
- Change all dates from 10/xx to 11/xx
- Keep descriptions and amounts same (for recurring expenses)
- Import as November entries

### Data Backup

- Export both transactions and income regularly
- Store in version control, cloud storage, or external backup
- Useful for compliance, audits, or data recovery

### External Analysis

- Export data for analysis in external tools
- Use in spreadsheets for custom reports
- Import into accounting software
- Share with tax preparer or accountant

## CSV Format

### Transactions CSV
```
Type,Date,Description,Amount,Method,Account,Tags,Splits
Transaction,2025-11-11T00:00:00.000Z,Coffee,5.50,cash,Cash,"[""food"",""recurring""]","need:Daily Expenses:5.50"
Transaction,2025-11-10T00:00:00.000Z,Groceries,65.23,cc,Amex,"[""groceries""]","need:Groceries:65.23"
```

### Income CSV
```
Type,Date,Source,Amount,Account,Tags,Notes
Income,2025-11-11T00:00:00.000Z,Salary,5000.00,Checking,"[""recurring"",""W2""]","Monthly salary"
```

## Tips

- **Keep original exports** - Save untouched copies before modifying
- **Batch imports** - Exporting/importing is perfect for handling multiple entries
- **Month-to-month** - Common workflow: export last month, update dates, re-import
- **Recurring transactions** - Great for subscriptions, bills, regular transfers
- **Data validation** - Always review the import preview before confirming

## Integration with Routing Rules

When you re-import exported transactions:
1. Matching routing rules will apply automatically
2. Transactions get categorized based on descriptions
3. Money flows to the correct allocation targets
4. Dashboard shows updated financial picture

This makes it easy to maintain consistent expense tracking month-to-month!
