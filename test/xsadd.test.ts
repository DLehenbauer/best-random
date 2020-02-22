import { strict as assert } from "assert";
import { XSadd as RNG } from "../bench/generators/xsadd";
import { check } from "./util";

describe(RNG.constructor.name, () => {
    it("matches reference implementation", () => {
        const src = new RNG(0);

        // Check that the first 10 results match the original 'C' implementation.
        const actual = [...new Array(10)].map(src.uint32);
        const expected = [
            632138386,
            1225805588,
            2705912313,
            1588753522,
            2732548795,
            2735726966,
            2394419574,
            3515814289,
            3556633123,
            1015237501,
        ];

        assert.deepEqual(actual, expected);
    });

    check(new RNG(0));
});
