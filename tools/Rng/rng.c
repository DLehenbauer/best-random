#include "rng.h"
#include <stdio.h>
#include <sys/time.h>

static uint32_t x = 0;
static uint32_t y = 0;
static uint32_t z = 0;
static uint32_t w = 0;

static inline uint32_t rot(uint32_t v, uint32_t k) { k &= 31; return (v << k) | (v >> (32 - k)); }

void advance() {
    uint32_t t = x;
    x = y;
    y = z;
    z = w;

    t ^= t << 15;   // x (lo 17b)  0fedcba9 87654321 0....... ........
    t ^= t >> 18;   // x (hi 14b)  ........ ........ ..fedcba 98765432
    t ^= w << 11;   // w (lo 21b)  43210fed cba98765 43210... ........           

    w = t;
}

uint32_t mix(uint32_t a, uint32_t b) {
    uint32_t c = b >> 28;
    a ^= a >> (c + 5);
    a += rot(b * 16777619, 19);
    a ^= a >> (c + 13);
    return a;
}

uint32_t hi32() { return mix(x - z, y - w); }
uint32_t lo32() { return mix(w - y, z - x); }

uint32_t rng_u32h() { advance(); return hi32(); }
uint32_t rng_u32l() { advance(); return lo32(); }

uint64_t rng_u64() {
    advance();
    
    uint64_t t = hi32();
    t <<= 32;
    return t | lo32();
}

uint32_t us() {
    struct timeval start;
    gettimeofday(&start, NULL);
    return start.tv_sec * 1000000 + start.tv_usec;
}

void rng_init() {
    x = y = z = w = (us() | 1);

    for (int i = 0; i < 7; i++) {
        w = mix(hi32(), lo32());
        advance();
    }

    printf("seed: %x %x %x %x\n", x, y, z, w);
}
