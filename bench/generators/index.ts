import { Random } from "../..";     // Use minified version of 'Random'
import { PCG32 } from "./pcg32";
import { XSadd } from "./xsadd";
import { Xorshift32 } from "./xorshift32";
import { Xorshift128 } from "./xorshift128";
import { Jsf32 } from "./jsf32";
import seedrandom = require("seedrandom");

const best = new Random(0);
const xsadd = new XSadd(0);
const xorshift32 = new Xorshift32(0);
const xorshift128 = new Xorshift128(0);
const jsf32 = new Jsf32(0);
const pcg32 = new PCG32(0, 0);

const r1: [string, Partial<Random>][] = [
    [ "best-random", best ],
    [ "xsadd", xsadd ],
    [ "xorshift128", xorshift128 ],
    [ "jsf32", jsf32 ],
    [ "xorshift32", xorshift32 ],
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
    xorwow,
    xor128,
    xor4096,
    tychei,
    xorshift7,
    alea,
    sdr,
].map<[string, Partial<Random>]>(rng => {
    return [rng.name, {
        uint32: rng.int32,
        float64: rng.double
    }]
});

export const generators = new Map<string, Partial<Random>>(r1.concat(r2));
