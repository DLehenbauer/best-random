import * as fs from "fs";
import { hex, rot, isPrime, checkPeriod } from "../utils";
export { hex, rot, isPrime };

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

const [,, partitionSizeArg, partitionAssignmentArg] = process.argv;

const threshold = 0;
const partitionSize = parseInt(partitionSizeArg);
const partitionAssignment = parseInt(partitionAssignmentArg) + (8 * 11);
const minM = (partitionSize * partitionAssignment) | 1;
const maxM = minM + partitionSize - 1;

console.log(`[${hex(minM)}..${hex(maxM)}]:`);

const fd = fs.openSync(`./cycle-${partitionAssignment}.json`, "wx");
const write = (str: string) => {
    fs.writeSync(fd, str);
};

try {
    for (M = minM; M <= maxM; M += 2) {
        for (C1 = 0; C1 <= 31; C1++) {
            let cycle = checkPeriod(next, M);
            if (cycle.length >= threshold) {
                const config = `{ "M": ${M}, "C1": ${C1}, "len": ${cycle.length} }`;
                write(`  ${config},\n`);

                const percent = (cycle.length / 0xFFFFFFFF) * 100;
                const s = percent > 90
                    ? "*".repeat(Math.max(0, (((percent - 90) ** 2) / 10) | 0))
                    : "";

                console.log(`${config.padEnd(50)}// len=${hex(cycle.length)} ${percent.toFixed(2)}% \t${s}`);
            }
        }

        fs.fsyncSync(fd);
    }
} finally {
    fs.closeSync(fd);
}
