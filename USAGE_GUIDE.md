# Framework Usage Guide

This guide covers how to use the Playwright-BDD Self-Healing framework effectively.

## 📂 Project Structure

- `features/`: `.feature` files (Gherkin).
- `src/steps/`: `.steps.ts` files (TypeScript).
- `src/pages/`: Page Object Models inheriting from `SelfHealingBasePage`.
- `src/core/api/`: `RestApiClient` for API testing.
- `reports/html-report/`: Generated test reports.

## 🧪 Writing Tests

### 1. Create a Feature File
Add a new file in `features/my_test.feature`:
```gherkin
Feature: User Login
  @smoke
  Scenario: Successful Login
    Given I navigate to the login page
    When I enter valid credentials
    Then I should see the dashboard
```

### 2. Implement Step Definitions
Use `createBdd` from `playwright-bdd` (via our custom fixtures):
```typescript
import { createBdd } from 'playwright-bdd';
import { test } from '../core/support/fixtures';

const { Given, When, Then } = createBdd(test);

Given('I navigate to the login page', async ({ page }) => {
  await page.goto('/login');
});
```

## 🩺 Using Self-Healing

To enable self-healing for an element, use the `clickHealed`, `fillHealed`, etc., methods in your Page Objects:

```typescript
// In your Page Object
async clickLogin() {
  await this.clickHealed('loginButton', '#selector-that-might-break');
}
```
The framework will automatically attempt to repair the locator if the primary selector fails.

## 🎭 Hybrid UI + API Testing

You can share state between API and UI steps using the `TestContext`:

```typescript
// Step 1: Extract from API
const body = await lastResponse.json();
this.setValue('token', body.token);

// Step 2: Use in UI
const token = this.getValue('token');
await page.fill('#token-input', token);
```

## 📊 Running Tests

| Command | Description |
|---------|-------------|
| `npx bddgen` | Generates Playwright spec files from features |
| `npx playwright test` | Runs all tests |
| `npx playwright test --workers=3`| Runs with 3 parallel workers |
| `npx playwright show-report reports/html-report` | Opens the HTML report |

## 🛠️ Configuration

Modify `playwright.config.ts` to adjust:
- **Workers**: Number of parallel browser instances.
- **Headless**: Run with or without a visible browser.
- **BaseURL**: The root URL for your application.
