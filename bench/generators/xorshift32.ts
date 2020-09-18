import { RandomCtor, Random } from "../../dist";

export const Xorshift32: RandomCtor =
    function (...seed: number[]): Random {
        seed = seed.length
            ? seed
            : [(Math.random() * 0x100000000)];

        const s = {
            y: (seed[0] | 0) || 0x49616E42,     // Avoid the fixed point at y = 0.
        }

        const uint32 = () => {
            let t = s.y;

            // Algorithm "xor" from top of p. 4 of Marsaglia, "Xorshift RNGs"
            // https://www.jstatsoft.org/article/view/v008i14/xorshift.pdf
            //
            // Note that 'y=y>>17' is a typo in the original paper and should be 'y^=y>>17' as
            // per the 1st general form 'y^=y<<a; y^=y>>b; y^=y<<c;' given on p. 3.
            t ^= t << 13;
            t ^= t >>> 17;
            t ^= t << 5;

            s.y = t;

            // Note that the XorShift32 algorithm produces a values in the range
            // [0x00000001..0xFFFFFFFF] inclusive.  (i.e., it never produces zero.)
            return s.y >>> 0;
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
