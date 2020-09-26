import { RandomCtor, Random } from "../../dist";

export const RomuQuad32: RandomCtor =
    function (...seed: number[]): Random {
        seed = seed.length
            ? seed
            : [...new Array(4)].map(() => (Math.random() * 0x100000000) | 0);
        seed.length = 4;

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

            // Adapted from the code included on the Romu website.
            // (see https://www.romu-random.org/code.c)
            const { x, y, z, w } = s;
            s.w = Math.imul(3323815723, z);     // a-mult
            s.x = (z + rotl(w, 26)) | 0;        // b-rotl, c-add
            s.y = (y - x) | 0;                  // d-sub
            s.z = rotl(y + w, 9);               // e-add, f-rotl

            return x >>> 0;
        }

        const uint53 = () => uint32() * 0x200000 + (uint32() >>> 11);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
