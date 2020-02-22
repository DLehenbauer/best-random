import { Random, RandomCtor } from "../../src";

export const XorShift128: RandomCtor =
    function(seed0?: number, seed1?: number, seed2?: number, seed3?: number): Random {
        const seed = new Uint32Array(
            arguments.length === 0
                ? [...new Array(4)].map(() => Math.random() * 0x100000000)
                : [seed0, seed1, seed2, seed3].map((s) => s == null ? 0 : +s)
        );
    
        do {
            // Scramble the initial seeds using a LCG w/Borosh-Niederreiter multiplier.  This serves to both
            // fill in unspecified seed values as well as reduce corelation between similar initial seeds.
            for (let i = 1; i < 8; i++) {
                const s = seed[(i - 1) & 3];
                seed[i & 3] ^= i + Math.imul(0x6C078965, (s ^ (s >>> 30)) >>> 0) >>> 0;
            }

            // Perf: Using `var` instead of `let` yields a ~45% speed increase (node v12 x64).
            var [x, y, z, w] = seed;

            // The XorShift family of algorithms have a fixed-point at 0.  Avoid all-zeros by repeating the
            // initial scrambling.
        } while ((x | y | z | w) === 0);

        // XorShift128 (See https://www.jstatsoft.org/index.php/jss/article/view/v008i14/xorshift.pdf)
        const uint32 = () => {
            const t = x ^ (x << 1)
            x = y
            y = z
            z = w
            w = w ^ ((w >>> 19) ^ t ^ (t >>> 8))
            return w >>> 0;
        };

        const uint53 = () => ((uint32() >>> 6) * 0x8000000) + ((w + z) >>> 5);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
