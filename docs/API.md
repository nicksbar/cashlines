# API Reference

Complete documentation of all Cashlines API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently single-user (hardcoded user_1). Multi-user authentication coming soon.

## Common Response Format

### Success Response (200-201)

```json
{
  "id": "...",
  "field1": "value1",
  "field2": "value2"
}
```

### Error Response (4xx-5xx)

```json
{
  "error": "Error message describing what went wrong"
}
```

## Accounts

### List All Accounts

```
GET /api/accounts
```

**Response:**
```json
[
  {
    "id": "...",
    "userId": "user_1",
    "name": "Checking",
    "type": "checking",
    "isActive": true,
    "notes": "Primary account"
  }
]
```

### Get Account by ID

```
GET /api/accounts/[id]
```

### Create Account

```
POST /api/accounts
Content-Type: application/json

{
  "name": "Checking",
  "type": "checking",
  "notes": "Primary account"
}
```

**Account Types:** checking, savings, credit_card, cash, other

### Update Account

```
PATCH /api/accounts/[id]
Content-Type: application/json

{
  "name": "Checking",
  "isActive": true,
  "notes": "Updated notes"
}
```

### Delete Account

```
DELETE /api/accounts/[id]
```

## Income

### List Income Entries

```
GET /api/income?month=11&year=2025
```

**Query Parameters:**
- `month` (optional): 1-12
- `year` (optional): 2024+

**Response:**
```json
[
  {
    "id": "...",
    "date": "2025-11-15T00:00:00Z",
    "source": "Salary",
    "grossAmount": 5000,
    "federalTaxes": 750,
    "stateTaxes": 250,
    "socialSecurity": 310,
    "medicare": 72.50,
    "preDeductions": 200,
    "postDeductions": 100,
    "netAmount": 3317.50,
    "accountId": "...",
    "account": {
      "id": "...",
      "name": "Checking"
    },
    "notes": "Biweekly pay",
    "tags": ["salary"]
  }
]
```

### Create Income Entry

```
POST /api/income
Content-Type: application/json

{
  "source": "Salary",
  "amount": 5000,
  "date": "2025-11-15",
  "accountId": "...",
  "federalTaxes": 750,
  "stateTaxes": 250,
  "socialSecurity": 310,
  "medicare": 72.50,
  "preDeductions": 200,
  "postDeductions": 100,
  "notes": "Biweekly pay",
  "tags": ["salary"]
}
```

### Update Income Entry

```
PATCH /api/income/[id]
Content-Type: application/json

{
  "source": "Salary",
  "amount": 5000,
  ...
}
```

### Delete Income Entry

```
DELETE /api/income/[id]
```

## Transactions

### List Transactions

```
GET /api/transactions?month=11&year=2025
```

**Query Parameters:**
- `month` (optional): 1-12
- `year` (optional): 2024+

**Response:**
```json
[
  {
    "id": "...",
    "date": "2025-11-20T00:00:00Z",
    "description": "Grocery Store",
    "amount": 125.50,
    "method": "cc",
    "accountId": "...",
    "account": {
      "id": "...",
      "name": "Chase Credit Card"
    },
    "notes": "Weekly groceries",
    "tags": ["groceries", "food"],
    "splits": [
      {
        "id": "...",
        "type": "need",
        "target": "Groceries",
        "percent": 100
      }
    ]
  }
]
```

### Create Transaction

```
POST /api/transactions
Content-Type: application/json

{
  "description": "Grocery Store",
  "amount": 125.50,
  "date": "2025-11-20",
  "method": "cc",
  "accountId": "...",
  "notes": "Weekly groceries",
  "tags": ["groceries", "food"],
  "splits": [
    {
      "type": "need",
      "target": "Groceries",
      "percent": 100
    }
  ]
}
```

**Fields:**
- `description` (string, required): Transaction description
- `amount` (number, required): Amount in dollars
- `date` (string, required): ISO date (YYYY-MM-DD)
- `method` (string): cc, cash, ach, other
- `accountId` (string, required): Which account
- `notes` (string): Optional notes
- `tags` (array): String array of tags
- `splits` (array): Money allocation

**Split Types:** need, want, debt, tax, savings

### Update Transaction

```
PATCH /api/transactions/[id]
Content-Type: application/json

{
  "description": "Grocery Store",
  "amount": 125.50,
  ...
}
```

### Delete Transaction

```
DELETE /api/transactions/[id]
```

## Rules

### List Rules

```
GET /api/rules
```

**Response:**
```json
[
  {
    "id": "...",
    "userId": "user_1",
    "name": "Salary",
    "matchSource": "Salary",
    "matchDescription": null,
    "matchAccountId": null,
    "matchMethod": null,
    "matchTags": null,
    "splitConfig": "[{\"type\":\"need\",\"target\":\"Housing\",\"percent\":60},{\"type\":\"want\",\"target\":\"Entertainment\",\"percent\":20},{\"type\":\"savings\",\"target\":\"Emergency\",\"percent\":20}]",
    "isActive": true,
    "notes": "Automatic salary routing"
  }
]
```

