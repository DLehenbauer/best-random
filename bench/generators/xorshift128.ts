import { RandomCtor, Random } from "../../dist";

export const Xorshift128: RandomCtor =
    function(this: { x: number, y: number, z: number, w: number }, ...seed: number[]): Random {
        var s = this;

        seed = seed.length
            ? seed
            : [...new Array(4)].map(() => Math.random() * 0x100000000)
        seed.length = 4;

        do {
            // Scramble the initial seeds using a LCG w/Borosh-Niederreiter multiplier.  This serves to both
            // fill in unspecified seed values as well as reduce corelation between similar initial seeds.
            for (let i = 1; i < 8; i++) {
                const s = seed[(i - 1) & 3];
                seed[i & 3] ^= i + Math.imul(0x6C078965, (s ^ (s >>> 30)) >>> 0) >>> 0;
            }

            // Perf: Avoid destructuring in order for v8 to recognize x/y/z/w as Int32 value (node v12 x64).
            s.x = seed[0];
            s.y = seed[1];
            s.z = seed[2];
            s.w = seed[3];

            // The XorShift family of algorithms have a fixed-point at 0.  Avoid all-zeros by repeating the
            // initial scrambling.
        } while ((s.x | s.y | s.z | s.w) === 0);

        const uint32 = () => {
            const t = s.x ^ (s.x << 11);

            s.x = s.y;
            s.y = s.z;
            s.z = s.w;
        
            s.w = s.w ^ (s.w >>> 19) ^ (t ^ (t >>> 8));

            return s.w >>> 0;
        }

        // Note: XorShift is known to produce weak lower bits.  To help compensate, we discard the low
        //       bits of both 32b samples when constructing a 53b value.
        const uint53 = () => ((uint32() >>> 6) * 0x8000000) + (uint32() >>> 5);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
