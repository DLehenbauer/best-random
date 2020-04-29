import * as fs from "fs";
import { hex, rot, isPrime } from "./utils";
export { hex, rot, isPrime };

interface ICycleInfo {
    cycleLength: number;
    cycleStart: number;
    cyclePerc: number;
    full: boolean;
}

let C1 = 0;
let M = 0;

export const randSeed = () => {
    let value: number;
    
    do {
        value = (Math.random() * 0x100000000) | 1;
    } while (!isPrime(value));
    
    return value;
}

const next = (a: number) => {
    return rot(Math.imul(a, M), C1);
}

const t = (start: number): ICycleInfo => {
    let a = start | 0;
    let b = a;
    let cycleLength = 0;
    let full = false;

    for (; cycleLength <= 0x100000000; cycleLength++) {
        a = next(a) | 0;
        full = a === start;
        if (full || a === b) {
            break;
        }

        if ((cycleLength & 1) === 1) {
            b = next(b) | 0;
        }
    }

    return {
        cycleStart: a,
        cycleLength,
        cyclePerc:
        (cycleLength / 0xFFFFFFFF) * 100,
        full,
    };
};

function meetsThreshold(_cycle: ICycleInfo) {
    return true;
    // return cycle.cycleLength >= 0xfff00000;
}

const [,, partitionSizeArg, partitionAssignmentArg] = process.argv;

const partitionSize = parseInt(partitionSizeArg);
const partitionAssignment = parseInt(partitionAssignmentArg) + 8;
const minM = (partitionSize * partitionAssignment) | 1;
const maxM = minM + partitionSize - 1;

console.log(`[${hex(minM)}..${hex(maxM)}]:`);

const fd = fs.openSync(`./cycle-${partitionAssignment}.json`, "w");
const write = (str: string) => {
    fs.writeSync(fd, str);
};

try {
    for (M = minM; M <= maxM; M += 2) {
        for (C1 = 0; C1 <= 31; C1++) {
            let cycle = t(M);
            if (meetsThreshold(cycle)) {
                if (!cycle.full) {
                    cycle = t(cycle.cycleStart);
                }
                if (meetsThreshold(cycle)) {
                    const config = `{ "M": ${M}, "C1": ${C1}, "len": ${cycle.cycleLength} }`;
                    write(`  ${config},\n`);

                    const s = cycle.cyclePerc > 90
                        ? "*".repeat(Math.max(0, (((cycle.cyclePerc - 90) ** 2) / 10) | 0))
                        : "";

                    console.log(`${config.padEnd(50)}// len=${hex(cycle.cycleLength)} ${cycle.cyclePerc.toFixed(2)}% \t${s}`);
                }
            }
        }

        fs.fsyncSync(fd);
    }
} finally {
    fs.closeSync(fd);
}
