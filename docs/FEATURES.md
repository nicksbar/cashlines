# Features & Usage Guide

Complete guide to using each feature in Cashlines.

## Dashboard

The dashboard provides a monthly overview of your financial activity:

- **YTD Summary**: Year-to-date totals for income and expenses
- **Key Ratios**: Financial metrics and percentages
- **Monthly Breakdown**: Income by source, spending by method, routing allocation
- **Allocation Chart**: Visual breakdown of money split across categories

### What You'll See

- Total income (gross)
- Total expenses (by payment method)
- Money routing breakdown (Need/Want/Debt/Tax/Savings)
- Average transaction/income amounts
- Tax and deduction totals

## Accounts

Manage all accounts where money flows in and out.

### Account Types

- **Checking**: Primary transaction account
- **Savings**: Savings account
- **Credit Card**: Credit card accounts
- **Cash**: Physical cash on hand
- **Other**: Custom account types

### Managing Accounts

1. **Create**: Click "New Account", enter name and type
2. **View**: See list of all active accounts
3. **Edit**: Click edit icon to modify account details
4. **Delete**: Remove account (if no transactions/income)

### Account Status

- **Active**: Accounts marked as active appear in dropdowns
- **Inactive**: Hide old accounts without deleting
- **Notes**: Add custom notes to track account details

## Income

Record all income sources with automatic tax and deduction calculations.

### Recording Income

1. Go to **Income** page
2. Click **"New Income"**
3. Enter details:
   - **Source**: Where the money came from (e.g., "Salary", "Freelance")
   - **Gross Amount**: Total amount before taxes/deductions
   - **Taxes**: Federal, state, payroll taxes
   - **Deductions**: Pre-tax and post-tax deductions
   - **Date**: When the income was received
   - **Account**: Which account received the money
   - **Notes**: Optional notes

4. System automatically calculates net amount
5. Routing rules automatically apply if defined

### Income Routing

If routing rules are defined for the income source, money is automatically split:
- Example: Salary → 60% Need, 20% Want, 20% Savings

### Templates

- **Save as Template**: Click "💾 Save as Template" to save common income patterns
- **Use Templates**: Next time, select from saved templates to pre-fill form

## Transactions

Track all expenses and transfers with flexible split allocation.

### Recording Transactions

1. Go to **Transactions** page
2. Click **"New Transaction"**
3. Enter details:
   - **Description**: What was purchased (e.g., "Grocery Store", "Gas")
   - **Amount**: How much was spent
   - **Date**: When the transaction occurred
   - **Method**: Payment method (Credit Card, Cash, ACH, Other)
   - **Account**: Which account was charged
   - **Notes**: Optional notes
   - **Tags**: Comma-separated tags for organization

4. Define allocation (see Splits section)
5. Save transaction

### Splits (Money Allocation)

Define how the transaction amount is split across categories:

- **Type**: Need, Want, Debt, Tax, or Savings
- **Target**: Specific target within category (e.g., "Housing", "Entertainment")
- **Percent**: Percentage of amount allocated

Example: $100 at grocery store
- 100% Need → Groceries

Example: $500 salary
- 60% Need → Housing
- 20% Want → Entertainment
- 20% Savings → Emergency Fund

### Transaction Editing

- **Edit**: Click edit icon to modify transaction
- **Delete**: Click delete icon to remove transaction
- **Export**: Download all transactions as CSV

### Templates

- **Save as Template**: Click "💾 Save as Template" to save frequent transactions
- **Use Templates**: Quickly create similar transactions from templates
- **Manage**: Go to Templates page to organize and view all saved templates

## Routes (Money Routing Visualization)

Visualize where your money actually goes across different allocations.

### What You'll See

- **Pie Charts**: Visual breakdown by category
- **Tables**: Detailed numbers for each allocation
- **Trending**: Month-by-month trends
- **Totals**: Year-to-date allocations

### Categories

- **Need** (Essential spending): Groceries, utilities, rent, insurance, transportation
- **Want** (Discretionary): Entertainment, dining, hobbies, subscriptions
- **Debt** (Debt payments): Loan payments, credit card payments
- **Tax** (Tax allocations): Tax set-asides, payments
- **Savings** (Savings goals): Emergency fund, investment, goals

### Using Routes Page

1. View current month's allocation
2. Switch months to see trends
3. Identify spending patterns
4. Use insights to adjust routing rules

## Rules (Automatic Money Routing)

Create rules to automatically split transactions and income based on matching criteria.

### Understanding Rules

A rule consists of:

1. **Match Criteria**: When to apply the rule
   - Income source match (regex pattern)
   - Transaction description match (regex pattern)
   - Specific account
   - Payment method

2. **Split Configuration**: How to split the money
   - Type: Need/Want/Debt/Tax/Savings
   - Target: Specific target within category
   - Percent: Percentage to allocate

### Creating a Rule

