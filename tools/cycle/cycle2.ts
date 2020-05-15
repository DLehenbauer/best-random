import { hex, checkPeriod } from "../utils";

let C1: number;
let C2: number;

const next = (a: number) => { a ^= (a << C1); a ^= (a >>> C2); return a; }
const th = 0xfdffff80;

function test(start: number) {
    let cycle = checkPeriod(next, start, th);

    if (cycle.length >= th) {
        const config = next.toString()
            .replace(/\bC1\b/, `${C1}`)
            .replace(/\bC2\b/, `${C2}`);
        
        const percent = (cycle.length / 0xFFFFFFFF) * 100;
        const s = percent > 90
            ? "*".repeat(Math.max(0, (((percent - 90) ** 2) / 10) | 0))
            : "";

        console.log(`${config.padEnd(50)}// len=${hex(cycle.length)} ${percent.toFixed(2)}% \t${s}`);
    }
}

for (C2 = 0; C2 < 32; C2++) {
    for (C1 = 0; C1 < 32; C1++) {
        test(1);
    }
}
