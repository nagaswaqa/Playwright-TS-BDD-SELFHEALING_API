import { Page } from '@playwright/test';
import { IHealingStrategy } from './IHealingStrategy';
import { OcrHealingEngine } from '../OcrHealingEngine';

export class OcrHealingStrategy implements IHealingStrategy {
    readonly name = 'OCR';
    private engine: OcrHealingEngine;

    constructor() {
        this.engine = new OcrHealingEngine();
    }

    async attempt(
        page: Page,
        locatorName: string,
        originalSelector: string,
        metadata?: any
    ): Promise<{ selector: string; confidence: number } | null> {
        try {
            // Priority: metadata.ocrText > metadata.description > locatorName > originalSelector
            const searchText = metadata?.ocrText || metadata?.description || locatorName || originalSelector;
            const result = await this.engine.findElementByText(page, searchText);
            if (result) {
                return { selector: result, confidence: 0.6 };
            }
        } catch (error) {
            console.warn('[OCR Healing] Failed to extract text', error);
        }
        return null;
    }
}
