import { Random } from "../../dist";
import { PCG32 } from "./pcg32";
import { XSadd } from "./xsadd";
import { Xorshift32 } from "./xorshift32";
import { Xorshift128 } from "./xorshift128";
import { Jsf32 } from "./jsf32";
import { Xoshiro128ss } from "./xoshiro128ss";
import seedrandom = require("seedrandom");

const best = new Random(0x4c24820d, 0x84930822, 0xc1290042, 0x09008200);
const xsadd = new XSadd(0);
const xorshift32 = new Xorshift32(0);
const xorshift128 = new Xorshift128(0);
const jsf32 = new Jsf32(0);
const xoshiro128ss = new Xoshiro128ss(0);
const pcg32 = new PCG32(0, 0);

const r1: [string, Partial<Random>][] = [
    [ "best-random", best ],
    [ "xsadd", xsadd ],
    [ "jsf32", jsf32 ],
    [ "xorshift32", xorshift32 ],
    [ "xorshift128", xorshift128 ],
    [ "xoshiro128ss", xoshiro128ss ],
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
