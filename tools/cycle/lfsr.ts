import { checkPeriod } from "../utils";

const taps = [
    // http://poincare.matf.bg.ac.rs/~ezivkovm/publications/primpol1.pdf
    [2, 7, 16, 32],
    [1, 3, 12, 17, 30, 32],
    
    // https://www.ams.org/journals/mcom/1962-16-079/S0025-5718-1962-0148256-1/S0025-5718-1962-0148256-1.pdf
    [32, 7, 5, 3, 2, 1],

    // https://www.ams.org/journals/mcom/1973-27-124/S0025-5718-1973-0327722-7/S0025-5718-1973-0327722-7.pdf
    [32, 28, 27, 1],

    // http://www.partow.net/programming/polynomials/index.html
    [32, 22, 2, 1],
    [32, 22, 21, 20, 18, 17, 15, 13, 12, 10, 8, 6, 4, 1],
    // BAD: [32, 23, 17, 16, 14, 10, 8, 7, 6, 5, 3, 1],
    [32, 26, 23, 22, 16, 12, 11, 10, 8, 7, 5, 4, 2, 1],
    [32, 27, 26, 25, 24, 23, 22, 17, 13, 11, 10, 9, 8, 7, 2, 1],
    [32, 28, 19, 18, 16, 14, 11, 10, 9, 6, 5, 1],

    [2, 3, 4, 7, 8, 10, 11, 12, 15, 19, 20, 23, 27, 28, 31, 32],
    [1, 29, 31, 32],
    [1, 2, 22, 32],
].map(
    tap => tap.reduce(
        (a, n) => (a | (1 << (n - 1))) >>> 0, 0)
);

for (const tap of taps) {
    const next = (a: number) => {
        return (a >>> 1) ^ (-(a & 1) & tap);
    }
    
    let cycle = checkPeriod(next, /* start: */ 1);
    
    console.log(`0x${tap.toString(16).padStart(8, "0")} -> ${cycle.length.toString(16)}`);
}
