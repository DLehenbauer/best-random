import { Random, RandomCtor } from "../../dist";

export const Jsf32: RandomCtor =
    function(...seed: number[]): Random {
        // Note: there are six known fixed points.  We avoid these by ensuring that seed `a` is 0xf1ea5eed.
        //
        // { 0x00000000, 0x00000000, 0x00000000, 0x00000000 }
        // { 0x77777777, 0x55555555, 0x11111111, 0x44444444 }
        // { 0x5591F2E3, 0x69EBA6CD, 0x2A171E3D, 0x3FD48890 }
        // { 0x47CB8D56, 0xAE9B35A7, 0x5C78F4A8, 0x522240FF }
        // { 0x71AAC8F9, 0x66B4F5D3, 0x1E950B8F, 0x481FEA44 }
        // { 0xAB23E5C6, 0xD3D74D9A, 0x542E3C7A, 0x7FA91120 }

        const s = {
            a: 0xf1ea5eed | 0,
            b: seed[0] | 0,
            c: seed[0] | 0,
            d: seed[0] | 0,
        };
    
        const uint32 = function () {
            const t = (s.a - ((s.b << 23) | (s.b >>> 9))) | 0;
            s.a = s.b ^ ((s.c << 16) | (s.c >>> 16));
            s.b = (s.c + ((s.d << 11) | (s.d >>> 21))) | 0;
            s.c = (s.d + t) | 0;
            s.d = (s.a + t) | 0;
            return s.d >>> 0;
        };
    
        for (let i = 0; i < 20; i++) { uint32() }

        const uint53 = () => uint32() * 0x200000 + (uint32() >>> 11);

        return {
            uint32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        }
    } as any;
