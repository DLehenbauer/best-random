import { run } from "hotloop";
import { generators } from "./generators";

const rngs = [...generators.keys()]
    // .filter(name => ["best-random", "xsadd"].includes(name))
    ;

(async () => {
    for (const mode of ["uint32", "float64"]) {
        await run(rngs.map((name) => ({ path: "./test.ts", args: { generatorName: name, mode }})));
    }
})();
