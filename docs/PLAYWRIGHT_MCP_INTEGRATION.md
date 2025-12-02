# Playwright MCP Integration Example for Cashlines

This file demonstrates practical integration patterns for using Playwright MCP with Claude AI for automated test generation and maintenance.

## 1. Claude Prompt Template for Test Generation

```markdown
You are an expert QA engineer specializing in Playwright end-to-end tests for Next.js financial applications.

## Task
Generate comprehensive E2E tests for the following feature:

### Feature Description
[User describes what they want to test]

### Key Requirements
- Financial data must be formatted as currency ($1,234.56)
- All form inputs have data-test attributes
- Success messages appear in [role="status"]
- Error messages appear in [role="alert"]
- Page loads use networkidle wait condition
- Tests should be independent and reusable

### Current Application URLs
- Dashboard: http://localhost:3000/
- Income: http://localhost:3000/income
- Accounts: http://localhost:3000/accounts
- Transactions: http://localhost:3000/transactions
- Rules: http://localhost:3000/rules
- Recurring: http://localhost:3000/recurring-expenses

### Test Template to Follow
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path')
    await page.waitForLoadState('networkidle')
  })

  test('descriptive test name', async ({ page }) => {
    // Arrange
    
    // Act
    
    // Assert
  })
})
```

### Output Format
Provide a complete, runnable test file with:
1. Clear test descriptions
2. Proper setup/teardown
3. Financial-specific assertions
4. Error handling tests
5. Comments explaining complex logic

Please generate the test file now.
```

## 2. CI/CD Configuration with MCP

```yaml
# .github/workflows/playwright-mcp-tests.yml
name: Playwright E2E Tests with MCP Analysis

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start dev server
        run: npm run dev &
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 30000
      
      - name: Run Playwright tests
        run: npx playwright test --reporter=json
        env:
          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results.json
      
      - name: Analyze results with MCP
        if: always()
        run: |
          # Parse test results
          cat test-results.json
          
          # Generate summary for Claude analysis
          npx playwright show-report --port 8080 &
          
          # Output metrics
          echo "Test execution complete"
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      
      - name: Comment on PR
        if: github.event_name == 'pull_request' && always()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));
            
            const stats = results.stats;
            const comment = `## Test Results
            
- ✅ Passed: ${stats.expected}
- ❌ Failed: ${stats.unexpected}
- ⏭️ Skipped: ${stats.skipped}
- Duration: ${(stats.duration / 1000).toFixed(2)}s

[View detailed report →](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

## 3. Claude-Driven Test Generation Script

```typescript
// scripts/generate-tests-with-claude.ts
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic();

interface TestGenerationRequest {
  feature: string;
  description: string;
  userStories: string[];
  acceptanceCriteria: string[];
}

async function generateTestsWithClaude(
  request: TestGenerationRequest
): Promise<string> {
  const prompt = `You are an expert QA engineer for Cashlines, a Next.js financial application.

Generate comprehensive Playwright E2E tests for this feature:

**Feature**: ${request.feature}
**Description**: ${request.description}

**User Stories**:
${request.userStories.map((s) => `- ${s}`).join("\n")}

**Acceptance Criteria**:
${request.acceptanceCriteria.map((a) => `- ${a}`).join("\n")}

**Requirements**:
1. Use data-test attributes for selectors: [data-test="element-name"]
2. Format currency properly: expect balance to contain "$1,234.56"
3. Use semantic locators: role=button[name="Save"]
4. Test error cases and edge cases
5. Include performance assertions
6. Use proper wait conditions (networkidle, waitFor)
7. Group tests with describe blocks
8. Add beforeEach setup for common operations

**Application Context**:
- Framework: Next.js 14 with TypeScript
- UI Components: Radix UI, Tailwind CSS
- State: Prisma ORM with SQLite/PostgreSQL
- Key routes:
  - / (Dashboard)
  - /income (Add income)
  - /accounts (Account management)
  - /transactions (View transactions)
  - /rules (Routing rules)
  - /recurring-expenses (Recurring expenses)
  - /settings (Settings)

Generate a complete, runnable test file with:
1. Proper imports
2. Test structure with describe blocks
3. Before/after hooks
4. Multiple test scenarios
5. Financial-specific assertions
6. Error handling tests
7. Comments explaining complex logic

Return only the test file code, ready to save as e2e/feature-name.spec.ts`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === "text") {
    return content.text;
  }

  throw new Error("Unexpected response type from Claude");
}

