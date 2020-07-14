#include "rng.h"
#include "stdio.h"

const uint32_t S = 0x9e3779b9;

static uint32_t x = 0;
static uint32_t y = 0;
static uint32_t z = 0;
static uint32_t w = 0;
static uint32_t s = 0;
static uint32_t r0 = 0;
static uint32_t r1 = 0;

static inline uint32_t rot(uint32_t v, uint32_t k) { k &= 31; return (v << k) | (v >> (32 - k)); }

void advance() {
    uint32_t t = x;
    x = y;
    y = z;
    z = w;

    s += S;

    t ^= t << 15;   // x (lo 17b)  0fedcba9 87654321 0....... ........
    t ^= t >> 18;   // x (hi 14b)  ........ ........ ..fedcba 98765432
    t ^= w << 11;   // w (lo 21b)  43210fed cba98765 43210... ........           

    w = t;
}

// r0 = 1, r1 = 10;     // 2TB Ux0

uint32_t mix(uint32_t a) {
    a = rot(a, r0);
    a += rot(y, r1);
    return a;
}

uint32_t hi32() { return mix(x - s); }
uint32_t lo32() { return mix(s - w); }

uint32_t rng_u32h() { advance(); return hi32(); }
uint32_t rng_u32l() { advance(); return lo32(); }

uint64_t rng_u64() {
    advance();
    
    uint64_t t = hi32();
    t <<= 32;
    return t | lo32();
}

void rng_init(uint32_t s0, uint32_t s1, uint32_t s2, uint32_t s3, uint32_t p0, uint32_t p1) {
    x = s0;
    y = s1;
    z = s2;
    w = s3;
    r0 = p0;
    r1 = p1;
}
