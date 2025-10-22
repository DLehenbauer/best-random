#pragma once

#include <stdint.h>

#ifndef COUNT_OF
#define COUNT_OF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))
#endif

// Modern GCC/CLang reduce this to a single instruction on x86/x64.
static inline uint64_t rol64(uint64_t v, int r) { r &= 63; return (v << r) | (v >> (64 - r)); }

static uint64_t s[2] = { 0 };
static uint64_t p[1] = { 0 };

static inline void advance() {
    uint64_t s0 = s[0];
    uint64_t s1 = s[1];

    s[0] = s1 ^ (s0 >> 9);
    s[1] = s1 ^ rol64(s0, 35);
}

static inline uint64_t rng_u64() {
    const uint64_t s0 = s[0]; (void) s0;
    const uint64_t s1 = s[1]; (void) s1;

    advance();

    return rol64(s0 + s1, p[0]) + s1;
}
