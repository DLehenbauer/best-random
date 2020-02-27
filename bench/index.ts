import { Suite } from "benchmark";
import { generators } from "./generators";
import { Random } from "../dist";

const rngs = generators; //.filter(([name, _]) => name.startsWith("Xo"));

function bench<K extends keyof Random>(g: K) {
    const suite = new Suite(`${g}`);
    for (const [name, rng] of rngs) {
        const src = rng[g];
        if (src !== undefined) {
            suite.add(`${name}`, src as any);
        }
    }
    run(suite);
}

bench("uint32");
bench("float64");

function run(suite: Suite) {
    console.log();
    console.group((suite as any)["name"]);
    return suite
        .on("cycle", (event: any) => {
            console.log(String(event.target));
        })
        .on("error", (event: any) => {
            console.error(String(event.target.error));
        })
        .on("complete", (event: any) => {
            console.groupEnd();
            console.log(`Fastest is ${event.currentTarget.filter("fastest").map("name")}`);
        })
        .run();
}
