import { Page } from '@playwright/test';
import { createWorker } from 'tesseract.js';
import fs from 'fs';

export class OcrHealingEngine {
    constructor() { }

    /**
     * Finds an element on the page using OCR text recognition.
     * Takes a screenshot, performs OCR, and then queries the DOM for elements matching the recognized text.
     */
    public async findElementByText(page: Page, expectedText: string): Promise<string | null> {
        const screenshotPath = `ocr-screenshot-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath });

        const worker = await createWorker('eng');
        try {
            console.log(`[OCR Healing] Searching for text: "${expectedText}"`);
            const { data: { text, confidence } } = await worker.recognize(screenshotPath);
            console.log(`[OCR Healing] Recognized text count: ${text.length} characters (Confidence: ${confidence})`);

            // If OCR text contains our target and has reasonable confidence
            if (text.toLowerCase().includes(expectedText.toLowerCase()) && confidence >= 30) {
                console.log(`[OCR Healing] Text match found in OCR result. Querying DOM for candidates...`);

                // CRITICAL: We search for the text but filter out <code> or <pre> tags or hidden elements
                // This prevents matching the technical explanation text on the page.
                const candidates = await page.locator(`text=/^${expectedText}$/i`).all();

                for (const candidate of candidates) {
                    const tagName = await candidate.evaluate(el => el.tagName.toLowerCase());
                    const isVisible = await candidate.isVisible();

                    // Skip technical code snippets and hidden elements
                    if (tagName === 'code' || tagName === 'pre') continue;
                    if (!isVisible) continue;

                    // If it's a button or has a role/class suggesting it's interactive, prioritize it
                    const id = await candidate.getAttribute('id');
                    if (id) {
                        console.log(`[OCR Healing] Found valid candidate with ID: #${id}`);
                        return `#${id}`;
                    }

                    const cls = await candidate.getAttribute('class');
                    if (cls) {
                        const classSelector = cls.split(' ').filter(Boolean).map(c => `.${c}`).join('');
                        console.log(`[OCR Healing] Found valid candidate with class: ${classSelector}`);
                        return classSelector;
                    }

                    return `text="${expectedText}"`;
                }
            }

            // Fallback to fuzzy text selector if DOM query didn't yield a better one
            return `text=${expectedText}`;

        } catch (error) {
            console.error(`[OCR Healing] OCR healing failed: ${error}`);
            return null;
        } finally {
            await worker.terminate();
            if (fs.existsSync(screenshotPath)) {
                fs.unlinkSync(screenshotPath);
            }
        }
    }
}
