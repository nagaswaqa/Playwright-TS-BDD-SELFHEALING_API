import { Page } from '@playwright/test';
import { LocatorRepository, LocatorData } from './LocatorRepository';
import { AuditLogger } from './AuditLogger';

// strategies
import { IHealingStrategy } from './strategies/IHealingStrategy';
import { DomHealingStrategy } from './strategies/DomHealingStrategy';
import { VisualHealingStrategy } from './strategies/VisualHealingStrategy';
import { OcrHealingStrategy } from './strategies/OcrHealingStrategy';
import { ApiHealingStrategy } from './strategies/ApiHealingStrategy';

export class HealingEngine {
    private strategies: IHealingStrategy[] = [];

    constructor(
        private repository: LocatorRepository,
        private logger: AuditLogger,
        resourcesPath: string,
        strategies?: IHealingStrategy[]
    ) {
        // if user supplied custom strategies use them otherwise create defaults
        this.strategies = strategies || [
            new DomHealingStrategy(),
            new VisualHealingStrategy(),
            new OcrHealingStrategy(),
            new ApiHealingStrategy()
        ];
    }

    public async heal(page: Page, locatorName: string, originalSelector: string): Promise<string | null> {
        console.log(`[Healing Engine] Starting healing process for '${locatorName}'...`);

        // 0. Cache Check (Memory)
        const cachedSelector = this.repository.getCachedSelector(locatorName);
        if (cachedSelector) {
            console.log(`[Healing Cache] Found cached selector for '${locatorName}': ${cachedSelector}. Trying recovery...`);
            try {
                await page.waitForSelector(cachedSelector, { state: 'attached', timeout: 2000 });
                console.log(`[Healing Cache] Success! Element recovered from memory for '${locatorName}'.`);
                return cachedSelector;
            } catch {
                console.warn(`[Healing Cache] Cached selector failed for '${locatorName}'. Proceeding to full healing...`);
            }
        }

        // fetch metadata (LocatorData) if available
        const metadata = this.repository.getLocator(locatorName);

        // iterate through strategies in order
        for (const strat of this.strategies) {
            try {
                const result = await strat.attempt(page, locatorName, originalSelector, metadata);
                if (result && result.selector) {
                    await this.recordSuccess(locatorName, originalSelector, result.selector, result.confidence, strat.name);
                    return result.selector;
                }
            } catch (error) {
                console.warn(`[Healing Engine] Strategy ${strat.name} errored:`, error);
            }
        }

        console.error(`[Healing Engine] All healing layers failed for '${locatorName}'.`);
        await this.logger.logHealingEvent({
            locatorName,
            oldSelector: originalSelector,
            newSelector: 'NONE',
            confidence: 0,
            method: 'NONE',
            success: false
        });
        return null;
    }

    // DOM healing logic has been delegated to the DomHealingStrategy

    // XPath heuristics have been migrated into DomHealingStrategy

    private async recordSuccess(name: string, oldSel: string, newSel: string, conf: number, method: any): Promise<void> {
        this.repository.updateLocator(name, {
            selector: newSel,
            lastHealed: new Date().toISOString(),
            confidence: conf
        });
        this.repository.setCachedSelector(name, newSel);
        await this.logger.logHealingEvent({
            locatorName: name,
            oldSelector: oldSel,
            newSelector: newSel,
            confidence: conf,
            method: method,
            success: true
        });
    }
}
