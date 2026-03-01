import { test as base } from 'playwright-bdd';
import { BrowserContext, Page, Browser } from '@playwright/test';
import { testConfig } from '../../config/testConfig';

// Define types for scenario and worker fixtures
type MyTestFixtures = {
    readonlyContext: BrowserContext; // dummy if needed
};

type MyWorkerFixtures = {
    workerContext: BrowserContext;
    workerPage: Page;
};

/**
 * Custom fixtures to support Singleton Page per Worker.
 */
export const test = base.extend<MyTestFixtures, MyWorkerFixtures>({
    // 1. Define worker-scoped BrowserContext
    workerContext: [async ({ browser }: { browser: Browser }, use: (r: BrowserContext) => Promise<void>) => {
        const context = await browser.newContext({
            viewport: testConfig.viewport,
            ignoreHTTPSErrors: true,
            locale: 'en-US',
        });
        await use(context);
        await context.close();
    }, { scope: 'worker' }],

    // 2. Define worker-scoped Page
    workerPage: [async ({ workerContext }: MyWorkerFixtures, use: (r: Page) => Promise<void>) => {
        const page = await workerContext.newPage();
        await use(page);
        await page.close();
    }, { scope: 'worker' }],

    // 3. Override standard scenario-scoped context to use the worker-scoped one
    context: async ({ workerContext }: MyWorkerFixtures, use: (r: BrowserContext) => Promise<void>) => {
        await use(workerContext);
    },

    // 4. Override standard scenario-scoped page to use the worker-scoped one
    page: async ({ workerPage }: MyWorkerFixtures, use: (r: Page) => Promise<void>) => {
        await use(workerPage);
    },
});
