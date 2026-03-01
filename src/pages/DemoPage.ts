import { SelfHealingBasePage } from '../core/base/SelfHealingBasePage';
import { globalHealingEngine } from '../core/healing/HealingUtils';
import { testContext } from '../core/support/test-context';
import { Page } from '../core/base/BasePage';
import * as path from 'path';

/**
 * DemoPage - Page object for the Self-Healing Demo page.
 * Page is automatically resolved from the active test context (set by hooks).
 * No need to pass a Page instance — just instantiate and use.
 */
// central constants for DemoPage
const demoConstants = {
  selectors: {
    loginButton: '#wrong-id', // INTENTIONALLY BROKEN to trigger healing
    successMessage: '#success-message',
    usernameInput: '#username-input',
    reactTab: '#tab-react',
    reactIncrementBtn: '#react-increment-btn',
    reactResetBtn: '#react-reset-btn',
    reactCounterValue: '#react-counter div:nth-child(2)',
  },
  locatorNames: {
    loginButton: 'demoLogin',
  },
  // compute file URL lazily
  get demoUrl() {
    const demoPath = path.resolve(__dirname, '../../demoa_appication/demo.html');
    return `file://${demoPath}`;
  }
}

export class DemoPage extends SelfHealingBasePage {
  constructor() {
    super(testContext.page!, globalHealingEngine!);
  }


  /**
   * Navigate to the demo page
   * Supports both file:// and http:// URLs
   */
  async navigateToDemoPage(): Promise<void> {
    // use centralized constant for demo page url
    await this.navigateTo(demoConstants.demoUrl);
  }

  /**
   * Click the login button
   */
  async clickLoginButtonWithHealing(): Promise<void> {
    console.log('[DemoPage] Attempting to click login button (healing enabled)');
    // Use the logical name 'demoLogin' so the engine can fetch metadata from the repository
    await this.clickHealed('demoLogin', demoConstants.selectors.loginButton);
  }

  /**
   * Get the success message text after clicking
   */
  async getSuccessMessage(): Promise<string> {
    const element = this.page.locator(demoConstants.selectors.successMessage).first();
    const text = await element.textContent() || '';
    console.log('[DemoPage] Success message text:', text);
    return text;
  }

  /**
   * Check if the login button is visible
   */
  async isLoginButtonVisible(): Promise<boolean> {
    return await this.isVisibleHealed('demoLogin', demoConstants.selectors.loginButton);
  }

  /**
   * Check if the login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isEnabledHealed('demoLogin', demoConstants.selectors.loginButton);
  }

  /**
   * Get the login button text (with trimming)
   */
  async getLoginButtonText(): Promise<string> {
    const text = await this.getTextHealed('demoLogin', demoConstants.selectors.loginButton);
    return text.trim();
  }

  /**
   * Get the login button ID attribute
   */
  async getLoginButtonId(): Promise<string | null> {
    return await this.getAttributeHealed('demoLogin', demoConstants.selectors.loginButton, 'id');
  }

  /**
   * Check if success message is visible (or exists in DOM, even if hidden)
   */
  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      console.log(`[DemoPage] Current URL: ${this.page.url()}`);
      // Check if element exists in the DOM
      const count = await this.page.locator(demoConstants.selectors.successMessage).count();
      console.log(`[DemoPage] Success message element exists: ${count > 0} (count: ${count})`);

      if (count > 0) return true;

      // Fallback: Check auth status pill
      const pillText = await this.page.textContent('#auth-status-pill');
      console.log(`[DemoPage] Auth status pill text: "${pillText}"`);
      if (pillText?.includes('Logged In')) return true;

      return false;
    } catch (e) {
      console.log('[DemoPage] Error checking success message:', e);
      return false;
    }
  }

  /**
   * Get the login button bounding box (dimensions and position)
   */
  async getLoginButtonBoundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null> {
    const sel = await this.healedLocator('demoLogin', demoConstants.selectors.loginButton);
    return await this.page.locator(sel).first().boundingBox();
  }

  /**
   * Fill the username input field
   */
  async fillUsername(username: string): Promise<void> {
    console.log(`[DemoPage] Filling username: ${username}`);
    await this.page.fill(demoConstants.selectors.usernameInput, username);
  }

  /**
   * Click on the React tab
   */
  async clickReactTab(): Promise<void> {
    console.log('[DemoPage] Clicking React tab');
    await this.page.click(demoConstants.selectors.reactTab);
  }

  /**
   * Click the React increment button
   */
  async clickReactIncrement(): Promise<void> {
    console.log('[DemoPage] Clicking React increment button');
    await this.page.click(demoConstants.selectors.reactIncrementBtn);
  }

  /**
   * Click the React reset button
   */
  async clickReactReset(): Promise<void> {
    console.log('[DemoPage] Clicking React reset button');
    await this.page.click(demoConstants.selectors.reactResetBtn);
  }

  /**
   * Get the current value of the React counter
   */
  async getReactCounterValue(): Promise<string> {
    const value = await this.page.textContent(demoConstants.selectors.reactCounterValue);
    console.log(`[DemoPage] React counter value: ${value?.trim()}`);
    return value?.trim() || '';
  }

  /**
   * Verify if the demo page is open by checking the title
   */
  async isPageOpen(): Promise<boolean> {
    const title = await this.page.title();
    return title.includes('Self-Healing Demo');
  }
}