async function main() {
  // Example: Generate tests for Income Entry feature
  const request: TestGenerationRequest = {
    feature: "Income Entry",
    description: "Users can add income entries with multiple types and automatic routing",
    userStories: [
      "As a user, I want to add salary income monthly",
      "As a user, I want to categorize income by type (salary, freelance, bonus)",
      "As a user, I want income to automatically route to accounts based on rules",
      "As a user, I want validation errors for invalid amounts",
    ],
    acceptanceCriteria: [
      "Form accepts positive decimal amounts",
      "Form rejects zero or negative amounts",
      "Income is saved to database",
      "Routing rules apply automatically",
      "Success message appears on save",
      "Form resets after successful submission",
    ],
  };

  console.log("🤖 Generating tests with Claude...");
  console.log(`Feature: ${request.feature}\n`);

  const testCode = await generateTestsWithClaude(request);

  // Save to file
  const outputPath = path.join(process.cwd(), "e2e", "income-entry-generated.spec.ts");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, testCode);

  console.log(`✅ Tests generated successfully!`);
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`\n📋 Test file preview (first 50 lines):`);
  console.log(testCode.split("\n").slice(0, 50).join("\n"));
  console.log("\n...\n");
}

main().catch(console.error);
```

## 4. Test Maintenance with Claude

```typescript
// scripts/update-tests-for-ui-changes.ts
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

interface UIChange {
  filePath: string;
  description: string;
  oldSelectors: string[];
  newSelectors: string[];
}

async function updateTestsForUIChanges(
  testFile: string,
  changes: UIChange[]
): Promise<string> {
  const testContent = fs.readFileSync(testFile, "utf8");
  const changesSummary = changes
    .map(
      (c) => `
File: ${c.filePath}
Change: ${c.description}
Old selectors: ${c.oldSelectors.join(", ")}
New selectors: ${c.newSelectors.join(", ")}`
    )
    .join("\n");

  const prompt = `You are a QA automation expert. 

A developer has made UI changes to the financial application. Please update the following Playwright test file to match the new selectors and structure.

## UI Changes Made:
${changesSummary}

## Current Test File:
\`\`\`typescript
${testContent}
\`\`\`

Please:
1. Update all selectors to use the new structure
2. Maintain test logic and assertions
3. Add comments explaining changes
4. Ensure tests still make sense with new selectors
5. Suggest any additional tests needed

Return only the updated test file code.`;

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === "text") {
    return content.text;
  }

  throw new Error("Unexpected response type from Claude");
}

// Example usage
const changes: UIChange[] = [
  {
    filePath: "src/components/IncomeForm.tsx",
    description: "Refactored form to use new input structure",
    oldSelectors: ["input[name='amount']", "select[name='type']"],
    newSelectors: ["[data-test='income-amount']", "[data-test='income-type']"],
  },
];

const testFile = "e2e/income-entry.spec.ts";
updateTestsForUIChanges(testFile, changes)
  .then((updatedCode) => {
    console.log("✅ Tests updated!");
    fs.writeFileSync(testFile, updatedCode);
  })
  .catch(console.error);
```

## 5. Performance Regression Detection

```typescript
// e2e/performance-baseline.spec.ts
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

interface PerformanceMetrics {
  page: string;
  loadTime: number;
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  timestamp: string;
}

const BASELINE_FILE = path.join("e2e", "performance-baseline.json");
const THRESHOLD = 1.1; // 10% regression threshold

