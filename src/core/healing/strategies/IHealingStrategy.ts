import { Page } from '@playwright/test';

/**
 * Strategy interface for individual healing layers.
 * Each implementation attempts to recover a selector and returns
 * either a selector string with confidence or null.
 */
export interface IHealingStrategy {
    /**
     * Human-readable name of the strategy (DOM, VISUAL, OCR, etc).
     */
    readonly name: string;

    /**
     * Attempt to heal the selector. Returns a selector and confidence
     * or null if the strategy cannot produce a result.
     */
    attempt(
        page: Page,
        locatorName: string,
        originalSelector: string,
        metadata?: any
    ): Promise<{ selector: string; confidence: number } | null>;
}
