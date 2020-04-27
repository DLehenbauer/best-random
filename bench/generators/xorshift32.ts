import { RandomCtor, Random } from "../../dist";

export const Xorshift32: RandomCtor =
    function(...seed: number[]): Random {
        const s = {
            y: (seed[0] === undefined
                ? (Math.random() * 0x100000000)
                : seed[0]) || 0x49616E42,
        }

        const uint32 = () => {
            let y = s.y;

            // Algorithm "xor" from p. 4 of Marsaglia, "Xorshift RNGs"
            y ^= y << 13;
            y ^= y >>> 17;
            y ^= y << 5;
    
            s.y = y;
    
            return ~(y >>> 0);
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
