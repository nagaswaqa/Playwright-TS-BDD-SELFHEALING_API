---
name: self-healing-playwright
description: A reusable self-healing locator framework for Playwright + TypeScript that automatically repairs broken selectors using DOM, Visual, and OCR strategies.
---

# Self-Healing Playwright Skill

This skill allows you to use the custom self-healing framework in this project. The framework wraps Playwright's native `Page` actions with a `SelfHealingPage` that automatically triggers a multi-stage healing pipeline when a locator fails.

## Capabilities

- **Automatic Repair**: Intercepts `click` and `fill` failures and attempts to find the element using alternative strategies.
- **Multi-Stage Pipeline**: Falls back through **DOM Analysis → Visual Template Matching → OCR Analysis**.
- **Audit Logging**: All healing events are logged with confidence scores for debugging.
- **Repository-Driven**: Locators are managed in `resources/locators.json` for stability.

## Core Tools (Methods)

### `SelfHealingPage.click(name, selector)`
Performs a click action. If the selector fails, it triggers the `HealingEngine`.
- `name`: The logical name of the locator from `locators.json`.
- `selector`: The primary CSS/XPath selector.

### `SelfHealingPage.fill(name, selector, value)`
Performs a fill action. If the selector fails, it triggers the `HealingEngine`.
- `name`: The logical name of the locator from `locators.json`.
- `selector`: The primary CSS/XPath selector.
- `value`: The text to fill.

## Usage Patterns

When writing tests, use the `SelfHealingPage` instead of the raw Playwright `page` for critical elements that are prone to change.

```typescript
import { SelfHealingPage } from '../healing/SelfHealingPage';

// Inside a test
await selfHealingPage.click('loginButton', '#btn-login');
```

## Reference Playbooks

- [Visual Healing Guide](./references/visual-healing.md): Deep dive into template matching.
- [OCR healing Guide](./references/ocr-healing.md): How Tesseract is used for text fallback.
- [Audit Logging](./references/audit-logging.md): Interpreting repair logs.
