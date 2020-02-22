import { Random as RNG } from "../src";
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

    check(new RNG(0));
});
