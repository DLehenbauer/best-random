import { strict as assert } from "assert";
import { rot } from "../utils";

export type MixFn = (x: number, y: number, z: number, w: number, s: number) => number;

export class Rng {
    public x = 0;
    public y = 0;
    public z = 0;
    public w = 0;
    public s = 0;

    public saved = { 
        x: 0x4c24820d,
        y: 0x84930822,
        z: 0xc1290042,
        w: 0x09008200,
        s: 0,
    };

    public next(): { x: number, y: number, z: number, w: number, s: number } {
        let t = this.x;
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;

        this.s = (this.s + S) | 0;

        t ^= t << 15;
        t ^= t >>> 18;
        t ^= this.w << 11;

        this.w = t;

        return this;
    }

    public save() {
        this.saved = { 
            x: this.x,
            y: this.y,
            z: this.z,
            w: this.w,
            s: this.s,
        }
    }

    public restore() {
        const { x, y, z, w, s } = this.saved;
        
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.s = s;
    }
}

const rng = new Rng();
let numSamples = 0;

const bytes = [
    [...new Array(256)].fill(0),
    [...new Array(256)].fill(0),
    [...new Array(256)].fill(0),
    [...new Array(256)].fill(0)
];

export function score(fn: (x: number, y: number, z: number, w: number, s: number) => number) {
    rng.restore();

    // Clear before each iteration.
    for (let i = 0; i < bytes.length; i++) {
        bytes[i].fill(0);
    }

    for (let i = 0; i < numSamples; i++) {
        const { x, y, z, w, s } = rng.next();
        const v = fn(x, y, z, w, s);
        bytes[0][v >>> 24]++;
        bytes[1][(v << 8) >>> 24]++;
        bytes[2][(v << 16) >>> 24]++;
        bytes[3][(v << 24) >>> 24]++;
    }

    let d2 = 0;
    
    for (let i = 0; i < bytes.length; i++) {
        const bucket = bytes[i];
        const r = (bucket.length - 1);              // largest bucket = upper bound for random range
        const e = numSamples / r;                   // expected # of occurrences per bucket
        
        let x2 = 0;
        for (const o of bucket) {
            x2 += ((o - e) * (o - e));
        }
        x2 /= e;

        const d = Math.abs(x2 - r);
        d2 += d * d;
    }

    return d2;
}

let M = 0;
let S = 0;
let C1 = 0;
let C2 = 0;

assert(M || S || C1 || C2 || true);

export const setConstants = ({ M: m, S: s, C1: c1, C2: c2 }: { M: number, S: number, C1: number, C2: number }) => {
    M = m;
    S = s;
    C1 = c1;
    C2 = c2;
}

export const mix = (a: number, b: number, c: number) => {
    a = rot(a, C1);
    a += Math.imul(b, M);
    return rot(a, c) >>> 0;
}

interface IEntry<T> {
    index: number,
    avg: number,
    min: number,
    max: number,
    permutation: T,
    score: number
};

export function run<T>(
    sampleCount: number,
    permutations: T[],
    scorePermutation: (permutation: T) => number,
    permutationToString: (permutation: T) => string
) {
    numSamples = sampleCount;

    const permutationsAsStrings = permutations.map(value => permutationToString(value));

    const format = (entry: IEntry<T>) => ({ 
        ...entry,
        avg: Number(entry.avg.toFixed(2)),
        permutation: permutationsAsStrings[entry.index],
        score: Number(entry.score.toFixed(2))
    });

    console.log(`\nBegin: ${permutations.length} permutations, ${numSamples} samples per cycle.\n`);

    const mScores = new Array(permutations.length).fill(0);
    const mMax = new Array(permutations.length).fill(0);
    const mMin = new Array(permutations.length).fill(0x7FFFFFFF);
    const mPos = new Array(permutations.length).fill(0);

    const start = Date.now();

    for (let numCycles = 1; ; numCycles++) {
        for (let pi = 0; pi < permutations.length; pi++) {
            mScores[pi] += scorePermutation(permutations[pi]);
        }

        rng.save()
        console.log(`\nCycle: ${numCycles} - Elapsed: ${((Date.now() - start) / 1000).toFixed(1)}s, permutations: ${permutations.length}, ${numSamples} samples per cycle ${JSON.stringify(rng.saved)}\n`);

        const entries: IEntry<T>[] = permutations
            .map((permutation, index) => ({ index, avg: 0, min: 0, max: 0, permutation, score: mScores[index] }))
            .sort((left, right) => left.score - right.score);

        for (let j = 0; j < entries.length; j++) {
            const e = entries[j];

            let i = e.index;

            j++;
            e.avg = (mPos[i] += j) / numCycles;
            e.max = mMax[i] = Math.max(mMax[i], j);
            e.min = mMin[i] = Math.min(mMin[i], j);
            j--;
        }

        entries.sort((left, right) => left.avg - right.avg);
        console.table(entries.slice(0, 32).map(format));

        entries.sort((left, right) => left.max - right.max)
        console.table(entries.slice(0, 32).map(format));
    }
}
