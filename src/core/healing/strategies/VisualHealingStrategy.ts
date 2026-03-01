import { Page } from '@playwright/test';
import { IHealingStrategy } from './IHealingStrategy';
import { VisualHealingEngine } from '../VisualHealingEngine';

export class VisualHealingStrategy implements IHealingStrategy {
    readonly name = 'VISUAL';
    private engine: VisualHealingEngine;

    constructor(resourcesPath: string = 'resources') {
        this.engine = new VisualHealingEngine(resourcesPath);
    }

    async attempt(
        page: Page,
        locatorName: string,
        originalSelector: string,
        metadata?: any
    ): Promise<{ selector: string; confidence: number } | null> {
        try {
            const result = await this.engine.findElementByTemplate(page, locatorName);
            if (result) {
                const { locator, confidence } = result;
                return { selector: locator, confidence };
            }
        } catch (error) {
            console.warn('[Visual Healing] Unexpected error', error);
        }
        return null;
    }
}
