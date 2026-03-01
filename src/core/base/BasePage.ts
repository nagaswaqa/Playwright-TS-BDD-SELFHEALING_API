import { Page, Response, Locator, FrameLocator } from "@playwright/test";
export { Page };
import { testContext } from '../support/test-context';

export abstract class BasePage {
  /**
   * Explicit page reference — only set when a Page is passed to the constructor.
   * Leave undefined to resolve the page lazily from the active test context.
   */
  protected _page?: Page;

  constructor(page?: Page) {
    this._page = page;
  }

  /**
   * Returns the Playwright Page for the current scenario.
   * Resolution order:
   *   1. Explicit page passed into the constructor (e.g. from fixture).
   *   2. Per-scenario page from testContext (set by the Before hook via AsyncLocalStorage).
   */
  protected get page(): Page {
    const resolved = this._page ?? testContext.page;
    if (!resolved) {
      throw new Error(
        '[BasePage] No Page available. Ensure the Before hook has run or pass a Page to the constructor.'
      );
    }
    return resolved;
  }

  // ================== Navigation Methods ==================

  /**
   * Navigate to a URL
   * @param url - URL to navigate to
   * @param waitUntil - When to consider navigation succeeded (default: 'networkidle')
   */
  async navigateTo(
    url: string,
    waitUntil:
      | "load"
      | "domcontentloaded"
      | "networkidle"
      | "commit" = "networkidle",
  ): Promise<Response | null> {
    return await this.page.goto(url, { waitUntil });
  }

  /**
   * Reload the current page
   * @param waitUntil - When to consider navigation succeeded (default: 'networkidle')
   * @returns Response from the reload
   */
  async reload(
    waitUntil:
      | "load"
      | "domcontentloaded"
      | "networkidle"
      | "commit" = "networkidle",
  ): Promise<Response | null> {
    return await this.page.reload({ waitUntil });
  }

  /**
   * Go back one page in browser history
   * @param waitUntil - When to consider navigation succeeded (default: 'networkidle')
   * @returns Response from the back navigation
   */
  async goBack(
    waitUntil:
      | "load"
      | "domcontentloaded"
      | "networkidle"
      | "commit" = "networkidle",
  ): Promise<Response | null> {
    return await this.page.goBack({ waitUntil });
  }

  /**
   * Go forward one page in browser history
   * @param waitUntil - When to consider navigation succeeded (default: 'networkidle')
   * @returns Response from the forward navigation
   */
  async goForward(
    waitUntil:
      | "load"
      | "domcontentloaded"
      | "networkidle"
      | "commit" = "networkidle",
  ): Promise<Response | null> {
    return await this.page.goForward({ waitUntil });
  }

  // ================== Locator Methods ==================

  /**
   * Get a locator for a CSS selector
   * @param selector - CSS selector string
   * @returns Locator object for the selector
   */
  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get a locator by accessibility role (ARIA role)
   * @param role - The accessibility role to search for
   * @param options - Optional name and exact matching options
   * @returns Locator object matching the role
   */
  getByRole(
    role:
      | "alert"
      | "alertdialog"
      | "application"
      | "article"
      | "banner"
      | "blockquote"
      | "button"
      | "caption"
      | "cell"
      | "checkbox"
      | "code"
      | "columnheader"
      | "combobox"
      | "complementary"
      | "contentinfo"
      | "definition"
      | "deletion"
      | "dialog"
      | "directory"
      | "document"
      | "emphasis"
      | "feed"
      | "figure"
      | "form"
      | "generic"
      | "grid"
      | "gridcell"
      | "group"
      | "heading"
      | "img"
      | "insertion"
      | "link"
      | "list"
      | "listbox"
      | "listitem"
      | "log"
      | "main"
      | "marquee"
      | "math"
      | "meter"
      | "menu"
      | "menubar"
      | "menuitem"
      | "menuitemcheckbox"
      | "menuitemradio"
      | "navigation"
      | "none"
      | "note"
      | "option"
      | "paragraph"
      | "presentation"
      | "progressbar"
      | "radio"
      | "radiogroup"
      | "region"
      | "row"
      | "rowgroup"
      | "rowheader"
      | "scrollbar"
      | "search"
      | "searchbox"
      | "separator"
      | "slider"
      | "spinbutton"
      | "status"
      | "strong"
      | "subscript"
      | "superscript"
      | "switch"
      | "tab"
      | "table"
      | "tablist"
      | "tabpanel"
      | "term"
      | "textbox"
      | "time"
      | "timer"
      | "toolbar"
      | "tooltip"
      | "tree"
      | "treegrid"
      | "treeitem",
    options?: { name?: string | RegExp; exact?: boolean },
  ): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get a locator by visible text content
   * @param text - Text or regex pattern to match
   * @param options - Optional exact matching option
   * @returns Locator object matching the text
   */
  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  /**
   * Get a locator by form field label text
   * @param text - Label text or regex pattern to match
   * @param options - Optional exact matching option
   * @returns Locator object matching the label
   */
  getByLabel(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByLabel(text, options);
  }

