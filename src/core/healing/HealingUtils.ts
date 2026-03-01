import { Page } from '@playwright/test';
import { HealingEngine } from './HealingEngine';
import { ApiHealingEngine } from './ApiHealingEngine';
import { LocatorRepository } from './LocatorRepository';
import { AuditLogger } from './AuditLogger';
import { testConfig } from '../../config/testConfig';
import { IHealingStrategy } from './strategies/IHealingStrategy';

export let globalHealingEngine: HealingEngine | null = null;
export let globalApiHealingEngine: ApiHealingEngine | null = null;

/**
 * Configuration for the healing utilities
 */
export type StrategyName = 'DOM' | 'VISUAL' | 'OCR' | 'API';

export interface HealerConfig {
    resourcesPath?: string;
    auditLogDir?: string;
    enableAudit?: boolean;
    apiHealingConfig?: {
        maxRetries?: number;
        retryDelayMs?: number;
        backoffMultiplier?: number;
    };

    /**
     * Optional ordering of strategies. The engine will instantiate and execute
     * strategies in the order provided. Any names not recognized will be ignored.
     * If omitted, the default order is ['DOM','VISUAL','OCR','API'].
     */
    strategyOrder?: StrategyName[];

    /**
     * List of strategies to enable (subset of default or provided order).
     * Useful when you want to disable a particular layer without re-ordering.
     */
    enabledStrategies?: StrategyName[];

    /**
     * List of strategies to disable; these are removed from final order.
     */
    disabledStrategies?: StrategyName[];

    /**
     * Pre-defined profiles with named strategy lists. Combined with `profile`
     * field to switch between sets of healing behaviours (e.g. 'fast', 'full').
     */
    strategyProfiles?: Record<string, StrategyName[]>;

    /**
     * Name of the profile to apply from strategyProfiles. Overrides strategyOrder.
     */
    profile?: string;
}

/**
 * Initialize the healing framework (call this once per test run)
 */
export async function initializeHealing(config: HealerConfig = {}): Promise<void> {
    const resourcesPath = config.resourcesPath || 'resources';
    const auditLogDir = config.auditLogDir || './healing-logs';
    const enableAudit = config.enableAudit !== false;

    const repo = new LocatorRepository(resourcesPath);
    const logger = new AuditLogger(auditLogDir, enableAudit);

    // create shared API healing engine early so we can inject it into the API strategy
    globalApiHealingEngine = new ApiHealingEngine(config.apiHealingConfig || {}, logger);

    // build default strategies in order, but honor optional config
    const defaultMap: Record<StrategyName, () => IHealingStrategy> = {
        DOM: () => new (require('./strategies/DomHealingStrategy')).DomHealingStrategy(),
        VISUAL: () => new (require('./strategies/VisualHealingStrategy')).VisualHealingStrategy(resourcesPath),
        OCR: () => new (require('./strategies/OcrHealingStrategy')).OcrHealingStrategy(),
        API: () => new (require('./strategies/ApiHealingStrategy')).ApiHealingStrategy(globalApiHealingEngine)
    };

    // determine base order
    let order: StrategyName[] = config.strategyOrder || ['DOM', 'VISUAL', 'OCR', 'API'];

    // apply profile override if specified
    if (config.profile && config.strategyProfiles && config.strategyProfiles[config.profile]) {
        order = config.strategyProfiles[config.profile];
    }

    // filter by enabled/disabled lists
    if (config.enabledStrategies) {
        order = order.filter(s => config.enabledStrategies!.includes(s));
    }
    if (config.disabledStrategies) {
        order = order.filter(s => !config.disabledStrategies!.includes(s));
    }

    const strategies: IHealingStrategy[] = [];
    for (const name of order) {
        if (defaultMap[name]) {
            strategies.push(defaultMap[name]());
        }
    }

    globalHealingEngine = new HealingEngine(repo, logger, resourcesPath, strategies);

    console.log('[HealingUtils] Healing framework initialized');
}

/**
 * Get the global healing engine (auto-initialize if needed)
 */
export async function getHealingEngine(): Promise<HealingEngine> {
    if (!globalHealingEngine) {
        await initializeHealing();
    }
    return globalHealingEngine!;
}

/**
 * Get the global API healing engine (auto-initialize if needed)
 */
export async function getApiHealingEngine(): Promise<ApiHealingEngine> {
    if (!globalApiHealingEngine) {
        await initializeHealing();
    }
    return globalApiHealingEngine!;
}

/**
 * Wait for an element with healing retry logic
 */
export async function waitForHealing(
    page: Page,
    locatorName: string,
    selector: string,
    timeoutMs: number = 10000
): Promise<void> {
    const engine = await getHealingEngine();
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        try {
            const locator = page.locator(selector);
            await locator.waitFor({ state: 'attached', timeout: 2000 });
            return;
        } catch {
            const healed = await engine.heal(page, locatorName, selector);
            if (healed) {
                selector = healed;
                continue;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    throw new Error(`[waitForHealing] Timeout waiting for '${locatorName}'`);
}

/**
 * Retry a function with healing-aware backoff
 */
export async function retryWithHealing<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 500
): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxAttempts - 1) {
                const delay = delayMs * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Get healing statistics (convenience wrapper)
 */
export async function getHealingStats() {
    const engine = await getHealingEngine();
    // Note: HealingEngine doesn't track stats yet, but could be extended
    const apiEngine = await getApiHealingEngine();
    return {
        api: apiEngine.getSummary()
    };
}

/**
 * Reset healing state (clear caches, etc.)
 */
export async function resetHealing(): Promise<void> {
    globalHealingEngine = null;
    globalApiHealingEngine = null;
    console.log('[HealingUtils] Healing framework reset');
}

/**
 * Export healing config getter
 */
export function getHealerConfig(): Partial<HealerConfig> {
    return {
        enableAudit: testConfig.enableHealingAudit
    };
}

/**
 * Generate a healing report and export it
 */
export async function generateHealingReport(outputDir: string = './reports'): Promise<void> {
    const { HealingReporter } = await import('./HealingReporter');

    const logFilePath = './healing-logs/healing-audit.log';
    const reporter = new HealingReporter(logFilePath);

    // Generate both JSON and HTML reports
    reporter.exportAsJson(`${outputDir}/healing-report.json`);
    reporter.exportAsHtml(`${outputDir}/healing-report.html`);

    console.log(`[HealingUtils] Reports generated in ${outputDir}`);
}
