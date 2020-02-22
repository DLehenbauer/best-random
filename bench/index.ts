import { Suite } from "benchmark";
import { XSadd, PCG32, XorShift128 } from "./generators";
import { Random } from "../dist";

const xsadd = new XSadd(0);
const xoshiro128ss = new Random(0);
const pcg32 = new PCG32(0, 0);
const xorshift128 = new XorShift128(0);

run(new Suite("RNG:uint32()")
    .add("Math.random", () => Math.random() * 0x100000000)
    .add("Xoshiro128ss.uint32()", xoshiro128ss.uint32)
    .add("XorShift128.uint32()", xorshift128.uint32)
    .add("XSadd128.uint32()", xsadd.uint32)
    .add("PCG32.uint32()", pcg32.uint32));

run(new Suite("RNG:float64()")
    .add("Math.random", Math.random)
    .add("Xoshiro128ss.float64()", xoshiro128ss.float64)
    .add("XorShift128.float64()", xorshift128.float64)
    .add("XSadd128.float64()", xsadd.float64)
    .add("PCG32.float64()", pcg32.float64));

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
