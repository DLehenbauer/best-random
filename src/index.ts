export interface Random {
    /**
     * Returns a pseudorandomly chosen value from the uniform distribution [0, 0xffffffff] (inclusive)
     */
    uint32(): number;

    /**
     * Returns a pseudorandomly chosen value from the uniform distribution [0, 0x1fffffffffffff] (inclusive)
     */
    uint53(): number;

    /**
     * Returns a pseudorandomly chosen value from the uniform distribution [0, 1) (max ~0.9999999999999999)
     */
    float64(): number;
}

export interface RandomCtor {
    /**
     * Construct a new instance of the random number generator, seeding it using Math.random().
     */
    new (): Random;

    /**
     * Construct a new instance of the random number generator, seeding it with a 32b integer.
     */
    new (seed: number): Random;

    /**
     * Construct a new instance of the random number generator, seeding it with two 32b integers.
     */
    new (seed0: number, seed1: number): Random;

    /**
     * Construct a new instance of the random number generator, seeding it with three 32b integers.
     */
    new (seed0: number, seed1: number, seed2: number): Random;

    /**
     * Construct a new instance of the random number generator, seeding it with four 32b integers.
     */
    new (seed0: number, seed1: number, seed2: number, seed3: number): Random;
}

export const Random: RandomCtor =
    function(...seed: number[]): Random {
        const C = 0x9e3779b9 as const;

        seed = seed.length
            ? seed
            : [...new Array(4)].map(() => Math.random() * 0x100000000);

        const s = {
            x: seed[0] | 0,
            y: seed[1] | 0,
            z: seed[2] | 0,
            w: seed[3] | 0,
            c: 0,
        }

        const mix = (a: number) => {
            const rot = (v: number, k: number) => (v << k) | (v >>> (32 - k));

            return (rot(a, 9) - rot(s.z, 4)) >>> 0;
        }

        const uint32 = () => {
            let t = s.x;
            s.x = s.y;
            s.y = s.z;
            s.z = s.w;

            s.c = (s.c + C) | 0;

            t ^= t << 15;      // x (lo 17b)  0fedcba9 87654321 0....... ........
            t ^= t >>> 18;     // x (hi 14b)  ........ ........ ..fedcba 98765432
            t ^= s.w << 11;    // w (lo 21b)  43210fed cba98765 43210... ........           

            s.w = t;

            return mix(s.x - s.c);
        }

        for (let i = 0; i < 9 || !s.w; i++) {
            s.w = uint32() | 0;
        }

        const uint32lo = () => mix(s.c - s.w);
        const uint53 = () => uint32() * 0x200000 + (uint32lo() >>> 11);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
