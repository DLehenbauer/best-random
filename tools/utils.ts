export const LCGs = [0x8664f205, 0x01c8e815, 0xa13fc965, 0xac564b05, 0xcf019d85, 0xadb4a92d, 0x01ed0675];
export const MCGs = [0x2c2c57ed, 0x2c9277b5, 0x9fe72885, 0x82c1fcad, 0xae3cc725, 0x5f356495, 0xae36bfb5];
export const Ms = [...LCGs, ...MCGs, 0x6c078965, 0x108ef2d9];
export const Ss = [0x6d2b79f5, 0x9e3779b9, ...Ms];

export const hex = (i: number) => `0x${(i >>> 0).toString(16).padStart(8, "0")}`;
export const rot = (v: number, k: number) => (v << k) | (v >>> (32 - k));

/** Inverse of x ^= x >>> i */
export const undoXorShiftLeft = (x: number, i: number) => {
    while (i < 32) {
        x ^= x << i;
        i <<= 1;
    }

    return x;
}

/** Inverse of x ^= x << i */
export const undoXorShiftRight = (x: number, i: number) => {
    while (i < 32) {
        x ^= x >>> i;
        i <<= 1;
    }

    return x;
}

export const isPrime = (candidate: number) => {
    for(let i = 2, stop = Math.sqrt(candidate); i <= stop; i++) {
        if (candidate % i === 0) { return false; }
    }

    return candidate > 1;
}
