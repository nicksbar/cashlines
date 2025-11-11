# Template System

The template system allows you to quickly create new entries (transactions or income) from frequently-used patterns. Instead of manually entering the same information repeatedly, you can save entries as templates and create new ones with a single click.

## Features

### Quick Creation
- **Save as Template**: Any transaction or income entry can be saved as a template for future reuse
- **Template Selection**: Dropdown menu to select and apply templates
- **Usage Tracking**: Templates track how many times they've been used
- **Favorites**: Star your most-used templates for quick access
- **Template Management**: Edit or delete templates as needed

### How Templates Work

#### For Transactions
Templates store:
- Transaction description
- Amount
- Payment method (cc, cash, ach, other)
- Account
- Associated tags

When you apply a template, these fields are pre-filled, saving you time on repetitive entries.

#### For Income
Templates store:
- Income source name
- Gross amount
- Tax details (federal, state, social security, medicare)
- Deductions (pre/post)

## Using Templates

### Creating a Template

#### From an Existing Entry
1. Navigate to **Transactions** or **Income** page
2. Create or select an entry you want to save as a template
3. Click **"Save as Template"** button
4. Provide a template name (e.g., "Monthly Rent", "Biweekly Salary")
5. Optionally mark as **"Favorite"** for quicker access
6. Click **"Save"**

#### From Scratch
1. Go to **Templates** section (future UI feature)
2. Click **"New Template"**
3. Choose template type (Transaction or Income)
4. Fill in the details
5. Click **"Create Template"**

### Using a Saved Template

#### Quick Create
1. On Transactions or Income page, you'll see **"Quick Create from Template"** section
2. Select a template from the dropdown
3. Click **"Use Template"**
4. The form is pre-filled with template data
5. Adjust any fields as needed
6. Click **"Create"** to finalize

#### Favorites
- Templates marked as ⭐ Favorite appear at the top of the dropdown
- Most-used templates show usage count: "Template Name (12x)"

## Managing Templates

### Editing a Template
1. Go to **Templates** management page (future feature)
2. Find the template you want to edit
3. Click **"Edit"**
4. Modify the fields
5. Click **"Save"**

### Deleting a Template
1. Go to **Templates** management page
2. Find the template
3. Click **"Delete"**
4. Confirm deletion

### Toggling Favorites
- Click the star icon (⭐) next to a template to add/remove from favorites
- Favorited templates appear first in selection dropdowns

## Use Cases

### Recurring Expenses
**Example**: Monthly rent payment
- Save the rent payment amount, account, and method as a template
- Each month, select the template and create the transaction
- Dates are set to current day; adjust as needed

### Regular Income
**Example**: Biweekly salary
- Save your gross, taxes, and deductions as a template
- Creates consistent income entries with pre-calculated values
- Taxes and deductions remain consistent across pay periods

### Bulk Creation
**Example**: Monthly utilities and subscriptions
- Save templates for: rent, electric, internet, subscription services
- At month start, use templates to quickly log all recurring bills
- Saves 5-10 minutes vs. manual entry

### Account Transfers
**Example**: Monthly savings transfer
- Save transfer details (amount, from/to accounts) as template
- Quickly log regular transfers without re-entering details

## API Reference

### List Templates
```bash
GET /api/templates/transactions
GET /api/templates/income
```

Response: Array of template objects

### Create Template
```bash
POST /api/templates/transactions
POST /api/templates/income

Body: { name, description, amount/grossAmount, ... }
```

### Update Template
```bash
PATCH /api/templates/transactions/[id]
PATCH /api/templates/income/[id]

Body: { isFavorite, usageCount, ... }
```

### Delete Template
```bash
DELETE /api/templates/transactions/[id]
DELETE /api/templates/income/[id]
```

## Best Practices

1. **Keep Template Names Clear**: Use descriptive names like "Rent - Landlord LLC" instead of "T1"
2. **Organize by Frequency**: Save daily, weekly, monthly patterns separately
3. **Update Amounts Annually**: Adjust templates when salaries or regular expenses change
4. **Use Favorites Strategically**: Mark only your top 5-10 most-used templates
5. **Review Regularly**: Delete old templates that are no longer relevant

## Future Enhancements

- Template categories for better organization
- Template descriptions with notes
- Bulk operations (create multiple entries from templates at once)
- Template sharing between users
- Auto-apply templates based on rules
- Template preview before applying
