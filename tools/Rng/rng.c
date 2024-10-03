#include "rng.h"
#include "params.h"
#include "stdio.h"

#define BITS_64

// Fractional part of golden ratio * 2^32 (i.e. `floor((φ % 1) * 2^32)`)
const uint32_t S = 0x9e3779b9;

static uint32_t x = 0;
static uint32_t y = 0;
static uint32_t z = 0;
static uint32_t w = 0;
static uint32_t s = 0;
static uint32_t state [4] = { 0 };

// Modern GCC/CLang reduce this to a single 'rol' instruction on x86/x64.
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

    state[0] = x;
    state[1] = y;
    state[2] = z;
    state[3] = w;
}

uint32_t get_index(uint32_t r, uint32_t i) {
    i <<= 1;
    uint32_t mask = 0b11 << i;
    return (r & mask) >> i;
}

uint32_t a(uint32_t r) { return state[get_index(r, 0)]; }
uint32_t b(uint32_t r) { return state[get_index(r, 1)]; }
uint32_t c(uint32_t r) { return state[get_index(r, 2)]; }
uint32_t d(uint32_t r) { return state[get_index(r, 3)]; }
uint32_t e(uint32_t r) { return state[get_index(r, 4)]; }
uint32_t f(uint32_t r) { return state[get_index(r, 5)]; }
uint32_t g(uint32_t r) { return state[get_index(r, 6)]; }

uint32_t get32(uint32_t r) {
    uint32_t _a = a(r);
    uint32_t _b = b(r);
    uint32_t _c = c(r);
    uint32_t _d = d(r);
    uint32_t _e = e(r);
    uint32_t _f = f(r);

    switch (_f) {
        case 0: return rot(_a - _b, _c) - rot(_d, _e);
        case 1: return rot(_a - _b, _c) + rot(_d, _e);
        case 2: return rot(_a + _b, _c) - rot(_d, _e);
        default: return rot(_a + _b, _c) + rot(_d, _e);
    }
}

uint32_t hi32() { return get32(r0); }
uint32_t lo32() { return get32(r1); }

uint32_t rng_u32h() { advance(); return hi32(); }
uint32_t rng_u32l() { advance(); return lo32(); }

uint64_t rng_u64() {
    uint64_t t = rng_u32h();
    t <<= 32;
    return t | lo32();          // 64-bit generator
//    return t | rng_u32h();      // 32-bit generator
}

void rng_set(uint32_t s0, uint32_t s1, uint32_t s2, uint32_t s3) {
    x = s0;
    y = s1;
    z = s2;
    w = s3;
}

void rng_set_ext(uint32_t s0, uint32_t s1, uint32_t s2, uint32_t s3, uint32_t p0, uint32_t p1) {
    rng_set(s0, s1, s2, s3);
    r0 = p0;
    r1 = p1;
}

void rng_get(uint32_t* pS0, uint32_t* pS1, uint32_t* pS2, uint32_t* pS3, uint32_t* pP0, uint32_t* pP1) {
    *pS0 = x;
    *pS1 = y;
    *pS2 = z;
    *pS3 = w;
    *pP0 = r0;
    *pP1 = r1;
}

void rng_expose(uint32_t** ppS0, uint32_t** ppS1, uint32_t** ppS2, uint32_t** ppS3) {
    *ppS0 = &x;
    *ppS1 = &y;
    *ppS2 = &z;
    *ppS3 = &w;
}
