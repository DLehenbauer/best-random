#pragma once

#include <stdint.h>

// Modern GCC/CLang reduce these to a single instruction on x86/x64.
static inline uint32_t rol32(uint32_t v, uint32_t k) { k &= 31; return (v << k) | (v >> (32 - k)); }
static inline uint64_t rol64(uint64_t v, uint64_t k) { k &= 63; return (v << k) | (v >> (64 - k)); }
static inline uint32_t ror32(uint32_t v, uint32_t k) { k &= 31; return (v >> k) | (v << (32 - k)); }
static inline uint64_t ror64(uint64_t v, uint64_t k) { k &= 63; return (v >> k) | (v << (64 - k)); }

static inline uint32_t rev32(uint32_t v) {
    v = ((v >> 1) & 0x55555555) | ((v & 0x55555555) << 1);
    v = ((v >> 2) & 0x33333333) | ((v & 0x33333333) << 2);
    v = ((v >> 4) & 0x0F0F0F0F) | ((v & 0x0F0F0F0F) << 4);
    v = ((v >> 8) & 0x00FF00FF) | ((v & 0x00FF00FF) << 8);
    return rol32(v, 16);
}

static inline uint64_t rev64(uint64_t v) {
    v = ((v >>  1) & 0x5555555555555555) | ((v & 0x5555555555555555) << 1);
    v = ((v >>  2) & 0x3333333333333333) | ((v & 0x3333333333333333) << 2);
    v = ((v >>  4) & 0x0F0F0F0F0F0F0F0F) | ((v & 0x0F0F0F0F0F0F0F0F) << 4);
    v = ((v >>  8) & 0x00FF00FF00FF00FF) | ((v & 0x00FF00FF00FF00FF) << 8);
    v = ((v >> 16) & 0x0000FFFF0000FFFF) | ((v & 0x0000FFFF0000FFFF) << 16);
    return rol64(v, 32);
}

static uint64_t s[2] = { 0 };

static inline void advance() {
    uint64_t s0 = s[0];
    uint64_t s1 = s[1];

    s[0] = s1 ^ (s0 >> 9);
    s[1] = s1 ^ rol64(s0, 35);
}

static inline uint64_t rng_u64() {
    const uint64_t s0 = s[0];
    const uint64_t s1 = s[1];

    (void) s1;
    (void) s0;

    //const uint64_t result = rol64(s0 + s1, 1) + s1;     // Unusual at 8TB / Fail at 16TB (-tf)
    //const uint64_t result = rol64(s0 + s1, 2) + s1;     // Unusual at 32TB [and then exited because we didn't specify -tlmax] (-tf)
    //const uint64_t result = rol64(s0 + s1, 3) + s1;     // Unusual at 64TB / Fail at 128TB (-tf)
    //const uint64_t result = rol64(s0 + s1, 4) + s1;     // Unusual at 64TB / Fail at 256TB (-tf) -- hwd @ 1.5e+13 bytes
    const uint64_t result = rol64(s0 + s1, 5) + s1;     // Unusual at ? / Fail at ? (-tf) -- hwd @ ? bytes

    advance();
    return result;
    // return s[0] + (s[1] >> (s[1] & 0x07));   // Unusual at 8TB / Fail at 32TB (no -tf)
    // return s[0] + (s[1] >> (s[1] & 0x03));   // Unusual at 4TB / Fail at 8TB (no -tf)
    // return s[0] + (s[1] >> (s[1] & 0x01));   // Unusual at 8TB / Fail at 16TB (no -tf)
}

#ifndef COUNT_OF
#define COUNT_OF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))
#endif
