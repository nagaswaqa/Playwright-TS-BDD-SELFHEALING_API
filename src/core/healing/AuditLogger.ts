import fs from 'fs';
import path from 'path';

export interface HealingEvent {
    timestamp: string;
    locatorName: string;
    oldSelector: string;
    newSelector: string;
    confidence: number;
    // method may represent any healing layer or action; kept as string for extensibility
    method: string;
    success: boolean;
}

export class AuditLogger {
    private logPath: string;
    private enabled: boolean;

    constructor(logDirectory: string, enabled: boolean = process.env.HEALING_AUDIT !== 'false') {
        this.enabled = enabled;
        this.logPath = path.resolve(logDirectory, 'healing-audit.log');
        if (this.enabled) {
            this.ensureDirectory();
        }
    }

    private async ensureDirectory(): Promise<void> {
        const dir = path.dirname(this.logPath);
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }
    }

    /**
     * Appends a healing event to the log file (async).
     * Logging is skipped entirely if the logger is disabled via configuration.
     */
    public async logHealingEvent(event: Omit<HealingEvent, 'timestamp'>): Promise<void> {
        if (!this.enabled) {
            return;
        }

        const fullEvent: HealingEvent = {
            ...event,
            timestamp: new Date().toISOString()
        };

        const logEntry = JSON.stringify(fullEvent) + '\n';
        await fs.promises.appendFile(this.logPath, logEntry, 'utf8');
        console.log(`[Healing Audit] ${fullEvent.method} healing for '${fullEvent.locatorName}': ${fullEvent.success ? 'SUCCESS' : 'FAILURE'} (Confidence: ${fullEvent.confidence})`);
    }

    /**
     * Generic informational log that writes a timestamped message to file and console.
     * This is primarily used by the base page to record selector attempts and outcomes.
     */
    public async log(message: string): Promise<void> {
        if (!this.enabled) {
            return;
        }

        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${message}\n`;
        await fs.promises.appendFile(this.logPath, entry, 'utf8');
        console.log(message);
    }

    public async getLogs(): Promise<HealingEvent[]> {
        if (!this.enabled || !fs.existsSync(this.logPath)) return [];
        const contents = await fs.promises.readFile(this.logPath, 'utf8');
        const lines = contents.split('\n').filter(line => line.trim() !== '');
        return lines.map(line => JSON.parse(line));
    }

    /**
     * Remove the current log file. Use for tests or when you want to reset auditing.
     */
    public async clearLogs(): Promise<void> {
        if (fs.existsSync(this.logPath)) {
            await fs.promises.unlink(this.logPath);
        }
    }
}
