import { Page } from '@playwright/test';
import { IHealingStrategy } from './IHealingStrategy';

/**
 * Example custom strategy that attempts to heal by looking for elements with a
 * specific data-* attribute (e.g. data-test-id) matching the locatorName.
 *
 * This demonstrates how users can extend the framework with their own logic.
 */
export class CustomAttributeStrategy implements IHealingStrategy {
    readonly name = 'CUSTOM_ATTR';

    constructor(private attributeName: string = 'data-test-id') {}

    async attempt(
        page: Page,
        locatorName: string,
        originalSelector: string
    ): Promise<{ selector: string; confidence: number } | null> {
        try {
            const sel = `[${this.attributeName}="${locatorName}"]`;
            try {
                await page.waitForSelector(sel, { state: 'attached', timeout: 1000 });
                return { selector: sel, confidence: 0.8 };
            } catch {
                // not found
            }
        } catch (err) {
            console.warn('[CustomAttribute] error', err);
        }
        return null;
    }
}
