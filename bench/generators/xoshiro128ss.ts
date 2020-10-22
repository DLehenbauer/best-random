import { RandomCtor, Random } from "../../dist";

export const Xoshiro128ss: RandomCtor =
    function (...seed: number[]): Random {
        seed = seed.length
            ? seed
            : [...new Array(4)].map(() => (Math.random() * 0x100000000) | 0);

        // Avoid fixed points at 0 by scrambling the initial state using a Borosh-Niederreiter generator.
        for (let i = 1; (i < 8) || (seed[0] | seed[1] | seed[2] | seed[3]) === 0; i++) {
            const s = seed[(i - 1) & 3];
            seed[i & 3] ^= i + Math.imul(0x6C078965, (s ^ (s >>> 30)) >>> 0) >>> 0;
        }

        const s = {
            x: seed[0] | 0,
            y: seed[1] | 0,
            z: seed[2] | 0,
            w: seed[3] | 0,
        };

        const uint32 = () => {
            const rotl = (v: number, k: number) => {
                return (v << k) | (v >>> (32 - k));
            }

            // Adapted from the code included on Sebastian Vigna's website.
            // (see http://prng.di.unimi.it/xoshiro128starstar.c)

            const result = (rotl(s.y * 5, 7) * 9) >>> 0;
            const t = s.y << 9;

            s.z ^= s.x;
            s.w ^= s.y;
            s.y ^= s.z;
            s.x ^= s.w;
            s.z ^= t;
            s.w = rotl(s.w, 11);

            return result;
        }

        const uint53 = () => uint32() * 0x200000 + (uint32() >>> 11);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
