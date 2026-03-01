# GitHub Copilot Instructions for Playwright-TS-BDD Project

You are an expert software engineer specializing in Playwright, TypeScript, and BDD (Behavior Driven Development) using `playwright-bdd`.

## Project Overview
This project is a high-performance automated testing framework that combines Playwright's speed with Cucumber's readability, enhanced by a custom **Self-Healing Locator Framework**.

## Directory Structure
- `features/`: Gherkin `.feature` files.
- `src/steps/`: Step definition files (`.ts`) mapping Gherkin to Playwright. **USER-DEFINED**
- `src/pages/`: Page Object Model (POM) classes. **USER-DEFINED**
- `src/core/`: Framework core components
  - `src/core/base/`: Base page classes (`BasePage.ts`, `SelfHealingBasePage.ts`)
  - `src/core/support/`: BDD support & hooks (`base-step.ts`, `hooks.ts`, `logger.ts`, `test-context.ts`)
  - `src/core/api/`: API client utilities (`RestApiClient.ts`)
  - `src/core/healing/`: Self-Healing Engine (DOM -> Text -> Visual -> OCR):
    - `LocatorRepository.ts`: Manages `locators.json`.
    - `HealingEngine.ts`: Hybrid pipeline.
    - `SelfHealingPage.ts`: Wrapper for Playwright `Page`.
- `resources/`: Contains `locators.json` and visual template images.
- `reports/`: Test execution reports and results.

## Key Technologies & Patterns
- **Language**: TypeScript (`ES2020`, `CommonJS`).
- **Framework**: Playwright + `playwright-bdd`.
- **Imports**: Use relative imports. Framework modules are located in `src/core/`.
  - *Correct Path for BasePage*: `import { BasePage } from '../../core/base/BasePage';`
  - *Correct Path for HealingEngine*: `import { HealingEngine } from '../core/healing/HealingEngine';`
- **Self-Healing**: Always prefer using healed actions when working in `src/pages/`:
  - Inherit from `SelfHealingBasePage` (imported from `src/core/base/`).
  - Use `this.clickHealed(name, selector)` or `this.fillHealed(name, selector, value)`.
- **BDD Steps**: Use `Given`, `When`, `Then` from `../core/support/base-step`.
- **Async/Await**: Mandatory for all Playwright actions and healing triggers.

## Coding Standards
1. **Implicit Typing**: Use TypeScript types for all function parameters and class members.
2. **Error Handling**: Use `try-catch` blocks in healing logic to allow fallbacks.
3. **Logging**: Use `AuditLogger` for healing events and `logger` for general test steps.
4. **Locators**: Store logical names in `resources/locators.json`. Use descriptive names (e.g., `login_button`, `username_field`).

## Common Instructions
- When generating new Page Objects, ensure they extend `SelfHealingBasePage` from `src/core/base/`.
- When generating Step Definitions, use `testContext` (from `src/core/support/base-step`) for state management between steps.
- If a locator is likely to be dynamic or brittle, suggest using a self-healing alternative.
- **Framework vs User-Defined**: Keep framework code (`src/core/`) separate from user-defined code (`src/pages/`, `src/steps/`).
- **Framework Updates**: Only modify files in `src/core/` if updating the framework itself. User tests should only touch `src/pages/` and `src/steps/`.
