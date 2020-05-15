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
    new(): Random;

    /**
     * Construct a new instance of the random number generator, seeding it with a 32b integer.
     */
    new(seed: number): Random;

    /**
     * Construct a new instance of the random number generator, seeding it with two 32b integers.
     */
    new(seed0: number, seed1: number): Random;

    /**
     * Construct a new instance of the random number generator, seeding it with three 32b integers.
     */
    new(seed0: number, seed1: number, seed2: number): Random;

    /**
     * Construct a new instance of the random number generator, seeding it with four 32b integers.
     */
    new(seed0: number, seed1: number, seed2: number, seed3: number): Random;
}

export const Random: RandomCtor =
    function(this: { x: number, y: number, z: number, w: number }, ...seed: number[]): Random {
        var s = this;

        seed = seed.length
            ? seed
            : [...new Array(4)].map(() => Math.random() * 0x100000000)
        seed.length = 4;

        // Perf: ~38% speed increase when x/y/z/w are initialized as Int32 vs. Uint32.
        seed = new Int32Array(seed) as any;

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
            const rot = (v: number, k: number) => {
                return (v << k) | (v >>> (32 - k));
            }

            // Adapted from the code included on Sebastian Vigna's website.
            // (see http://prng.di.unimi.it/xoshiro128starstar.c)

            const result = (rot(s.y * 5, 7) * 9) >>> 0;
            const t = s.y << 9;
        
            s.z ^= s.x;
            s.w ^= s.y;
            s.y ^= s.z;
            s.x ^= s.w;
            s.z ^= t;
            s.w = rot(s.w, 11);
        
            return result;
        }

        // To produce the lower 21 bits, we take advantage of the fact that the Xoshiro128** and
        // Xoshiro128+ generators are identical, save for their output transforms.
        // (see http://prng.di.unimi.it/xoshiro128plus.c)
        //
        // Note that this construction discards the weak low bit of Xoshiro128+.  The resulting
        // bitstream passes the PractRand suite.  (Bitstream verified up to 256 gigabytes)
        // (see http://pracrand.sourceforge.net/)
        const uint53 = () => uint32() * 0x200000 + ((s.x + s.w) >>> 11);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
