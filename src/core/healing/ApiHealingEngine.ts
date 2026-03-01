import { AuditLogger } from './AuditLogger';

export interface ApiHealingConfig {
    maxRetries?: number;
    retryDelayMs?: number;
    backoffMultiplier?: number;
    healableStatusCodes?: number[];
}

export interface ApiCallMetrics {
    endpoint: string;
    method: string;
    statusCode: number;
    attemptsNeeded: number;
    healed: boolean;
    confidence: number;
    responseTime: number;
    timestamp: string;
}

/**
 * ApiHealingEngine - Intercepts API calls and auto-retries with exponential backoff.
 * Useful for handling transient failures (5xx, timeouts, network glitches).
 */
export class ApiHealingEngine {
    private metrics: ApiCallMetrics[] = [];
    private defaultConfig: ApiHealingConfig = {
        maxRetries: 3,
        retryDelayMs: 500,
        backoffMultiplier: 2,
        healableStatusCodes: [408, 429, 500, 502, 503, 504] // Transient errors
    };

    constructor(
        private config: ApiHealingConfig = {},
        private logger?: AuditLogger
    ) {
        this.config = { ...this.defaultConfig, ...config };
    }

    /**
     * Wraps an API call with retry & healing logic
     * @param name - Logical name for this API endpoint
     * @param apiFn - Async function that makes the API call
     * @param endpoint - The endpoint URL (for logging)
     * @param method - HTTP method (GET, POST, etc.)
     * @returns Response data if successful, throws if all retries exhausted
     */
    public async callWithHealing<T>(
        name: string,
        apiFn: () => Promise<T>,
        endpoint: string,
        method: string = 'GET'
    ): Promise<T> {
        let lastError: any;
        let attempt = 0;
        const startTime = Date.now();
        let statusCode = 0;

        while (attempt <= (this.config.maxRetries || 3)) {
            try {
                const result = await apiFn();
                const responseTime = Date.now() - startTime;

                // Log successful call
                await this.logMetric({
                    endpoint,
                    method,
                    statusCode: 200,
                    attemptsNeeded: attempt + 1,
                    healed: attempt > 0,
                    confidence: 1.0,
                    responseTime,
                    timestamp: new Date().toISOString()
                });

                if (attempt > 0) {
                    await this.logger?.log(
                        `✓ API healing succeeded for '${name}' after ${attempt} retry(ies)`
                    );
                }

                return result;
            } catch (error: any) {
                lastError = error;
                statusCode = error.status || error.response?.status || 0;
                attempt++;

                const isHealable = this.isHealableError(statusCode, error);
                const shouldRetry = attempt <= (this.config.maxRetries || 3) && isHealable;

                await this.logger?.log(
                    `✗ API call failed for '${name}' (${endpoint} ${method}): ${error.message}. ` +
                    `Status: ${statusCode}. Attempt ${attempt}/${(this.config.maxRetries || 3) + 1}. ` +
                    `${shouldRetry ? 'Retrying...' : 'Exhausted retries.'}`
                );

                if (shouldRetry) {
                    const delayMs = this.calculateBackoff(attempt);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    continue;
                }

                // log final metric
                const responseTime = Date.now() - startTime;
                await this.logMetric({
                    endpoint,
                    method,
                    statusCode,
                    attemptsNeeded: attempt,
                    healed: false,
                    confidence: 0.0,
                    responseTime,
                    timestamp: new Date().toISOString()
                });

                throw lastError;
            }
        }

        throw lastError;
    }

    /**
     * Determines if an error is transient/healable
     */
    private isHealableError(statusCode: number, error: any): boolean {
        if (!statusCode && error.code === 'ECONNRESET') return true;
        if (!statusCode && error.code === 'ETIMEDOUT') return true;
        return (this.config.healableStatusCodes || []).includes(statusCode);
    }

    /**
     * Calculate exponential backoff delay
     */
    private calculateBackoff(attempt: number): number {
        const baseDelay = this.config.retryDelayMs || 500;
        const multiplier = this.config.backoffMultiplier || 2;
        return baseDelay * Math.pow(multiplier, attempt - 1);
    }

    /**
     * Log API call metrics
     */
    private async logMetric(metric: ApiCallMetrics): Promise<void> {
        this.metrics.push(metric);
        await this.logger?.log(
            `[API Metric] ${metric.method} ${metric.endpoint} → ${metric.statusCode} ` +
            `(${metric.responseTime}ms, ${metric.attemptsNeeded} attempt(s), healed: ${metric.healed})`
        );
    }

    /**
     * Retrieve all API call metrics
     */
    public getMetrics(): ApiCallMetrics[] {
        return [...this.metrics];
    }

    /**
     * Clear metrics
     */
    public clearMetrics(): void {
        this.metrics = [];
    }

    /**
     * Stub helper that mimics contacting a remote healing service to get a replacement selector.
     * In a real implementation this would perform an HTTP request to a healing microservice.
     */
    public async fetchReplacement(
        originalSelector: string
    ): Promise<{ selector: string; confidence: number } | null> {
        // placeholder implementation: no external service yet
        await this.logger?.log(`API Healing: no replacement available for '${originalSelector}'`);
        return null;
    }

    /**
     * Get summary statistics
     */
    public getSummary(): {
        totalCalls: number;
        successCount: number;
        failureCount: number;
        healedCount: number;
        avgResponseTime: number;
        avgAttemptsPerCall: number;
    } {
        if (this.metrics.length === 0) {
            return {
                totalCalls: 0,
                successCount: 0,
                failureCount: 0,
                healedCount: 0,
                avgResponseTime: 0,
                avgAttemptsPerCall: 0
            };
        }

        const successCount = this.metrics.filter(m => m.statusCode === 200).length;
        const failureCount = this.metrics.filter(m => m.statusCode !== 200).length;
        const healedCount = this.metrics.filter(m => m.healed).length;
        const avgResponseTime =
            this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length;
        const avgAttemptsPerCall =
            this.metrics.reduce((sum, m) => sum + m.attemptsNeeded, 0) / this.metrics.length;

        return {
            totalCalls: this.metrics.length,
            successCount,
            failureCount,
            healedCount,
            avgResponseTime,
            avgAttemptsPerCall
        };
    }
}
