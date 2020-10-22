import { RandomCtor, Random } from "../../dist";

export const Sfc32: RandomCtor =
    function (...seed: number[]): Random {
        seed = seed.length
            ? seed
            : [...new Array(3)].map(() => (Math.random() * 0x100000000) | 0);

        const s = {
            a: seed[0] | 0,
            b: seed[1] | 0,
            c: seed[2] | 0,
            counter: 1,
        }

        const uint32 = () => {
            // Chris Doty-Humphrey's SFC PRNG adapted from 'PractRand/src/RNGs/sfc.cpp'
            s.counter = (s.counter + 1) | 0
            const tmp = (s.a + s.b + s.counter) | 0;
            s.a = s.b ^ (s.b >>> 9);
            s.b = (s.c + (s.c << 3)) | 0;
            s.c = ((s.c << 21 | s.c >>> 11) + tmp) | 0;
            return tmp >>> 0;
        }

        for (let i = 0; i < 15; i++) { uint32(); }

        const uint53 = () => uint32() * 0x200000 + (uint32() >>> 11);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
