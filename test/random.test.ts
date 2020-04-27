import { Random as RNG, Random } from "../src";
import { strict as assert } from "assert";
import { check } from "./util";

describe(RNG.constructor.name, () => {
    it("Produces expected values", () => {
        const rnd = new Random(/* seed: */ 42);
        assert.equal(rnd.float64(), 0.2403619304225596);
        assert.equal(rnd.uint32(), 3079248431);
        assert.equal(rnd.uint53(), 1933207184009787);
    });

    
    it("Unspecified seed numbers default to zero", () => {
        const same = [
            new Random(0),
            new Random(0, 0),
            new Random(0, 0, 0),
            new Random(0, 0, 0, 0),
        ].map(rnd => rnd.uint53());

        for (let i = 1; i < same.length; i++) {
            assert.equal(same[0], same[i]);
        }
    });

    it("If no seeds are specified values are randomly chosen", () => {
        assert.notEqual(new Random().uint53(), new Random().uint53());
    });

    check(new RNG(0));
});
