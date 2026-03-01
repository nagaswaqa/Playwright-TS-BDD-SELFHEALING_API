import { Given, When, Then, Before, testContext, testContextStorage, expect } from '../core/support/base-step';
import { DemoPage } from '../pages/DemoPage';

let demoPage: DemoPage;

/**
 * Background: Initialize the demo page before each scenario
 */
Before(async function (this: any, { page, $testInfo }: any) {
  // DemoPage receives the page instance directly from Playwright
  demoPage = new DemoPage();

  console.log('[Steps] Demo page initialized');
  console.log(`[Steps] Starting scenario: ${$testInfo.title}`);
});

/**
 * Navigate to the demo page
 */
Given('I navigate to the demo page', async function (this: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Navigating to demo page');
  await demoPage.navigateToDemoPage();

  // Wait for the page to load
  await demoPage.waitForLoadState('networkidle');

  console.log('[Steps] Demo page loaded successfully');
});

/**
 * Click the login button using self-healing
 */
When('I click the login button using self-healing', async function (this: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Clicking login button with self-healing');

  try {
    await demoPage.clickLoginButtonWithHealing();
    console.log('[Steps] Login button clicked successfully (with or without healing)');
  } catch (error) {
    console.error('[Steps] Failed to click login button:', error);
    throw new Error(`Failed to click login button: ${error}`);
  }
});

/**
 * Check if the success message is visible
 */
Then('I should see the success message', async function (this: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Verifying success message is visible');

  // Wait longer for the animation/render (demo has 600ms delay)
  await demoPage.waitForTimeout(1500);

  const isVisible = await demoPage.isSuccessMessageVisible();

  if (isVisible) {
    const successText = await demoPage.getSuccessMessage();
    console.log('[Steps] Success message found:', successText);
    // Be more flexible with the check
    expect(successText.toLowerCase()).toMatch(/successfully|clicked|login/);
  } else {
    throw new Error('Success message is not visible');
  }
});

/**
 * Verify the login button is visible
 */
Then('the login button should be visible', async function (this: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Verifying login button is visible');

  const isVisible = await demoPage.isLoginButtonVisible();

  expect(isVisible).toBe(true);
  console.log('[Steps] Login button is visible: ✓');
});

/**
 * Verify the login button is enabled
 */
Then('the login button should be enabled', async function (this: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Verifying login button is enabled');

  const isEnabled = await demoPage.isLoginButtonEnabled();

  expect(isEnabled).toBe(true);
  console.log('[Steps] Login button is enabled: ✓');
});

/**
 * Verify the login button text
 */
Then('the login button text should be {string}', async function (this: any, { }: any, expectedText: string) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Verifying login button text');

  const buttonText = await demoPage.getLoginButtonText();
  // Remove any emoji/special characters and trim for cleaner comparison
  const cleanedText = buttonText.replace(/[^a-zA-Z\s]/g, '').trim();

  // If healing happened, we might have slightly different text depending on the locator used
  // but expectedText is 'Login'
  expect(cleanedText.toLowerCase()).toBe(expectedText.toLowerCase());
  console.log(`[Steps] Login button text is correct: "${buttonText}" ✓`);
});

/**
 * Check the login button state with healing
 */
When('I check the login button state with healing', async function (this: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Checking login button state with healing');

  const isVisible = await demoPage.isLoginButtonVisible();
  const isEnabled = await demoPage.isLoginButtonEnabled();
  const text = await demoPage.getLoginButtonText();

  console.log(`[Steps] Button state - Visible: ${isVisible}, Enabled: ${isEnabled}, Text: "${text}"`);

  // Store in context for next step
  this.buttonState = {
    visible: isVisible,
    enabled: isEnabled,
    text: text
  };
});

/**
 * Verify the button is clickable (visible and enabled)
 */
Then('the button state should indicate it is clickable', async function (this: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Verifying button is clickable');

  const { visible, enabled } = this.buttonState;

  expect(visible).toBe(true);
  expect(enabled).toBe(true);

  console.log('[Steps] Button is clickable: ✓');
});

/**
 * Verify the button has the correct ID attribute
 */
Then('the button should have the correct ID attribute', async function (this: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Verifying button ID attribute');

  const buttonId = await demoPage.getLoginButtonId();

  expect(buttonId).toBe('correct-login-btn');
  console.log(`[Steps] Button ID is correct: "${buttonId}" ✓`);
});

/**
 * Generic step for debugging - scroll element into view
 */
When('I scroll the login button into view', async function (this: any, { page }: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Scrolling login button into view');

  const selector = '#correct-login-btn';

  await page.locator(selector).scrollIntoViewIfNeeded();

  console.log('[Steps] Login button scrolled into view');
});

/**
 * Generic step for debugging - highlight element
 */
When('I highlight the login button', async function (this: any, { page }: any) {
  testContextStorage.enterWith(this);
  console.log('[Steps] Highlighting login button');

  const selector = '#correct-login-btn';

  // Add a highlight effect using JavaScript
  await page.evaluate((sel: string) => {
    const element = document.querySelector(sel) as HTMLElement;
    if (element) {
      element.style.outline = '3px solid red';
      element.style.outlineOffset = '2px';
    }
  }, selector);

  console.log('[Steps] Login button highlighted');
});
