import * as fs from "fs";
import { hex } from "../utils";

let a: any[] = [];

for (let i = 0; i <= 71; i++) {
    const filename = `cycle-${i}.json`;
    console.log(`${filename}:`)
    a = a.concat(JSON.parse(`[${fs.readFileSync(filename).toString().trim().slice(0, -1)}]`));
}

a.sort((left: any, right: any) => right.len - left.len);

for (const e of a.slice(0, 100)) {
    console.log(`    // a -= rot(${e.M} * b, ${e.C1});`.padEnd(30), `// len=${hex(e.len)} ${((e.len/0x100000000) * 100).toFixed(2)}%`);
}
