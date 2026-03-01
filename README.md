# Playwright-BDD Self-Healing Framework

A powerful, enterprise-grade test automation framework combining **Playwright**, **Cucumber (BDD)**, and **AI-driven Self-Healing** capabilities.

## 🚀 Key Features

- **Singleton Page Pattern**: Single browser/page instance per worker for maximum performance and stability.
- **Self-Healing Locators**: Automatically repairs broken selectors using DOM, Visual, and OCR strategies.
- **Hybrid Testing**: Seamlessly integrate UI and API testing in the same scenario.
- **Parallel Execution**: Isolated test contexts per worker with shared `workerState` for session reuse.
- **Advanced Reporting**: Comprehensive HTML reports with traces, screenshots, and self-healing logs.

## 🛠️ Architecture

The framework is built on a modular architecture:
- **Core**: Contains the base page objects, API clients, and the self-healing engine.
- **Support**: Handles fixtures, hooks, and test context management.
- **Features**: Gherkin feature files for BDD.
- **Steps**: TypeScript step definitions mapped to Gherkin steps.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## ⚙️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright Browsers**:
   ```bash
   npx playwright install
   ```

3. **Configure Environment**:
   Update `.env` or `src/config/testConfig.ts` for your target environment.

## 🚦 Quick Start

Generate BDD tests and run the suite:
```bash
npx bddgen; npx playwright test
```

For more details, see the [Usage Guide](file:///c:/Users/Dell/Playwright-TS-BDD-main/USAGE_GUIDE.md).
