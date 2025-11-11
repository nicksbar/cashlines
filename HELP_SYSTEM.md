# Help System Documentation

## Overview

A comprehensive help system has been added to Cashlines to help users understand and leverage routing rules effectively.

## Components

### InfoTooltip Component
**Location:** `src/components/InfoTooltip.tsx`

A reusable tooltip component that provides contextual help throughout the app.

**Features:**
- Clickable help icon that opens/closes tooltip
- Displays title, description, and examples
- Automatically closes when clicking outside
- Full dark mode support
- Accessible with proper ARIA labels

**Usage:**
```tsx
<InfoTooltip
  title="Field Name"
  description="Clear explanation of what this field does"
  examples={['Example 1', 'Example 2', 'Example 3']}
/>
```

## Rules Page Enhancements

### Help Section
- **Location:** Top of rules page, after header
- **Content:** 
  - "What are routing rules?" explanation
  - "Why use them?" with benefits list
  - Real-world example of creating and using a rule

### Form Field Tooltips
Each field in the rule creation form has an inline tooltip:

1. **Rule Name** - How to name rules effectively
2. **Match Income Source** - Examples of regex patterns for matching sources
3. **Match Description** - Examples of matching transaction descriptions
4. **Payment Method** - When and how to filter by payment method
5. **Default Split Allocation** - How to define and use split percentages
6. **Notes** - Optional documentation for rules

### Visual Improvements
- Help card with blue border and light blue background
- Dark mode support with proper contrast
- Alert icon for visual prominence
- Clear typography hierarchy

## Routes Page Enhancements

### Help Section
- **Location:** Top of routes page, after header
- **Content:**
  - "What is this?" explanation
  - Category definitions (Need, Want, Debt, Tax, Savings)
  - Step-by-step guide for using the page

### Dark Mode Support
- All text properly styled for dark mode
- Better contrast for tables and cards
- Smooth hover transitions
- Proper border colors for both themes

## Design Patterns

### Help Card Style
```
- Border left: 4px colored accent (blue for rules, green for routes)
- Background: Light tinted to match border color
- Dark mode: Dark tinted background
- Typography: Semibold titles, regular body, smaller monospace examples
```

### Tooltip Style
```
- 64 width max for readability
- Absolute positioned near trigger
- Shadow for depth
- Dark mode support
- Click-to-close interaction
```

## User Workflow

### For New Users
1. Visit Rules page
2. Read help section to understand routing rules
3. Click "New Rule" button
4. Hover/click info icons for field guidance
5. Create a rule with examples

### For Experienced Users
1. Quick reference via tooltips
2. Create rules efficiently with remembered patterns
3. Review money allocation on Routes page

## Future Enhancements

Possible additions:
- Video tutorials or animated guides
- In-app onboarding flow
- FAQ section
- Rule templates for common scenarios
- Help search functionality
- Glossary of terms

## Accessibility

- All tooltips have proper ARIA labels
- Help icons are keyboard accessible
- Color not the only indicator of information
- High contrast ratios for dark/light modes
- Clear, simple language in all help text