test.describe("Performance Baseline", () => {
  const metrics: PerformanceMetrics[] = [];

  test("Dashboard performance", async ({ page }) => {
    const start = Date.now();

    await page.goto("/", { waitUntil: "networkidle" });

    const loadTime = Date.now() - start;

    const perfData = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as any;
      const paint = performance.getEntriesByType("paint");

      return {
        ttfb: nav.responseStart - nav.requestStart,
        fcp:
          paint.find((p: any) => p.name === "first-contentful-paint")
            ?.startTime || 0,
      };
    });

    const metric: PerformanceMetrics = {
      page: "dashboard",
      loadTime,
      ttfb: perfData.ttfb,
      fcp: perfData.fcp,
      lcp: 0,
      cls: 0,
      timestamp: new Date().toISOString(),
    };

    metrics.push(metric);

    // Check against baseline
    if (fs.existsSync(BASELINE_FILE)) {
      const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8"));
      const baselineDashboard = baseline.find((m: any) => m.page === "dashboard");

      if (baselineDashboard) {
        const loadTimeRegression = loadTime / baselineDashboard.loadTime;

        console.log(`Dashboard load time: ${loadTime}ms (baseline: ${baselineDashboard.loadTime}ms)`);
        console.log(
          `Regression ratio: ${(loadTimeRegression * 100).toFixed(1)}%`
        );

        expect(loadTimeRegression).toBeLessThan(THRESHOLD);
      }
    }
  });

  test.afterAll(() => {
    // Save current metrics as new baseline
    const existing = fs.existsSync(BASELINE_FILE)
      ? JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8"))
      : [];

    const updated = metrics.map((m) => ({
      ...m,
      ...(existing.find((e: any) => e.page === m.page) || {}),
    }));

    fs.writeFileSync(BASELINE_FILE, JSON.stringify(updated, null, 2));
    console.log("✅ Baseline updated");
  });
});
```

## 6. Test Report Generation with Insights

```typescript
// scripts/generate-test-insights.ts
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
}

async function generateTestInsights(results: TestResult[]): Promise<string> {
  const client = new Anthropic();

  const resultsSummary = `
Total Tests: ${results.length}
Passed: ${results.filter((r) => r.status === "passed").length}
Failed: ${results.filter((r) => r.status === "failed").length}
Skipped: ${results.filter((r) => r.status === "skipped").length}

Failed Tests:
${results
  .filter((r) => r.status === "failed")
  .map((r) => `- ${r.name}: ${r.error}`)
  .join("\n")}

Slowest Tests:
${results
  .sort((a, b) => b.duration - a.duration)
  .slice(0, 5)
  .map((r) => `- ${r.name}: ${(r.duration / 1000).toFixed(2)}s`)
  .join("\n")}
`;

  const prompt = `As a QA lead, analyze these test results and provide:

1. Summary of what's working well
2. Areas that need attention
3. Recommendations for improvements
4. Risk assessment for the build

## Test Results:
${resultsSummary}

Provide concise, actionable insights for the team.`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === "text") {
    return content.text;
  }

  throw new Error("Unexpected response type");
}

// Usage
const mockResults: TestResult[] = [
  { name: "Dashboard loads", status: "passed", duration: 1200 },
  { name: "Income entry saves", status: "passed", duration: 800 },
  { name: "Routing applies", status: "failed", duration: 5000, error: "Assertion failed: balance not updated" },
  { name: "Mobile responsive", status: "skipped", duration: 0 },
];

generateTestInsights(mockResults)
  .then((insights) => {
    console.log("🔍 Test Insights:\n");
    console.log(insights);
    fs.writeFileSync("test-insights.md", insights);
  })
  .catch(console.error);
```

## 7. Integration with IDE

```typescript
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Playwright Test",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["playwright", "test", "--debug"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Generate Tests with Claude",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/scripts/generate-tests-with-claude.ts",
      "console": "integratedTerminal",
      "preLaunchTask": "npm: build"
    }
  ]
}
```

## 8. npm Scripts for Cashlines

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report",
    "test:e2e:trace": "playwright show-trace",
    "test:generate": "ts-node scripts/generate-tests-with-claude.ts",
    "test:update": "ts-node scripts/update-tests-for-ui-changes.ts",
    "test:insights": "ts-node scripts/generate-test-insights.ts",
    "test:performance": "playwright test --grep '@performance'",
    "test:critical": "playwright test --grep '@critical'",
    "test:a11y": "playwright test --grep '@a11y'",
    "test:all": "npm run test && npm run test:e2e",
    "test:ci": "playwright test --reporter=github"
  }
}
```

This integration enables:
- ✅ AI-generated tests from requirements
- ✅ Automatic test updates for UI changes
- ✅ Performance regression detection
- ✅ Actionable insights from test results
- ✅ Seamless IDE integration
- ✅ CI/CD automation with reporting

