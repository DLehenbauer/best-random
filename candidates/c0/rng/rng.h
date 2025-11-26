#pragma once

#include <stdint.h>

typedef uint64_t rng_state_t;
typedef uint64_t rng_out_t;

// Modern GCC/CLang reduces this to a single instruction on x86/x64.
static inline uint64_t rol64(uint64_t v, int r) { r &= 63; return (v << r) | (v >> (64 - r)); }

static rng_state_t s[2] = { 0 };
static unsigned int p[0] = { };

static inline rng_out_t next() {
    const rng_state_t s0 = s[0];
    const rng_state_t s1 = s[1];

    s[0] = s1 ^ (s0 >> 9);
    s[1] = s1 ^ rol64(s0, 35);

    return rol64(s0 - s1, 2) - s1;
}
