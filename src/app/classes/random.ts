export class Random {
    private seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }

    nextInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}
