const assert = require("assert").strict;
const { Random } = require("../dist");

function writeBitsAsync(next) {
    const buffer = Buffer.alloc(4096);

    try {
        do {
            for (let offset = 0; offset < buffer.length; offset += 4) {
                buffer.writeUInt32LE(next() >>> 0, offset)
            }
        } while (process.stdout.write(buffer))
    } catch (error) {
        return;
    }

    process.stdout.on('drain', () => writeBits());
}

const [, , mode, seed] = process.argv;
const RNG = Random;
const u53 = new RNG(seed).uint53;
const modes = {
    "uint32": new RNG(seed).uint32,
    "uint53": () => u53() >>> 0,            // Test low 32 bits.  Upper bits are same as Uint32.
}

const rng = modes[mode];
assert.notEqual(rng, undefined, `Unknown mode '${mode}'.`);

writeBitsAsync(rng);
