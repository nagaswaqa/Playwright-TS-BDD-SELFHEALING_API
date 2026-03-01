export class VisualHealingResult {
    constructor(
        public readonly locator: string,
        public readonly confidence: number,
        public readonly x?: number,
        public readonly y?: number,
        public readonly width?: number,
        public readonly height?: number
    ) { }

    public isConfident(threshold: number): boolean {
        return this.confidence >= threshold;
    }
}
