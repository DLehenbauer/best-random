import { Random, RandomCtor } from "../../src";

// XORSHIFT-ADD (XSadd) (see http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/XSADD/).
export const XSadd: RandomCtor =
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

        const uint32 = () => {
            let t = x;
            x = y;
            y = z;
            z = w;

            t ^= t << 15;
            t ^= t >>> 18;
            t ^= w << 11;

            w = t;

            return (w + z) >>> 0;
        };

        // Discard the first 8 results.
        for (let i = 0; i < 8; i++) {
            uint32();
        }

        const uint53 = () => ((uint32() >>> 6) * 0x8000000) + ((w + y) >>> 5);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
