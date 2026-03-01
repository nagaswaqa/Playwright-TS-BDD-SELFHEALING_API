import fs from 'fs';
import path from 'path';

export interface LocatorData {
    name: string;
    selector: string;
    description?: string;
    lastHealed?: string;
    confidence?: number;
}

export class LocatorRepository {
    private locatorsPath: string;
    private cachePath: string;
    private locators: Record<string, LocatorData> = {};
    private cachedLocators: Record<string, string> = {};

    constructor(resourcesPath: string) {
        this.locatorsPath = path.resolve(resourcesPath, 'locators.json');
        this.cachePath = path.resolve(resourcesPath, 'healing-cache.json');
        this.loadLocators();
        this.loadCache();
    }

    private loadLocators(): void {
        if (fs.existsSync(this.locatorsPath)) {
            const data = fs.readFileSync(this.locatorsPath, 'utf8');
            this.locators = JSON.parse(data);
        } else {
            console.warn(`Locator file not found at ${this.locatorsPath}. Initializing empty repository.`);
            this.locators = {};
            this.saveLocators();
        }
    }

    private loadCache(): void {
        if (fs.existsSync(this.cachePath)) {
            const data = fs.readFileSync(this.cachePath, 'utf8');
            this.cachedLocators = JSON.parse(data);
        } else {
            this.cachedLocators = {};
        }
    }

    public getLocator(name: string): LocatorData | undefined {
        return this.locators[name];
    }

    public updateLocator(name: string, data: Partial<LocatorData>): void {
        if (this.locators[name]) {
            this.locators[name] = { ...this.locators[name], ...data };
            this.saveLocators();
        } else {
            console.error(`Locator '${name}' not found. Cannot update.`);
        }
    }

    public addLocator(name: string, selector: string, description?: string): void {
        this.locators[name] = { name, selector, description };
        this.saveLocators();
    }

    private saveLocators(): void {
        const dir = path.dirname(this.locatorsPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.locatorsPath, JSON.stringify(this.locators, null, 4), 'utf8');
    }

    public getCachedSelector(name: string): string | null {
        return this.cachedLocators[name] || null;
    }

    public setCachedSelector(name: string, selector: string): void {
        this.cachedLocators[name] = selector;
        this.saveCache();
    }

    private saveCache(): void {
        const dir = path.dirname(this.cachePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.cachePath, JSON.stringify(this.cachedLocators, null, 4), 'utf8');
    }

    public getAllLocators(): Record<string, LocatorData> {
        return { ...this.locators };
    }
}
