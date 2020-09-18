import { RandomCtor, Random } from "../../dist";

export const Xorshift128: RandomCtor =
    function (...seed: number[]): Random {
        seed = seed.length
            ? seed
            : [...new Array(4)].map(() => (Math.random() * 0x100000000) | 0);
        seed.length = 4;

        // Scramble the initial state using a Borosh-Niederreiter generator.
        for (let i = 1; (i < 8) || (seed[0] | seed[1] | seed[2] | seed[3]) === 0; i++) {
            const s = seed[(i - 1) & 3];
            seed[i & 3] ^= i + Math.imul(0x6C078965, (s ^ (s >>> 30)) >>> 0) >>> 0;
        }
  
        const s = {
            x: seed[0] | 0,
            y: seed[1] | 0,
            z: seed[2] | 0,
            w: seed[3] | 0,
        }

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