### Create Rule

```
POST /api/rules
Content-Type: application/json

{
  "name": "Salary",
  "matchSource": "Salary",
  "splitConfig": [
    {
      "type": "need",
      "target": "Housing",
      "percent": 60
    },
    {
      "type": "want",
      "target": "Entertainment",
      "percent": 20
    },
    {
      "type": "savings",
      "target": "Emergency",
      "percent": 20
    }
  ],
  "notes": "Automatic salary routing"
}
```

**Match Fields (all optional, use regex):**
- `matchSource`: Income source pattern
- `matchDescription`: Transaction description pattern
- `matchAccountId`: Specific account ID
- `matchMethod`: cc, cash, ach, other
- `matchTags`: JSON array of tag patterns

### Update Rule

```
PATCH /api/rules/[id]
Content-Type: application/json

{
  "name": "Salary",
  "isActive": true,
  ...
}
```

### Delete Rule

```
DELETE /api/rules/[id]
```

## Reports

### Monthly Summary

```
GET /api/reports/summary?month=11&year=2025
```

**Query Parameters:**
- `month` (required): 1-12
- `year` (required): 2024+

**Response:**
```json
{
  "month": 11,
  "year": 2025,
  "income": {
    "totalGross": 5000,
    "totalTaxes": 1382.50,
    "totalDeductions": 300,
    "totalNet": 3317.50,
    "sources": [
      {
        "source": "Salary",
        "amount": 5000
      }
    ]
  },
  "expenses": {
    "total": 2500,
    "byMethod": {
      "cc": 2000,
      "cash": 500
    }
  },
  "routing": {
    "need": 1500,
    "want": 600,
    "debt": 200,
    "tax": 150,
    "savings": 50
  }
}
```

## Templates

### List Transaction Templates

```
GET /api/templates/transactions
```

**Response:**
```json
[
  {
    "id": "...",
    "type": "transaction",
    "userId": "user_1",
    "name": "Monthly Rent",
    "description": "Rent payment to landlord",
    "amount": 2000,
    "method": "cc",
    "accountId": "...",
    "isFavorite": true,
    "usageCount": 12,
    "lastUsedAt": "2025-11-01T00:00:00Z"
  }
]
```

### Create Transaction Template

```
POST /api/templates/transactions
Content-Type: application/json

{
  "name": "Monthly Rent",
  "description": "Rent payment to landlord",
  "amount": 2000,
  "method": "cc",
  "accountId": "...",
  "tags": ["rent", "housing"],
  "notes": "Due on 1st of month",
  "isFavorite": true
}
```

### Update Template

```
PATCH /api/templates/transactions/[id]
Content-Type: application/json

{
  "isFavorite": true,
  "usageCount": 1
}
```

### Delete Template

```
DELETE /api/templates/transactions/[id]
```

### Income Templates

Same endpoints as transaction templates but at:
- `GET /api/templates/income`
- `POST /api/templates/income`
- `PATCH /api/templates/income/[id]`
- `DELETE /api/templates/income/[id]`

**Income Template Fields:**
- `grossAmount`: Gross income
- `federalTaxes`: Federal tax amount
- `stateTaxes`: State tax amount
- `socialSecurity`: Social security tax
- `medicare`: Medicare tax
- `preDeductions`: Pre-tax deductions
- `postDeductions`: Post-tax deductions

## Export

### Export Transactions

```
GET /api/export?type=transactions
```

Returns CSV file with all transactions.

### Export Income

```
GET /api/export?type=income
```

Returns CSV file with all income entries.

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Unexpected error |

## Rate Limiting

Currently no rate limiting. Production deployments should add rate limiting.

## Pagination

Currently no pagination. Large result sets return all records. Consider pagination for production.

## Examples

### Create Income with Routing Rule

```bash
curl -X POST http://localhost:3000/api/income \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Salary",
    "amount": 5000,
    "date": "2025-11-15",
    "accountId": "account123",
    "federalTaxes": 750,
    "stateTaxes": 250,
    "socialSecurity": 310,
    "medicare": 72.50,
    "preDeductions": 200,
    "postDeductions": 100,
    "tags": ["salary"]
  }'
```

### Create Transaction with Splits

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Grocery Store",
    "amount": 125.50,
    "date": "2025-11-20",
    "method": "cc",
    "accountId": "account123",
    "tags": ["groceries"],
    "splits": [
      {
        "type": "need",
        "target": "Groceries",
        "percent": 100
      }
    ]
  }'
```

### Create Routing Rule

```bash
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salary",
    "matchSource": "Salary",
    "splitConfig": [
      {
        "type": "need",
        "target": "Housing",
        "percent": 60
      },
      {
        "type": "want",
        "target": "Entertainment",
        "percent": 20
      },
      {
        "type": "savings",
        "target": "Emergency",
        "percent": 20
      }
    ]
  }'
```

---

For more information, see [Features & Usage](./FEATURES.md) or [Architecture](./ARCHITECTURE.md).
