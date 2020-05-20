import { hex, undoXorShiftLeft, undoXorShiftRight, popcount } from "./utils";

var x = 0, y = 0, z = 0, w = 0, c = 0;
const C = 0x9e3779b9 as const;

function forward() {
    let t = x;
    x = y;
    y = z;
    z = w;
    c = (c + C) | 0;

    t ^= t << 15;
    t ^= t >>> 18;
    t ^= w << 11;

    w = t;
}

function backward() {
    let t = w ^ z << 11;
    t = undoXorShiftRight(t, 18);
    t = undoXorShiftLeft(t, 15);

    w = z;
    z = y;
    y = x;
    x = t;
}

function dec(value: number) {
    const s = value.toString();
    return "00".substr(s.length) + s;
}

const mix = (a: number, b: number) => {
    const rot = (v: number, k: number) => (v << k) | (v >>> (32 - k));

    a += rot(Math.imul(b, 16777619), b);
    a ^= a >>> ((b >>> 30) + 14);
    return (a + b) >>> 0;
}

const dumpState = (i: number) => {
    let ham = `${(((popcount(x) + popcount(y) + popcount(z) + popcount(w)) / 128) * 100).toFixed(1)}%`;
    ham = "00000".substr(ham.length) + ham;

    const mb = (i * 8 / 1024 / 1024).toFixed(2);

    const hiArgs: [number, number] = [x, z - c];
    const loArgs: [number, number] = [w, c - y];
    const m1 = mix(...hiArgs);
    const m2 = mix(...loArgs);
    const hiPretty = hiArgs.map(value => `0x${hex(value)}`).join(",");
    const loPretty = loArgs.map(value => `0x${hex(value)}`).join(",");

    let h1 = `${(((popcount(m1) + popcount(m2)) / 64) * 100).toFixed(1)}%`;
    h1 = "00000".substr(h1.length) + h1;

    return `${`${i}`.padStart(10)}: ${mb}MB  x: 0x${hex(x)}, y: 0x${hex(y)}, z: 0x${hex(z)}, w: 0x${hex(w)} c: 0x${hex(c)} -> (${hiPretty})(${loPretty}) ${hex(m1)} ${hex(m2)}  ${ham} ${h1}`;
}

function search(seed: {x: number, y: number, z: number, w: number, v: number}, advance: () => void, max = 64, th = 32) {
    ({ x, y, z, w, v: c } = seed);

    for (let i = 0; i < max; i++) {
        if (popcount(w) < th) {
            console.log(dumpState(i));
        }
        advance();
    }
}

const s = {
    // Seeds that lead to a series of low hamming weight states centered
    // around { x: 0, y: 0, z: 1, w: 0 }.
    x: 0x4c24820d, y: 0x84930822, z: 0xc1290042, w: 0x09008200, v: 0
}

// const th = 5;
// //const limit = ((256 * 1024 * 1024) / 8);
// const limit = 500;
// search(s, forward, limit, th);
// console.log();
// search(s, backward, limit, th);

search(s, forward, 32);
