import { strict as assert } from "assert";
import { Random } from "../src";

export function chisquared(u32: () => number) {
    for (let j = 0; j < 10; j++) {
        // Clear before each iteration.
        const bytes = [
            [...new Array(256)].fill(0),
            [...new Array(256)].fill(0),
            [...new Array(256)].fill(0),
            [...new Array(256)].fill(0)
        ];

        const numSamples = bytes[0].length << 4;      // We need > ~10x more samples than we have buckets.
        for (let i = 0; i < numSamples; i++) {
            const v = u32();
            assert.equal(v, v >>> 0, "Source must produce Uint32 values.");

            bytes[0][v >>> 24]++;
            bytes[1][(v << 8) >>> 24]++;
            bytes[2][(v << 16) >>> 24]++;
            bytes[3][(v << 24) >>> 24]++;
        }

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
            const max = 4.5 * Math.sqrt(r);

            assert(d <= max, `Iteration ${j}, for byte${i}: Expected d <= '${max}', but got '${d}'.`);
        }
    }
}

export function check(src: Random) {
    const n = 1000000;

    describe("range", () => {
        it("uint32()", () => {
            for (let i = 0; i < n; i++) {
                const v = src.uint32();
                assert.equal(v, v >>> 0);
            }
        });
        it("uint53()", () => {
            for (let i = 0; i < n; i++) {
                const v = src.uint53();
                assert(0 <= v && v <= Number.MAX_SAFE_INTEGER);
                assert.equal(v, Math.floor(v));
            }
        });
        it("float64()", () => {
            for (let i = 0; i < n; i++) {
                const v = src.float64();
                assert(0 <= v && v < 1);
            }
        });
    });

    describe("chi-squared", () => {
        it("uint32()", () => { chisquared(src.uint32); });
        it("uint53() (lo)", () => {  chisquared(() => src.uint53() >>> 0); });
        it("uint53() (hi)", () => {  chisquared(() => (src.uint53() / 0x200000) >>> 0); });
        it("float64()", () => {  chisquared(() => (src.float64() * 0x100000000) >>> 0); });
    });
}

function lsh(v: number, k: number) {
    return k < 32
        ? (v << k) >>> 0
        : 0
}

export class BitStream {
    private pendingBits = 0;
    private numPending = 0;

    constructor(
        private readonly sink: (u32: number) => void,
    ) { }

    push(v: number) {
        let hi32 = (v / 0x200000) >>> 0;
        const lo21 = (v << 11) >>> 0;

        const fromHi = 32 - this.numPending;
        const hiBits = (hi32 >>> (32 - fromHi)) >>> 0;
        const v1 = (this.pendingBits | hiBits) >>> 0;
        this.sink(v1);
        
        this.pendingBits = lsh(hi32, fromHi);
        this.numPending = 32 - fromHi;

        const fromLo = Math.min(32 - this.numPending, 21);
        const loBits = (lo21 >>> (32 - fromLo) << (32 - fromLo)) >>> this.numPending;
        this.pendingBits = (this.pendingBits | loBits) >>> 0;
        this.numPending += fromLo;

        if (this.numPending === 32) {
            this.sink(this.pendingBits);
            this.numPending = 21 - fromLo;
            this.pendingBits = (lo21 << fromLo) >>> 0;
        }
    }
}

export class BufferedBitStream {
    private readonly bitstream: BitStream;
    private readonly queued: number[] = [];

    constructor(private readonly src: () => number) {
        this.bitstream = new BitStream((u32: number) => this.queued.push(u32));
    }

    public readonly uint32 = () => {
        if (this.queued.length === 0) {
            this.bitstream.push(this.src());
        }
        return this.queued.shift()!;
    }
}