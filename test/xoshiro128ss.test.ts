import { Random as RNG, Random } from "../src";
import { strict as assert } from "assert";
import { check } from "./util";

describe(RNG.constructor.name, () => {
    it("matches reference implementation", () => {
        // After scrambling the seed, results in an initial state of:
        // [1208447044, 2481403967, 821779568, 4026114934]
        const src = new RNG(0);

        // Check that the first 10 results match the original 'C' implementation.
        const actual = [...new Array(10)].map(src.uint32);
        const expected = [
            3530657145,
            3779263011,
            171500863,
            3079919665,
            141958351,
            1724927985,
            1300721930,
            4030323721,
            1500769083,
            705897019,
        ];

        assert.deepEqual(actual, expected);
    });

    it("Unspecified seed numbers default to zero", () => {
        const same = [
            new Random(0),
            new Random(0, 0),
            new Random(0, 0, 0),
            new Random(0, 0, 0, 0)
        ].map(rnd => rnd.uint53());

        for (let i = 1; i < same.length; i++) {
            assert.equal(same[0], same[i]);
        }
    });

    it("If no unspecified, seed values are randomly chosen", () => {
        assert.notEqual(new Random().uint53(), new Random().uint53());
    });

    check(new RNG(0));
});
