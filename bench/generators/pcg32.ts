import { Random } from "../../src";

// PCG32 (see https://www.pcg-random.org/).

/*
(module
    (type $t1 (func (result i32)))
    (type $t2 (func (param i32 i32)))
    (func $pcg32 (export "pcg32") (type $t1) (result i32)
      (local $l0 i64)
      i32.const 0
      i32.const 0
      i64.load offset=1024
      tee_local $l0
      i64.const 6364136223846793005
      i64.mul
      i64.const 1442695040888963407
      i64.add
      i64.store offset=1024
      get_local $l0
      get_local $l0
      i64.const 18
      i64.shr_u
      i64.xor
      i64.const 27
      i64.shr_u
      i32.wrap/i64
      get_local $l0
      i64.const 59
      i64.shr_u
      i32.wrap/i64
      i32.rotr)
    (func $pcg32_init (export "pcg32_init") (type $t2) (param $p0 i32) (param $p1 i32)
      i32.const 0
      get_local $p1
      i64.extend_u/i32
      i64.const 32
      i64.shl
      get_local $p0
      i64.extend_u/i32
      i64.or
      i64.const 6364136223846793005
      i64.mul
      i64.const 1876011003808476466
      i64.add
      i64.store offset=1024)
    (memory $memory (export "memory") 2)
    (data (i32.const 1024) "s1\f3\d0\f4]YM"))
*/

const wasm = new Uint8Array([0,97,115,109,1,0,0,0,1,10,2,96,0,1,127,96,2,127,127,0,3,3,2,0,1,5,3,1,0,2,7,31,3,5,112,99,103,51,50,0,0,10,112,99,103,51,50,95,105,110,105,116,0,1,6,109,101,109,111,114,121,2,0,10,104,2,60,1,1,126,65,0,65,0,41,3,128,8,34,0,66,173,254,213,228,212,133,253,168,216,0,126,66,207,130,158,187,239,239,222,130,20,124,55,3,128,8,32,0,32,0,66,18,136,133,66,27,136,167,32,0,66,59,136,167,120,11,41,0,65,0,32,1,173,66,32,134,32,0,173,132,66,173,254,213,228,212,133,253,168,216,0,126,66,178,218,233,165,152,194,187,132,26,124,55,3,128,8,11,11,15,1,0,65,128,8,11,8,115,49,243,208,244,93,89,77,0,46,4,110,97,109,101,1,20,2,0,5,112,99,103,51,50,1,10,112,99,103,51,50,95,105,110,105,116,2,17,2,0,1,0,2,108,48,1,2,0,2,112,48,1,2,112,49]);

declare const WebAssembly: any;
const { pcg32_init, pcg32 } = new WebAssembly.Instance(new WebAssembly.Module(wasm)).exports;

export interface PCG32Ctor {
    new(seed0?: number, seed1?: number): Random;
}

export const PCG32: PCG32Ctor =
    function(seed0: number, seed1: number): Random {
        pcg32_init(seed0, seed1);

        const uint53 = () => pcg32() * 0x200000 + (pcg32() >>> 11);

        return {
            uint32: pcg32,
            uint53,
            float64: () => uint53() / 0x20000000000000,
        };
    } as any;
