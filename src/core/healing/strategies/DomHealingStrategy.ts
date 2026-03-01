import { Page } from '@playwright/test';
import { IHealingStrategy } from './IHealingStrategy';

export class DomHealingStrategy implements IHealingStrategy {
    readonly name = 'DOM';

    async attempt(
        page: Page,
        locatorName: string,
        originalSelector: string,
        metadata?: any
    ): Promise<{ selector: string; confidence: number } | null> {
        // Copied from previous performDomHealing logic
        try {
            // Strategy 1: Try to locate by ID if the selector contains an ID
            const idMatch = originalSelector.match(/#([\w-]+)/);
            if (idMatch) {
                const id = idMatch[1];
                try {
                    await page.waitForSelector(`#${id}`, { state: 'attached', timeout: 1000 });
                    return { selector: `#${id}`, confidence: 0.95 };
                } catch { }
            }

            // Strategy 2: class names
            const classMatches = originalSelector.match(/\.([\w-]+)/g);
            if (classMatches && classMatches.length > 0) {
                const classSelector = classMatches.join('');
                try {
                    await page.waitForSelector(classSelector, { state: 'attached', timeout: 1000 });
                    return { selector: classSelector, confidence: 0.85 };
                } catch { }
            }

            // Strategy 3: text content
            const textMatch = originalSelector.match(/text[\s]*=[\s]*["']([^"']+)["']/i);
            if (textMatch) {
                const text = textMatch[1];
                try {
                    const locator = page.locator(`text="${text}"`).first();
                    const count = await locator.count();
                    if (count > 0) {
                        return { selector: `text="${text}"`, confidence: 0.80 };
                    }
                } catch { }
            }

            // Strategy 4: tag + attributes
            const tagMatch = originalSelector.match(/^([a-z]+)/i);
            if (tagMatch) {
                const tag = tagMatch[1];
                const attrMatches = originalSelector.match(/\[([^\]=]+)\s*=\s*["']([^"']*)["']\]/g);
                if (attrMatches && attrMatches.length > 0) {
                    for (const attrMatch of attrMatches) {
                        const cleanAttr = attrMatch.replace(/[\[\]"']/g, '');
                        const [attr, value] = cleanAttr.split('=');
                        const newSelector = `${tag}[${attr}="${value.trim()}"]`;
                        try {
                            await page.waitForSelector(newSelector, { state: 'attached', timeout: 1000 });
                            return { selector: newSelector, confidence: 0.75 };
                        } catch { }
                    }
                }
            }

            // Strategy 5: XPath fallback
            const xpathHealed = await this.performXPathHeal(page, originalSelector);
            if (xpathHealed) {
                return xpathHealed;
            }

            return null;
        } catch (error) {
            console.warn('[DOM Healing] Error during DOM healing:', error);
            return null;
        }
    }

    private async performXPathHeal(
        page: Page,
        originalSelector: string
    ): Promise<{ selector: string; confidence: number } | null> {
        try {
            const result = await page.evaluate((sel: string) => {
                try {
                    const xpath = sel.startsWith('/') ? sel : `//body//${sel}`;
                    const result = document.evaluate(
                        xpath,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    );
                    const element = result.singleNodeValue as HTMLElement;

                    if (element) {
                        if (element.id) {
                            return { selector: `#${element.id}`, confidence: 0.9 };
                        }
                        if (element.className) {
                            const classes = (element.className as string).split(' ').filter(Boolean);
                            if (classes.length > 0) {
                                return { selector: `.${classes.join('.')}`, confidence: 0.75 };
                            }
                        }
                        const role = element.getAttribute('role');
                        const type = element.getAttribute('type');
                        if (role) {
                            return { selector: `[role="${role}"]`, confidence: 0.70 };
                        }
                        if (type) {
                            return {
                                selector: `${element.tagName.toLowerCase()}[type="${type}"]`,
                                confidence: 0.70
                            };
                        }
                    }
                } catch { }
                return null;
            }, originalSelector);

            return result as { selector: string; confidence: number } | null;
        } catch (error) {
            console.warn('[DOM Healing] XPath healing failed:', error);
            return null;
        }
    }
}
