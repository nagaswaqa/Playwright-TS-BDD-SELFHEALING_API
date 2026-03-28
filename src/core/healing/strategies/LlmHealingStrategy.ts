import { Page } from '@playwright/test';
import { IHealingStrategy } from './IHealingStrategy';

/**
 * LlmHealingStrategy — 5th and final healing layer.
 *
 * When all deterministic strategies (DOM, Visual, OCR, API) have failed,
 * this strategy captures a screenshot + DOM snippet and asks OpenAI GPT-4o
 * to reason about the page and suggest a valid CSS selector.
 *
 * Requires:
 *   - HEALING_API_URL  (optional, defaults to localhost)
 *   - OPENAI_API_KEY   set in the self-healing-api server's environment
 */
export class LlmHealingStrategy implements IHealingStrategy {
    readonly name = 'LLM';

    // Truncate DOM to keep the prompt within token limits
    private readonly DOM_MAX_CHARS = 8000;

    async attempt(
        page: Page,
        locatorName: string,
        originalSelector: string,
        metadata?: any
    ): Promise<{ selector: string; confidence: number } | null> {
        try {
            console.log(`[LLM Healing] Activating GPT-4o vision healing for '${locatorName}'...`);

            // 1. Capture screenshot as base64
            const screenshotBuffer = await page.screenshot({ fullPage: false });
            const base64Image = screenshotBuffer.toString('base64');

            // 2. Capture a trimmed DOM snapshot
            const fullHtml = await page.content();
            const domSnippet = fullHtml.slice(0, this.DOM_MAX_CHARS);

            // 3. Call the LLM endpoint on the self-healing-api
            const baseUrl = (process.env.HEALING_API_URL || 'https://self-healing-api-rxvd.onrender.com/heal')
                .replace(/\/heal$/, '');   // strip trailing /heal to build /heal/llm

            const response = await fetch(`${baseUrl}/heal/llm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locatorName,
                    originalSelector,
                    base64Image,
                    domSnippet
                }),
                // LLM calls can be slow — allow up to 30 s
                signal: AbortSignal.timeout(30_000)
            });

            if (!response.ok) {
                console.warn(`[LLM Healing] API returned ${response.status}`);
                return null;
            }

            const data = await response.json() as { selector?: string; confidence?: number };

            if (data?.selector) {
                // Verify the LLM's suggestion actually works on the live page
                try {
                    await page.waitForSelector(data.selector, { state: 'attached', timeout: 2000 });
                    console.log(`[LLM Healing] ✅ Healed! New selector: ${data.selector} (confidence: ${data.confidence})`);
                    return {
                        selector: data.selector,
                        confidence: data.confidence ?? 0.7
                    };
                } catch {
                    console.warn(`[LLM Healing] LLM selector '${data.selector}' failed live verification.`);
                    return null;
                }
            }

            return null;
        } catch (error: any) {
            if (error?.name === 'TimeoutError') {
                console.warn('[LLM Healing] Request timed out (30s). Skipping LLM strategy.');
            } else {
                console.warn('[LLM Healing] Error:', error);
            }
            return null;
        }
    }
}
