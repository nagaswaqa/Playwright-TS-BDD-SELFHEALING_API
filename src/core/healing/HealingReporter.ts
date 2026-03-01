import fs from 'fs';
import path from 'path';
import { HealingEvent } from './AuditLogger';

export interface HealingStats {
    totalAttempts: number;
    successfulHeals: number;
    failedHeals: number;
    successRate: number;
    byMethod: {
        [key: string]: {
            attempts: number;
            successes: number;
            successRate: number;
        };
    };
    topLocators: Array<{
        locatorName: string;
        attempts: number;
        successRate: number;
    }>;
    averageConfidenceScore: number;
    timeRange: {
        start: string;
        end: string;
    };
}

/**
 * HealingReporter - Generates JSON and HTML reports from healing audit logs
 */
export class HealingReporter {
    constructor(private logFilePath: string) {}

    /**
     * Parse audit log file and extract healing events
     */
    private parseLogFile(): HealingEvent[] {
        if (!fs.existsSync(this.logFilePath)) {
            return [];
        }

        try {
            const contents = fs.readFileSync(this.logFilePath, 'utf8');
            const lines = contents.split('\n').filter(line => line.trim() !== '');
            return lines.map(line => JSON.parse(line));
        } catch (error) {
            console.error('[HealingReporter] Failed to parse log file:', error);
            return [];
        }
    }

    /**
     * Generate healing statistics from events
     */
    public generateStats(): HealingStats {
        const events = this.parseLogFile();

        if (events.length === 0) {
            return {
                totalAttempts: 0,
                successfulHeals: 0,
                failedHeals: 0,
                successRate: 0,
                byMethod: {},
                topLocators: [],
                averageConfidenceScore: 0,
                timeRange: { start: 'N/A', end: 'N/A' }
            };
        }

        const successfulHeals = events.filter(e => e.success).length;
        const failedHeals = events.length - successfulHeals;
        const successRate = (successfulHeals / events.length) * 100;

        // Stats by method
        const byMethod: { [key: string]: { attempts: number; successes: number; successRate: number } } =
            {};
        events.forEach(e => {
            if (!byMethod[e.method]) {
                byMethod[e.method] = { attempts: 0, successes: 0, successRate: 0 };
            }
            byMethod[e.method].attempts++;
            if (e.success) {
                byMethod[e.method].successes++;
            }
        });
        Object.keys(byMethod).forEach(method => {
            byMethod[method].successRate = (byMethod[method].successes / byMethod[method].attempts) * 100;
        });

        // Top locators
        const locatorMap: { [key: string]: { attempts: number; successes: number } } = {};
        events.forEach(e => {
            if (!locatorMap[e.locatorName]) {
                locatorMap[e.locatorName] = { attempts: 0, successes: 0 };
            }
            locatorMap[e.locatorName].attempts++;
            if (e.success) {
                locatorMap[e.locatorName].successes++;
            }
        });
        const topLocators = Object.entries(locatorMap)
            .map(([name, stats]) => ({
                locatorName: name,
                attempts: stats.attempts,
                successRate: (stats.successes / stats.attempts) * 100
            }))
            .sort((a, b) => b.attempts - a.attempts)
            .slice(0, 10);

        // Average confidence
        const avgConfidence =
            events.reduce((sum, e) => sum + e.confidence, 0) / events.length;

        // Time range
        const timestamps = events.map(e => new Date(e.timestamp).getTime());
        const timeRange = {
            start: new Date(Math.min(...timestamps)).toISOString(),
            end: new Date(Math.max(...timestamps)).toISOString()
        };

        return {
            totalAttempts: events.length,
            successfulHeals,
            failedHeals,
            successRate,
            byMethod,
            topLocators,
            averageConfidenceScore: avgConfidence,
            timeRange
        };
    }

    /**
     * Export statistics as JSON
     */
    public exportAsJson(outputPath: string): void {
        const stats = this.generateStats();
        const dir = path.dirname(outputPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2), 'utf8');
        console.log(`[HealingReporter] JSON report saved to ${outputPath}`);
    }

    /**
     * Export statistics as HTML
     */
    public exportAsHtml(outputPath: string): void {
        const stats = this.generateStats();
        const dir = path.dirname(outputPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const html = this.generateHtmlReport(stats);
        fs.writeFileSync(outputPath, html, 'utf8');
        console.log(`[HealingReporter] HTML report saved to ${outputPath}`);
    }

    /**
     * Generate HTML markup for the report
     */
    private generateHtmlReport(stats: HealingStats): string {
        const methodRows = Object.entries(stats.byMethod)
            .map(
                ([method, data]) => `
            <tr>
                <td>${method}</td>
                <td>${data.attempts}</td>
                <td>${data.successes}</td>
                <td>${data.successRate.toFixed(2)}%</td>
            </tr>
        `
            )
            .join('');

        const locatorRows = stats.topLocators
            .map(
                locator => `
            <tr>
                <td>${locator.locatorName}</td>
                <td>${locator.attempts}</td>
                <td>${locator.successRate.toFixed(2)}%</td>
            </tr>
        `
            )
            .join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Self-Healing Framework Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
        }
        h2 {
            color: #555;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-card.success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        .stat-card.failure {
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .time-range {
            background: #e7f3ff;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Self-Healing Framework Report</h1>
        
        <div class="time-range">
            <strong>Time Range:</strong> ${stats.timeRange.start} → ${stats.timeRange.end}
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.totalAttempts}</div>
                <div class="stat-label">Total Attempts</div>
            </div>
            <div class="stat-card success">
                <div class="stat-value">${stats.successfulHeals}</div>
                <div class="stat-label">Successful Heals</div>
            </div>
            <div class="stat-card failure">
                <div class="stat-value">${stats.failedHeals}</div>
                <div class="stat-label">Failed Heals</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.successRate.toFixed(1)}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.averageConfidenceScore.toFixed(2)}</div>
                <div class="stat-label">Avg Confidence</div>
            </div>
        </div>

        <h2>Healing by Method</h2>
        <table>
            <thead>
                <tr>
                    <th>Method</th>
                    <th>Attempts</th>
                    <th>Successes</th>
                    <th>Success Rate</th>
                </tr>
            </thead>
            <tbody>
                ${methodRows}
            </tbody>
        </table>

        <h2>Top 10 Locators</h2>
        <table>
            <thead>
                <tr>
                    <th>Locator Name</th>
                    <th>Attempts</th>
                    <th>Success Rate</th>
                </tr>
            </thead>
            <tbody>
                ${locatorRows || '<tr><td colspan="3" style="text-align: center; color: #999;">No data available</td></tr>'}
            </tbody>
        </table>

        <div class="footer">
            Generated: ${new Date().toISOString()}
        </div>
    </div>
</body>
</html>
        `;
    }
}
