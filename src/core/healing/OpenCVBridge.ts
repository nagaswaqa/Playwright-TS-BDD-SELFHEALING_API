/**
 * OpenCV Bridge - Provides abstracted access to OpenCV functionality
 * Falls back to Jimp-based pixel comparison if opencv4nodejs is not available.
 *
 * To enable OpenCV:
 *   npm install opencv4nodejs
 * Then set environment variable: OPENCV_ENABLED=true
 *
 * This bridge allows graceful degradation: uses OpenCV if available,
 * falls back to Jimp-based matching otherwise.
 */

let cv: any = null;
let opencvAvailable = false;

/**
 * Initialize OpenCV if available
 */
export function initializeOpenCV(): void {
    try {
        if (process.env.OPENCV_ENABLED === 'true') {
            // Try to import opencv4nodejs
            cv = require('opencv4nodejs');
            opencvAvailable = true;
            console.log('[OpenCV] OpenCV4NodeJS loaded successfully');
        }
    } catch (error) {
        console.warn(
            '[OpenCV] OpenCV4NodeJS not available. ' +
            'Install with: npm install opencv4nodejs, then set OPENCV_ENABLED=true'
        );
        opencvAvailable = false;
    }
}

/**
 * Check if OpenCV is available
 */
export function isOpenCVAvailable(): boolean {
    return opencvAvailable;
}

/**
 * Perform template matching using OpenCV if available, fallback to Jimp
 */
export async function matchTemplate(
    screenshotPath: string,
    templatePath: string
): Promise<{
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
} | null> {
    if (opencvAvailable && cv) {
        return matchTemplateWithOpenCV(screenshotPath, templatePath);
    } else {
        // Fallback: return null, let caller use Jimp-based approach
        return null;
    }
}

/**
 * OpenCV template matching implementation
 */
async function matchTemplateWithOpenCV(
    screenshotPath: string,
    templatePath: string
): Promise<{
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
} | null> {
    try {
        const screenshot = cv.imread(screenshotPath);
        const template = cv.imread(templatePath);

        const result = cv.matchTemplate(screenshot, template, cv.TM_CCOEFF_NORMED);
        const minMaxRes = cv.minMaxLoc(result);

        screenshot.release();
        template.release();
        result.release();

        // Return the best match location
        return {
            confidence: minMaxRes.maxVal,
            x: minMaxRes.maxLoc.x,
            y: minMaxRes.maxLoc.y,
            width: template.cols,
            height: template.rows
        };
    } catch (error) {
        console.error('[OpenCV] Error during template matching:', error);
        return null;
    }
}

// Initialize OpenCV on module load
initializeOpenCV();
