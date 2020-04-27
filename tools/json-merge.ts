import * as fs from "fs";
import { hex } from "./utils";

let a: any[] = [];

for (const file of [
    "cycle-0.json",
    "cycle-1.json",
    "cycle-2.json",
    "cycle-3.json",
    "cycle-4.json",
    "cycle-5.json",
    "cycle-6.json",
    "cycle-7.json",
]) {
    a = a.concat(JSON.parse(`[${fs.readFileSync(file).toString().slice(0, -1)}]`));
}

a.sort((left: any, right: any) => right.len - left.len);

for (const e of a.slice(0, 100)) {
    console.log(`    // a -= rot(${e.M} * b, ${e.C1});`.padEnd(30), `// len=${hex(e.len)} ${((e.len/0x100000000) * 100).toFixed(2)}%`);
}
