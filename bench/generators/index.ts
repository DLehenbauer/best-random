import { Random } from "../../dist";
import { PCG32 } from "./pcg32";
import seedrandom = require("seedrandom");

const xoshiro128ss = new Random(0);
const pcg32 = new PCG32(0, 0);

const r1: [string, Partial<Random>][] = [
    [ "Xoshiro128ss (best-random)", {...xoshiro128ss} ],
    [ "PCG32 (wasm)", pcg32],
    [ "Math.random", {
        uint32: () => (Math.random() * 0x100000000) >>> 0,
        float64: Math.random
    }]
];

const sdr = { name: "seedrandom (default)", ...seedrandom() };
const alea = { name: "alea (seedrandom)", ...seedrandom.alea() };
const xor128 = { name: "xor128 (seedrandom)", ...seedrandom.xor128() };
const tychei = { name: "tychei (seedrandom)", ...seedrandom.tychei() };
const xorwow = { name: "xorwow (seedrandom)", ...seedrandom.xorwow() };
const xor4096 = { name: "xor4096 (seedrandom)", ...seedrandom.xor4096() };
const xorshift7 = { name: "xorshift7 (seedrandom)", ...seedrandom.xorshift7() };

const r2 = [
    sdr,
    alea,
    xor128,
    tychei,
    xorwow,
    xor4096,
    xorshift7
].map<[string, Partial<Random>]>(rng => {
    return [rng.name, {
        uint32: rng.int32,
        float64: rng.double
    }]
});

export const generators = r1.concat(r2);
