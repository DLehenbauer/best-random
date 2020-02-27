const assert = require("assert").strict;
const { Random } = require("../dist");
const { BufferedBitStream } = require("../test/util");

function go(src) {
    const u32 = new Uint32Array(1 << 10);
    const u8 = new Uint8Array(u32.buffer);

    const cb = () => {
        do {
            for (let i = 0; i < u32.length; i++) {
                u32[i] = src();
            }
        } while(process.stdout.write(u8));
    
        process.stdout.once('drain', cb);
    }

    cb();
}

const [, , mode, seed] = process.argv;
const RNG = Random;
const modes = {
    "math": () => (Math.random() * 0x100000000) >>> 0,
    "uint32": new RNG(seed).uint32,
    "uint53": new BufferedBitStream(new RNG(seed).uint53).uint32
}

const rng = modes[mode];
assert.notEqual(rng, undefined, `Unknown mode '${mode}'.`);

go(rng);