1. Go to **Rules** page
2. Click **"New Rule"**
3. Set up matching:
   - Rule name (e.g., "Salary", "Groceries")
   - Match criteria (optional - leave blank to match all)
4. Define splits:
   - Click "+ Add Split" for each allocation
   - Choose type and target
   - Enter percentage (must total 100%)
5. Save rule

### Example Rules

**Salary Rule:**
- Matches income source containing "Salary"
- Splits: 60% Need/Housing, 20% Want/Entertainment, 20% Savings/Emergency
- Result: Every salary automatically splits this way

**Grocery Rule:**
- Matches description containing "Grocery" or "Kroger"
- Splits: 100% Need/Groceries
- Result: All grocery purchases automatically categorized

**Utilities Rule:**
- Matches description containing "Electric" or "Water"
- Splits: 100% Need/Utilities
- Result: All utility bills automatically categorized

### Tips for Rules

- Use regex patterns for flexible matching
- More specific rules take priority
- Rules are checked in order they appear
- Rules make reporting and analysis easier
- Test rules to ensure they work as expected

## Templates

Save and reuse common entry patterns for quick creation.

### Creating Templates

#### From Existing Entry

1. Create a transaction or income entry
2. Fill in all details
3. Click **"💾 Save as Template"**
4. Enter template name (e.g., "Monthly Rent", "Biweekly Salary")
5. Save

#### Template Management

1. Go to **Templates** page
2. View all saved templates
3. **Filter by type**: All, Transactions, or Income
4. **Sort by**: Most Used, Favorites First, Most Recent
5. **Actions**:
   - Click star icon to mark as favorite
   - Click trash icon to delete

### Using Templates

1. Go to **Templates** page
2. Select template from list
3. Form pre-fills with template data
4. Adjust any fields as needed
5. Create entry

**Coming soon**: Quick select dropdown on transaction/income forms

### Template Features

- **Usage Tracking**: See how many times each template is used
- **Favorite Status**: Mark frequently used templates with star
- **Sorting**: Sort by usage frequency or recency
- **Organization**: Filter by transaction or income types

### Best Practices

- Keep template names descriptive (e.g., "Rent - Landlord LLC" not "T1")
- Save templates for recurring expenses
- Update amounts annually
- Use favorites for your top 5-10 templates
- Delete old templates no longer relevant

## Import

Import financial data from CSV or other sources.

### Import Format

Transactions CSV should include:
- Date (YYYY-MM-DD)
- Description
- Amount
- Method (cc, cash, ach, other)
- Account name
- Tags (optional)

Income CSV should include:
- Date (YYYY-MM-DD)
- Source
- Gross Amount
- Taxes
- Pre-tax Deductions
- Post-tax Deductions
- Account name

### Import Process

1. Go to **Import** page
2. Prepare CSV file with correct format
3. Select file and type (Transactions or Income)
4. Review preview
5. Click "Import" to load data

### Tips

- Use account names that match existing accounts
- Dates must be YYYY-MM-DD format
- Amounts should be numbers only (no $ symbol)
- Method should be: cc, cash, ach, or other
- Review data before importing to catch errors

## Theme System

Switch between light, dark, and auto themes.

### Changing Theme

1. Click theme toggle in top-right corner (sun/moon icons)
2. Choose: Light, Dark, or Auto
3. Theme preference is saved automatically

### Auto Theme

- Respects your operating system's dark mode preference
- Switches automatically when OS setting changes
- Recommended for most users

### Light Theme

- High contrast white background
- Black text
- Best for bright environments

### Dark Theme

- Dark blue/slate backgrounds
- Light text
- Reduces eye strain in low light
- Used throughout entire application

## Help System

Get contextual help while using the application.

### Finding Help

- Look for **ℹ️** icons next to form fields
- Read **Help** cards at top of pages
- Check **Rules** and **Routes** pages for detailed explanations
- Review **Templates** page tips section

### Help Topics

- **How to use routing rules**: Rules page
- **Money routing explanation**: Routes page
- **Template creation**: Templates page
- **Account setup**: Accounts page

## Keyboard Shortcuts

- **Ctrl/Cmd + K**: Search (when implemented)
- **Esc**: Close modals and dialogs
- **Tab**: Navigate form fields
- **Enter**: Submit forms

## Tips & Best Practices

### Organization

1. Create clear account names
2. Use consistent transaction descriptions
3. Tag transactions for better filtering
4. Create rules for recurring transactions
5. Save templates for common entries

### Accuracy

1. Record transactions immediately
2. Verify amounts match bank statements
3. Reconcile accounts monthly
4. Review routing rules quarterly
5. Update templates annually

### Analysis

1. Review Dashboard monthly
2. Check Routes page for spending patterns
3. Use Rules to ensure consistent categorization
4. Compare month-to-month trends
5. Export data for external analysis

---

For detailed technical information, see [Architecture](./ARCHITECTURE.md) and [API Reference](./API.md).
