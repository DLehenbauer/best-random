import { strict as assert } from "assert";
import { BitStream, BufferedBitStream, chisquared } from "./util";
import { Random } from "../src";

describe("BitStream", () => {
    it("", () => {
        const actual: number[] = [];
        const s = new BitStream((value) => actual.push(value));

        for (let i = 0; i < 2; i++) {
            for (const v of [
                0x10000000100000, 0x00020000000200, 0x00000040000000, 0x08000000080000,
                0x00010000000100, 0x00000020000000, 0x04000000040000, 0x00008000000080,
                0x00000010000000, 0x02000000020000, 0x00004000000040, 0x00000008000000,
                0x01000000010000, 0x00002000000020, 0x00000004000000, 0x00800000008000,
                0x00001000000010, 0x00000002000000, 0x00400000004000, 0x00000800000008,
                0x00000001000000, 0x00200000002000, 0x00000400000004, 0x00000000800000,
                0x00100000001000, 0x00000200000002, 0x00000000400000, 0x00080000000800,
                0x00000100000001, 0x00000000200000, 0x00040000000400, 0x00000080000000,
            ]) {
                s.push(v);
            }
        }

        assert.deepEqual(actual, new Array(106).fill(0x80000000));
    });
});

describe("Buffered Bitstream", () => {
    it("", () => {
        const src = new BufferedBitStream((new Random(0)).uint53);
        chisquared(src.uint32);
    });
});