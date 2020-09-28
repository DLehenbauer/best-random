import { RandomCtor, Random } from "../../dist";

export const RomuTrio32: RandomCtor =
    function (...seed: number[]): Random {
        seed = seed.length
            ? seed
            : [...new Array(3)].map(() => (Math.random() * 0x100000000) | 0);

        for (let i = 1; (i < 8) || (seed[0] | seed[1] | seed[2]) === 0; i++) {
            const s = seed[(i - 1) & 3];
            seed[i % 3] ^= i + Math.imul(0x6C078965, (s ^ (s >>> 30)) >>> 0) >>> 0;
        }

        const s = {
            x: seed[0] | 0,
            y: seed[1] | 0,
            z: seed[2] | 0,
        };

        const uint32 = () => {
            const rotl = (v: number, k: number) => {
                return (v << k) | (v >>> (32 - k));
            }

            // Adapted from the code included on the Romu website.
            // (see https://www.romu-random.org/code.c)
            const { x, y, z } = s;
            s.x = Math.imul(3323815723, z);
            s.y = rotl(y - x, 6);
            s.z = rotl(z - y, 22);

            return x >>> 0;
        }

        const uint53 = () => uint32() * 0x200000 + (uint32() >>> 11);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
