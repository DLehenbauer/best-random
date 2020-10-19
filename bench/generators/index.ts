import { Random } from "../..";     // Use minified version of 'Random'
import { PCG32 } from "./pcg32";
import { RomuQuad32 } from "./romuquad32";
import { RomuTrio32 } from "./romutrio32";
import { XSadd } from "./xsadd";
import { Xorshift32 } from "./xorshift32";
import { Xorshift96 } from "./xorshift96";
import { Xorshift128 } from "./xorshift128";
import { Jsf32 } from "./jsf32";
import { Sfc32 } from "./sfc32";
import { Xoshiro128ss } from "./xoshiro128ss";
import seedrandom = require("seedrandom");

const best = new Random(0x4c24820d, 0x84930822, 0xc1290042, 0x09008200);
const jsf32 = new Jsf32(0);
const pcg32 = new PCG32(0, 0);
const romuQuad32 = new RomuQuad32(0);
const romuTrio32 = new RomuTrio32(0);
const sfc32 = new Sfc32(0);
const xsadd = new XSadd(0);
const xorshift32 = new Xorshift32(0);
const xorshift96 = new Xorshift96(0);
const xorshift128 = new Xorshift128(0);
const xoshiro128ss = new Xoshiro128ss(0);

const r1: [string, Partial<Random>][] = [
    [ "best-random", best ],
    [ "xsadd", xsadd ],
    [ "sfc32", sfc32 ],
    [ "jsf32", jsf32 ],
    [ "xorshift96", xorshift96 ],
    [ "xorshift128", xorshift128 ],
    [ "romutrio32", romuTrio32 ],
    [ "romuquad32", romuQuad32 ],
    [ "xoshiro128ss", xoshiro128ss ],
    [ "xorshift32", xorshift32 ],
    [ "Math.random", {
        uint32: () => (Math.random() * 0x100000000) >>> 0,
        float64: Math.random
    }],
    [ "PCG32 (wasm)", pcg32],
];

const alea = { name: "alea (seedrandom)", ...seedrandom.alea() };
const sdr = { name: "seedrandom (default)", ...seedrandom() };
const tychei = { name: "tychei (seedrandom)", ...seedrandom.tychei() };
const xor128 = { name: "xor128 (seedrandom)", ...seedrandom.xor128() };
const xor4096 = { name: "xor4096 (seedrandom)", ...seedrandom.xor4096() };
const xorshift7 = { name: "xorshift7 (seedrandom)", ...seedrandom.xorshift7() };
const xorwow = { name: "xorwow (seedrandom)", ...seedrandom.xorwow() };

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

export const generators = new Map<string, Partial<Random>>(r1.concat(r2));
