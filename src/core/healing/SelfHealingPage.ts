import { Page, Locator } from '@playwright/test';
import { HealingEngine } from './HealingEngine';

export class SelfHealingPage {
    constructor(
        private page: Page,
        private healingEngine: HealingEngine
    ) { }

    /**
     * Finds a locator from the repository and performs an action.
     * If the locator fails, triggers healing.
     */
    public async click(locatorName: string, originalSelector: string): Promise<void> {
        try {
            await this.page.click(originalSelector, { timeout: 5000 });
        } catch (error: any) {
            console.warn(`[Self-Healing] Click failed for '${locatorName}'. Triggering healing...`);
            const newSelector = await this.healingEngine.heal(this.page, locatorName, originalSelector);

            if (newSelector) {
                console.log(`[Self-Healing] Retrying click with healed selector: ${newSelector}`);
                await this.page.click(newSelector);
            } else {
                throw new Error(`[Self-Healing] Could not heal locator '${locatorName}'. Original error: ${error.message}`);
            }
        }
    }

    public async fill(locatorName: string, originalSelector: string, value: string): Promise<void> {
        try {
            await this.page.fill(originalSelector, value, { timeout: 5000 });
        } catch (error: any) {
            console.warn(`[Self-Healing] Fill failed for '${locatorName}'. Triggering healing...`);
            const newSelector = await this.healingEngine.heal(this.page, locatorName, originalSelector);

            if (newSelector) {
                console.log(`[Self-Healing] Retrying fill with healed selector: ${newSelector}`);
                await this.page.fill(newSelector, value);
            } else {
                throw new Error(`[Self-Healing] Could not heal locator '${locatorName}'. Original error: ${error.message}`);
            }
        }
    }

    // Add other common methods as needed (getAttribute, textContent, etc.)

    public getPage(): Page {
        return this.page;
    }
}