  /**
   * Get a locator by input placeholder text
   * @param text - Placeholder text or regex pattern to match
   * @param options - Optional exact matching option
   * @returns Locator object matching the placeholder
   */
  getByPlaceholder(
    text: string | RegExp,
    options?: { exact?: boolean },
  ): Locator {
    return this.page.getByPlaceholder(text, options);
  }

  /**
   * Get a locator by alt text of an image or area element
   * @param text - Alt text or regex pattern to match
   * @param options - Optional exact matching option
   * @returns Locator object matching the alt text
   */
  getByAltText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByAltText(text, options);
  }

  /**
   * Get a locator by title attribute text
   * @param text - Title text or regex pattern to match
   * @param options - Optional exact matching option
   * @returns Locator object matching the title
   */
  getByTitle(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByTitle(text, options);
  }

  /**
   * Get a locator by data-testid attribute
   * @param testId - Test ID value to match
   * @returns Locator object matching the test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get a frame locator for iframe elements
   * @param selector - CSS selector to locate the frame
   * @returns FrameLocator object for accessing iframe content
   */
  frameLocator(selector: string): FrameLocator {
    return this.page.frameLocator(selector);
  }

  // ================== Interaction Methods ==================

  /**
   * Click on an element
   * @param selector - CSS selector string or Locator object
   * @param options - Click options (button, clickCount, delay, force, timeout)
   */
  async click(
    selector: string | Locator,
    options?: {
      button?: "left" | "right" | "middle";
      clickCount?: number;
      delay?: number;
      force?: boolean;
      timeout?: number;
    },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.click(options);
  }

  /**
   * Force click on an element, bypassing visibility checks
   * @param selector - CSS selector string or Locator object
   * @param options - Click options (button, clickCount, delay, timeout)
   */
  async forceClick(
    selector: string | Locator,
    options?: {
      button?: "left" | "right" | "middle";
      clickCount?: number;
      delay?: number;
      timeout?: number;
    },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.click({ force: true, ...options });
  }

  /**
   * Double-click on an element
   * @param selector - CSS selector string or Locator object
   * @param options - Click options (button, delay, force, timeout)
   */
  async doubleClick(
    selector: string | Locator,
    options?: {
      button?: "left" | "right" | "middle";
      delay?: number;
      force?: boolean;
      timeout?: number;
    },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.dblclick(options);
  }

  /**
   * Type text into an element (fills the input)
   * @param selector - CSS selector string or Locator object
   * @param text - Text to type
   * @param options - Type options (delay, timeout)
   */
  async type(
    selector: string | Locator,
    text: string,
    options?: { delay?: number; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.fill(text, options);
  }

  /**
   * Fill an input field with text
   * @param selector - CSS selector string or Locator object
   * @param text - Text to fill in
   * @param options - Fill options (force, timeout)
   */
  async fill(
    selector: string | Locator,
    text: string,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.fill(text, options);
  }

  /**
   * Press a keyboard key on an element
   * @param selector - CSS selector string or Locator object
   * @param key - Key name to press (e.g., 'Enter', 'Tab', 'Escape')
   * @param options - Press options (delay, timeout)
   */
  async pressKey(
    selector: string | Locator,
    key: string,
    options?: { delay?: number; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.press(key, options);
  }

  /**
   * Hover over an element
   * @param selector - CSS selector string or Locator object
   * @param options - Hover options (force, timeout)
   */
  async hover(
    selector: string | Locator,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.hover(options);
  }

  /**
   * Check a checkbox or radio button
   * @param selector - CSS selector string or Locator object
   * @param options - Check options (force, timeout)
   */
  async check(
    selector: string | Locator,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.check(options);
  }

  /**
   * Uncheck a checkbox or radio button
   * @param selector - CSS selector string or Locator object
   * @param options - Uncheck options (force, timeout)
   */
  async uncheck(
    selector: string | Locator,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.uncheck(options);
  }

  /**
   * Select option(s) from a select dropdown
   * @param selector - CSS selector string or Locator object
   * @param values - Option value, values array, or object with label/value/index
   * @param options - Select options (force, timeout)
   * @returns Array of selected values
   */
  async selectOption(
    selector: string | Locator,
    values:
      | string
      | string[]
      | { value?: string; label?: string; index?: number },
    options?: { force?: boolean; timeout?: number },
  ): Promise<string[]> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.selectOption(values, options);
  }

  /**
   * Drag an element to another element and drop it
   * @param source - Source element selector string or Locator object
   * @param target - Target element selector string or Locator object
   * @param options - Drag options (force, timeout)
   */
  async dragAndDrop(
    source: string | Locator,
    target: string | Locator,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const sourceElement =
      typeof source === "string" ? this.page.locator(source) : source;
    const targetElement =
      typeof target === "string" ? this.page.locator(target) : target;
    await sourceElement.dragTo(targetElement, options);
  }

  /**
   * Upload file(s) to a file input element
   * @param selector - CSS selector string or Locator object
   * @param filePath - File path or array of file paths to upload
   * @param options - Upload options (timeout)
   */
  async uploadFile(
    selector: string | Locator,
    filePath: string | string[],
    options?: { timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.setInputFiles(filePath, options);
  }

  // ================== Element State Methods ==================

  async getText(selector: string | Locator): Promise<string> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return (await element.textContent()) || "";
  }

  async getInnerText(selector: string | Locator): Promise<string> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.innerText();
  }

  async getInputValue(selector: string | Locator): Promise<string> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.inputValue();
  }

  async getAttribute(
    selector: string | Locator,
    name: string,
  ): Promise<string | null> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.getAttribute(name);
  }

  async isVisible(selector: string | Locator): Promise<boolean> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.isVisible();
  }

  async isHidden(selector: string | Locator): Promise<boolean> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.isHidden();
  }

  async isEnabled(selector: string | Locator): Promise<boolean> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.isEnabled();
  }

  async isDisabled(selector: string | Locator): Promise<boolean> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.isDisabled();
  }

  async isChecked(selector: string | Locator): Promise<boolean> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.isChecked();
  }

  async isEditable(selector: string | Locator): Promise<boolean> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.isEditable();
  }

  async count(selector: string | Locator): Promise<number> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.count();
  }

  /**
   * Tap on an element (for mobile/touch devices)
   * @param selector - CSS selector string or Locator object
   * @param options - Tap options (force, timeout)
   */
  async tap(
    selector: string | Locator,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.tap(options);
  }

  /**
   * Blur (remove focus from) an element
   * @param selector - CSS selector string or Locator object
   * @param options - Blur options (timeout)
   */
  async blur(
    selector: string | Locator,
    options?: { timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.blur(options);
  }

  /**
   * Focus on an element
   * @param selector - CSS selector string or Locator object
   * @param options - Focus options (timeout)
   */
  async focus(
    selector: string | Locator,
    options?: { timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.focus(options);
  }

  /**
   * Clear all text from an input element
   * @param selector - CSS selector string or Locator object
   * @param options - Clear options (force, timeout)
   */
  async clear(
    selector: string | Locator,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.clear(options);
  }

  /**
   * Type text one character at a time with delays
   * @param selector - CSS selector string or Locator object
   * @param text - Text to type
   * @param options - Type options (delay, timeout)
   */
  async pressSequentially(
    selector: string | Locator,
    text: string,
    options?: { delay?: number; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.pressSequentially(text, options);
  }

  /**
   * Select all text in an input element
   * @param selector - CSS selector string or Locator object
   * @param options - Select options (force, timeout)
   */
  async selectText(
    selector: string | Locator,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.selectText(options);
  }

  /**
   * Check or uncheck a checkbox/radio button
   * @param selector - CSS selector string or Locator object
   * @param checked - True to check, false to uncheck
   * @param options - Set options (force, timeout)
   */
  async setChecked(
    selector: string | Locator,
    checked: boolean,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.setChecked(checked, options);
  }

  /**
   * Get the inner HTML of an element
   * @param selector - CSS selector string or Locator object
   * @returns Inner HTML string
   */
  async getInnerHTML(selector: string | Locator): Promise<string> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.innerHTML();
  }

  /**
   * Get the text content of an element
   * @param selector - CSS selector string or Locator object
   * @returns Text content or null if not found
   */
  async getTextContent(selector: string | Locator): Promise<string | null> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.textContent();
  }

  /**
   * Get the bounding box of an element
   * @param selector - CSS selector string or Locator object
   * @returns Object with x, y, width, height coordinates or null if not visible
   */
  async boundingBox(
    selector: string | Locator,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.boundingBox();
  }

  /**
   * Scroll element into view if needed
   * @param selector - CSS selector string or Locator object
   * @param options - Scroll options (timeout)
   */
  async scrollIntoViewIfNeeded(
    selector: string | Locator,
    options?: { timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.scrollIntoViewIfNeeded(options);
  }

  /**
   * Dispatch a DOM event on an element
   * @param selector - CSS selector string or Locator object
   * @param type - Event type (e.g., 'click', 'change')
   * @param eventInit - Event initialization object
   * @param options - Dispatch options (timeout)
   */
  async dispatchEvent(
    selector: string | Locator,
    type: string,
    eventInit?: any,
    options?: { timeout?: number },
  ): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.dispatchEvent(type, eventInit, options);
  }

  /**
   * Highlight an element in the page for visual debugging
   * @param selector - CSS selector string or Locator object
   */
  async highlight(selector: string | Locator): Promise<void> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    await element.highlight();
  }

  /**
   * Get the ARIA accessibility snapshot of an element
   * @param selector - CSS selector string or Locator object
   * @param options - Snapshot options (timeout)
   * @returns ARIA snapshot as string
   */
  async ariaSnapshot(
    selector: string | Locator,
    options?: { timeout?: number },
  ): Promise<string> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.ariaSnapshot(options);
  }

  // ================== Wait Methods ==================

  /**
   * Wait for page load state
   * @param state - Load state to wait for: 'load', 'domcontentloaded', or 'networkidle' (default: 'load')
   * @param options - Wait options (timeout)
   */
  async waitForLoadState(
    state: "load" | "domcontentloaded" | "networkidle" = "load",
    options?: { timeout?: number },
  ): Promise<void> {
    await this.page.waitForLoadState(state, options);
  }

  /**
   * Wait for page URL to match the given condition
   * @param url - URL string, regex, or predicate function
   * @param options - Wait options (timeout, waitUntil)
   */
  async waitForURL(
    url: string | RegExp | ((url: URL) => boolean),
    options?: {
      timeout?: number;
      waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
    },
  ): Promise<void> {
    await this.page.waitForURL(url, options);
  }

  /**
   * Wait for a selector to appear/disappear in the DOM
   * @param selector - CSS selector to wait for
   * @param options - Wait options (state, timeout)
   * @returns Locator object for the selector
   */
  async waitForSelector(
    selector: string,
    options?: {
      state?: "attached" | "detached" | "visible" | "hidden";
      timeout?: number;
    },
  ): Promise<Locator> {
    return this.page.locator(selector);
  }

  /**
   * Wait for a specific amount of time in milliseconds
   * @param timeout - Time to wait in milliseconds
   */
  async waitForTimeout(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Wait for a network response matching the URL or predicate
   * @param urlOrPredicate - URL string, regex, or predicate function
   * @param options - Wait options (timeout)
   * @returns The response object
   */
  async waitForResponse(
    urlOrPredicate:
      | string
      | RegExp
      | ((response: Response) => boolean | Promise<boolean>),
    options?: { timeout?: number },
  ): Promise<Response> {
    return await this.page.waitForResponse(urlOrPredicate, options);
  }

  /**
   * Wait for a network request matching the URL or regex
   * @param urlOrPredicate - URL string or regex pattern
   * @param options - Wait options (timeout)
   * @returns The request object
   */
  async waitForRequest(
    urlOrPredicate: string | RegExp,
    options?: { timeout?: number },
  ): Promise<any> {
    return await this.page.waitForRequest(urlOrPredicate, options);
  }

  // ================== Page Information Methods ==================

  /**
   * Get the page title
   * @returns The page title text
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current page URL
   * @returns The current page URL
   */
  getURL(): string {
    return this.page.url();
  }

  /**
   * Get the entire page HTML content
   * @returns The page HTML as string
   */
  async getContent(): Promise<string> {
    return await this.page.content();
  }

  // ================== Screenshot & Media Methods ==================

  /**
   * Take a screenshot of the page or part of the page
   * @param options - Screenshot options (path, fullPage, type, quality)
   * @returns Buffer containing the screenshot image data
   */
  async screenshot(options?: {
    path?: string;
    fullPage?: boolean;
    type?: "png" | "jpeg";
    quality?: number;
  }): Promise<Buffer> {
    return await this.page.screenshot(options);
  }

  /**
   * Take a screenshot of a specific element
   * @param selector - CSS selector string or Locator object
   * @param options - Screenshot options (path, type, quality)
   * @returns Buffer containing the screenshot image data
   */
  async screenshotElement(
    selector: string | Locator,
    options?: { path?: string; type?: "png" | "jpeg"; quality?: number },
  ): Promise<Buffer> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.screenshot(options);
  }

  // ================== Evaluation & Script Methods ==================

  /**
   * Evaluate JavaScript code in the page context
   * @param pageFunction - Function to execute in browser context
   * @param arg - Optional argument to pass to the function
   * @returns Promise with the result of the function
   * @example
   * await page.evaluate(() => window.innerWidth);
   * await page.evaluate((text) => document.title = text, 'New Title');
   */
  async evaluate<R, Arg = undefined>(
    pageFunction: Arg extends undefined
      ? () => R | Promise<R>
      : (arg: Arg) => R | Promise<R>,
    arg?: Arg,
  ): Promise<R> {
    return await this.page.evaluate(pageFunction as any, arg);
  }

  /**
   * Evaluate JavaScript code in the page context and return a JSHandle
   * Use this when you need to work with non-serializable return values
   * @param pageFunction - Function to execute in browser context
   * @param arg - Optional argument to pass to the function
   * @returns Promise with JSHandle
   */
  async evaluateHandle<Arg = undefined>(
    pageFunction: Arg extends undefined
      ? () => any | Promise<any>
      : (arg: Arg) => any | Promise<any>,
    arg?: Arg,
  ): Promise<any> {
    return await this.page.evaluateHandle(pageFunction as any, arg);
  }

  /**
   * Evaluate JavaScript on a specific element (Modern approach using locator)
   * Replaces deprecated page.$eval() method
   * @param selector - Selector to find the element
   * @param pageFunction - Function to execute with the element
   * @param arg - Optional argument to pass to the function
   * @returns Promise with the result
   * @example
   * await page.evaluateOnSelector('#search', el => el.value);
   * await page.evaluateOnSelector('.container', (el, suffix) => el.innerHTML + suffix, 'hello');
   */
  async evaluateOnSelector<R, Arg = undefined>(
    selector: string | Locator,
    pageFunction: Arg extends undefined
      ? (element: Element) => R | Promise<R>
      : (element: Element, arg: Arg) => R | Promise<R>,
    arg?: Arg,
  ): Promise<R> {
    const element =
      typeof selector === "string" ? this.page.locator(selector) : selector;
    return await element.evaluate(pageFunction as any, arg);
  }

  /**
   * Evaluate JavaScript on all matching elements (Modern approach using locator)
   * Replaces deprecated page.$$eval() method
   * @param selector - Selector to find elements
   * @param pageFunction - Function to execute with the elements array
   * @param arg - Optional argument to pass to the function
   * @returns Promise with the result
   * @example
   * await page.evaluateOnSelectorAll('div', divs => divs.length);
   * await page.evaluateOnSelectorAll('a', (links, className) =>
   *   links.filter(l => l.className === className).length, 'active'
   * );
   */
  async evaluateOnSelectorAll<R, Arg = undefined>(
    selector: string,
    pageFunction: Arg extends undefined
      ? (elements: Element[]) => R | Promise<R>
      : (elements: Element[], arg: Arg) => R | Promise<R>,
    arg?: Arg,
  ): Promise<R> {
    return await this.page
      .locator(selector)
      .evaluateAll(pageFunction as any, arg);
  }

  // ================== Context & Viewport Methods ==================

  /**
   * Set the viewport size of the page
   * @param width - Width in pixels
   * @param height - Height in pixels
   */
  async setViewportSize(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  /**
   * Get the current viewport size
   * @returns Object with width and height or null
   */
  viewportSize(): { width: number; height: number } | null {
    return this.page.viewportSize();
  }

  // ================== Dialog & Alert Handling ==================

  /**
   * Setup a handler for dialog/alert boxes
   * @param accept - True to accept, false to dismiss (default: true)
   * @param promptText - Text to enter in prompt dialogs
   */
  async handleDialog(
    accept: boolean = true,
    promptText?: string,
  ): Promise<void> {
    this.page.once("dialog", async (dialog) => {
      if (accept) {
        await dialog.accept(promptText);
      } else {
        await dialog.dismiss();
      }
    });
  }

  // ================== Keyboard & Mouse Methods ==================

  /**
   * Press a keyboard key globally (not on any specific element)
   * @param key - Key name to press (e.g., 'Enter', 'ArrowDown', 'Control')
   * @param options - Press options (delay)
   */
  async keyboardPress(
    key: string,
    options?: { delay?: number },
  ): Promise<void> {
    await this.page.keyboard.press(key, options);
  }

  /**
   * Type text globally on the keyboard (not on any specific element)
   * @param text - Text to type
   * @param options - Type options (delay)
   */
  async keyboardType(
    text: string,
    options?: { delay?: number },
  ): Promise<void> {
    await this.page.keyboard.type(text, options);
  }

  /**
   * Click the mouse at specific coordinates on the page
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param options - Click options (button, clickCount, delay)
   */
  async mouseClick(
    x: number,
    y: number,
    options?: {
      button?: "left" | "right" | "middle";
      clickCount?: number;
      delay?: number;
    },
  ): Promise<void> {
    await this.page.mouse.click(x, y, options);
  }

  // ================== Cookie Methods ==================

  /**
   * Get all cookies from the current context
   * @returns Array of cookie objects
   */
  async getCookies(): Promise<any[]> {
    return await this.page.context().cookies();
  }

  /**
   * Set cookies in the current context
   * @param cookies - Array of cookie objects to set
   */
  async setCookie(cookies: any[]): Promise<void> {
    await this.page.context().addCookies(cookies);
  }

  /**
   * Clear all cookies from the current context
   */
  async clearCookies(): Promise<void> {
    await this.page.context().clearCookies();
  }

  // ================== Utility Methods ==================

  /**
   * Bring the page to the front (for multi-page scenarios)
   */
  async bringToFront(): Promise<void> {
    await this.page.bringToFront();
  }

  /**
   * Close the page and all resources associated with it
   */
  async close(): Promise<void> {
    await this.page.close();
  }

  /**
   * Check if the page is closed
   * @returns True if the page is closed
   */
  isClosed(): boolean {
    return this.page.isClosed();
  }
}
