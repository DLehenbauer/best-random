import { strict as assert } from "assert";
import { BufferedBitStream } from "../test/util";
import { generators } from "../bench/generators";

function go(src: () => number) {
    const u32 = new Uint32Array(1 << 10);
    const u8 = new Uint8Array(u32.buffer);

    const cb = () => {
        for (let i = 0; i < u32.length; i++) {
            u32[i] = src();
        }
        
        if (process.stdout.write(u8, 'binary')) {
            process.nextTick(cb);
        } else {
            process.stdout.once('drain', cb);
        }
    }

    cb();
}

const [,, genName, mode] = process.argv;
const rng = generators.get(genName)!;
assert(rng, `Unrecognized generator '${genName}'`);

const modes = {
    "uint32": rng.uint32!,
    "uint53": new BufferedBitStream(rng.uint53!).uint32,
    "uint53lo": () => rng.uint53!() >>> 0
}

const src = modes[mode as "uint32" | "uint53" | "uint53lo"];
assert(src, `Unknown mode '${mode}'.`);

go(src);
