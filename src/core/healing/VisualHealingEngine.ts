import { Page } from '@playwright/test';
import { VisualHealingResult } from './VisualHealingResult';
import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';
import { matchTemplate, isOpenCVAvailable } from './OpenCVBridge';

// Note: In a real implementation, we would use opencv-wasm. 
// For this scaffold, we'll implement a Jimp-based visual check as a placeholder 
// that mimics the OpenCV template matching logic.

export interface VisualMatchCache {
    [templateName: string]: {
        x: number;
        y: number;
        width: number;
        height: number;
        confidence: number;
        timestamp: string;
    };
}

export class VisualHealingEngine {
    private templatesPath: string;
    private cachePath: string;
    private cache: VisualMatchCache = {};

    constructor(resourcesPath: string) {
        this.templatesPath = path.resolve(resourcesPath, 'templates');
        this.cachePath = path.resolve(resourcesPath, 'visual-cache.json');
        if (!fs.existsSync(this.templatesPath)) {
            fs.mkdirSync(this.templatesPath, { recursive: true });
        }
        this.loadCache();
    }

    private loadCache(): void {
        try {
            if (fs.existsSync(this.cachePath)) {
                const data = fs.readFileSync(this.cachePath, 'utf8');
                this.cache = JSON.parse(data);
                console.log(`[Visual Cache] Loaded ${Object.keys(this.cache).length} cached templates`);
            }
        } catch (error) {
            console.warn('[Visual Cache] Failed to load cache:', error);
            this.cache = {};
        }
    }

    private saveCache(): void {
        try {
            const dir = path.dirname(this.cachePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.cachePath, JSON.stringify(this.cache, null, 2), 'utf8');
        } catch (error) {
            console.warn('[Visual Cache] Failed to save cache:', error);
        }
    }

    public async findElementByTemplate(page: Page, templateName: string): Promise<VisualHealingResult | null> {
        // Check cache first
        if (this.cache[templateName]) {
            const cached = this.cache[templateName];
            console.log(`[Visual Cache] Hit for '${templateName}' (confidence: ${cached.confidence})`);
            return new VisualHealingResult(
                `xpath=//body`, // placeholder
                cached.confidence,
                cached.x,
                cached.y,
                cached.width,
                cached.height
            );
        }

        const templateFile = path.resolve(this.templatesPath, `${templateName}.png`);
        if (!fs.existsSync(templateFile)) {
            console.error(`Template ${templateName} not found at ${templateFile}`);
            return null;
        }

        const screenshotPath = `healing-screenshot-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath });

        try {
            console.log(`[Visual Healing] Searching for template: ${templateName}`);
            let matchResult = null;

            // Try OpenCV first if available
            if (isOpenCVAvailable()) {
                console.log(`[Visual Healing] Using OpenCV for template matching`);
                matchResult = await matchTemplate(screenshotPath, templateFile);
            }

            // If OpenCV unavailable or failed, use Jimp fallback
            if (!matchResult) {
                console.log(`[Visual Healing] Using Jimp fallback for template matching`);
                matchResult = await this.matchTemplateWithJimp(screenshotPath, templateFile);
            }

            if (!matchResult) {
                return null;
            }

            const { confidence, x, y, width, height } = matchResult;
            console.log(`[Visual Healing] best match score: ${confidence}`);

            if (confidence >= 0.6) {
                // Cache successful match
                this.cache[templateName] = {
                    x,
                    y,
                    width,
                    height,
                    confidence: confidence,
                    timestamp: new Date().toISOString()
                };
                this.saveCache();
                console.log(`[Visual Cache] Cached match for '${templateName}'`);

                // return a basic xpath using coordinates (page.evaluate later can convert when needed)
                const selector = `xpath=//body/*[position()]`; // placeholder - consumer may ignore
                return new VisualHealingResult(
                    selector,
                    confidence,
                    x,
                    y,
                    width,
                    height
                );
            }

            return null;
        } catch (error: any) {
            console.error(`Visual healing failed: ${error}`);
            return null;
        } finally {
            if (fs.existsSync(screenshotPath)) {
                fs.unlinkSync(screenshotPath);
            }
        }
    }

    /**
     * Clear the visual match cache
     */
    public clearCache(): void {
        this.cache = {};
        if (fs.existsSync(this.cachePath)) {
            fs.unlinkSync(this.cachePath);
        }
        console.log('[Visual Cache] Cache cleared');
    }

    /**
     * Get cache statistics
     */
    public getCacheStats(): { size: number; entries: string[] } {
        return {
            size: Object.keys(this.cache).length,
            entries: Object.keys(this.cache)
        };
    }

    /**
     * Jimp-based template matching fallback
     */
    private async matchTemplateWithJimp(
        screenshotPath: string,
        templatePath: string
    ): Promise<{
        confidence: number;
        x: number;
        y: number;
        width: number;
        height: number;
    } | null> {
        const screenshot = await Jimp.read(screenshotPath);
        const template = await Jimp.read(templatePath);

        // sliding-window search: find the region that best matches template
        let bestScore = 0;
        let bestCoords = { x: 0, y: 0 };

        const sW = screenshot.bitmap.width;
        const sH = screenshot.bitmap.height;
        const tW = template.bitmap.width;
        const tH = template.bitmap.height;

        // loop over possible positions (step by 10 pixels for speed)
        for (let y = 0; y <= sH - tH; y += 10) {
            for (let x = 0; x <= sW - tW; x += 10) {
                let diff = 0;
                for (let ty = 0; ty < tH; ty += 5) {
                    for (let tx = 0; tx < tW; tx += 5) {
                        const sIdx = screenshot.getPixelIndex(x + tx, y + ty);
                        const tIdx = template.getPixelIndex(tx, ty);
                        const sr = screenshot.bitmap.data[sIdx + 0];
                        const sg = screenshot.bitmap.data[sIdx + 1];
                        const sb = screenshot.bitmap.data[sIdx + 2];
                        const tr = template.bitmap.data[tIdx + 0];
                        const tg = template.bitmap.data[tIdx + 1];
                        const tb = template.bitmap.data[tIdx + 2];
                        diff += Math.abs(sr - tr) + Math.abs(sg - tg) + Math.abs(sb - tb);
                    }
                }
                const score = 1 - diff / (tW * tH * 765); // normalize
                if (score > bestScore) {
                    bestScore = score;
                    bestCoords = { x, y };
                }
            }
        }

        return {
            confidence: bestScore,
            x: bestCoords.x,
            y: bestCoords.y,
            width: tW,
            height: tH
        };
    }
}
