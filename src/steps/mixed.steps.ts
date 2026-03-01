import { Given, When, Then, Before, expect, RestApiClient, logger, testContextStorage } from '../core/support/base-step';
import { DemoPage } from '../pages/DemoPage';

let demoPage: DemoPage;
let apiClient: RestApiClient;
let lastResponse: any;

/**
 * Initialize components before each scenario
 */
Before(async function (this: any, { request }: any) {
    testContextStorage.enterWith(this);
    demoPage = new DemoPage();
    apiClient = new RestApiClient(request);
});

/**
 * API Step: Perform GET request
 */
When('I perform a GET request to {string}', async function (this: any, { }: any, url: string) {
    testContextStorage.enterWith(this);
    logger.info(`[Steps] Performing API GET request to: ${url}`);
    lastResponse = await apiClient.get(url);
});

/**
 * API Step: Verify status
 */
Then('the API response status should be {int}', async function (this: any, { }: any, status: number) {
    testContextStorage.enterWith(this);
    expect(lastResponse.status()).toBe(status);
    logger.info(`[Steps] API Status verified: ${status}`);
});

/**
 * API Step: Verify content
 */
Then('the API response should contain {string}', async function (this: any, { }: any, text: string) {
    testContextStorage.enterWith(this);
    const body = await lastResponse.text();
    expect(body).toContain(text);
    logger.info(`[Steps] API Response contains: "${text}"`);
});

/**
 * UI Step: Click with healing
 */
When('I click the login button with self-healing', async function (this: any, { }: any) {
    testContextStorage.enterWith(this);
    logger.info('[Steps] Clicking login button with self-healing');
    await demoPage.clickLoginButtonWithHealing();
});

/**
 * UI Step: Verify success
 */
Then('the success message should be visible', async function (this: any, { }: any) {
    testContextStorage.enterWith(this);
    logger.info('[Steps] Verifying success message visibility');
    await demoPage.waitForTimeout(1000); // Wait for demo animation
    const isVisible = await demoPage.isSuccessMessageVisible();
    expect(isVisible).toBe(true);
    logger.info('[Steps] Success message is visible');
});

/**
 * State Sharing: Extract from API and save to context
 */
When('I extract the field {string} from the API response and save it as {string}', async function (this: any, { }: any, field: string, key: string) {
    testContextStorage.enterWith(this);
    const body = await lastResponse.json();
    const value = body[field];

    if (value === undefined) {
        throw new Error(`Field "${field}" not found in API response: ${JSON.stringify(body)}`);
    }

    this.setValue(key, value);
    logger.info(`[Steps] Extracted "${field}" -> Saved to context as "${key}": ${value}`);
});

/**
 * State Sharing: Use saved value in UI
 */
When('I enter the saved value {string} into the username field', async function (this: any, { }: any, key: string) {
    testContextStorage.enterWith(this);
    const value = this.getValue(key);

    if (!value) {
        throw new Error(`Value for key "${key}" not found in TestContext`);
    }

    logger.info(`[Steps] Entering saved value "${value}" into username input`);
    await demoPage.fillUsername(value);
});
