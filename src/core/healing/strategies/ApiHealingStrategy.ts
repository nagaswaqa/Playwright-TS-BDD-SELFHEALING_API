import { Page } from '@playwright/test';
import { IHealingStrategy } from './IHealingStrategy';
import { ApiHealingEngine } from '../ApiHealingEngine';

export class ApiHealingStrategy implements IHealingStrategy {
    readonly name = 'API';
    private engine: ApiHealingEngine;

    constructor(engine?: ApiHealingEngine) {
        // allow injection of the shared engine from HealingUtils
        this.engine = engine || new ApiHealingEngine();
    }

    async attempt(
        page: Page,
        locatorName: string,
        originalSelector: string,
        metadata?: any
    ): Promise<{ selector: string; confidence: number } | null> {
        try {
            const healed = await this.engine.fetchReplacement(originalSelector);
            if (healed && healed.selector) {
                return { selector: healed.selector, confidence: healed.confidence || 0.5 };
            }
        } catch (error) {
            console.warn('[API Healing] Error contacting healing service', error);
        }
        return null;
    }
}
