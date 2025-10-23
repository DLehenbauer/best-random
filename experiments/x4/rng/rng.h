#pragma once

#include <stdint.h>

#ifndef COUNT_OF
#define COUNT_OF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))
#endif

// Modern GCC/CLang reduce these to a single instruction on x86/x64.
static inline uint32_t rol32(uint32_t v, int r) { r &= 31; return (v << r) | (v >> (32 - r)); }
static inline uint64_t rol64(uint64_t v, int r) { r &= 63; return (v << r) | (v >> (64 - r)); }
static inline uint32_t ror32(uint32_t v, int r) { r &= 31; return (v >> r) | (v << (32 - r)); }
static inline uint64_t ror64(uint64_t v, int r) { r &= 63; return (v >> r) | (v << (64 - r)); }

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

static uint32_t s[4] = { 0 };
static unsigned int p[3] = { 0 };

static inline uint32_t next() {
    sh1 = c[0]
    sh2 = c[1]
    sh3 = c[2]

    t = s[0]
    t ^= t << p[0]
    t ^= t >> p[1]
    t ^= s[3] << p[2]

    s[0] = s[1]
    s[1] = s[2]
    s[2] = s[3]
    s[3] = t

    return s[0]
}
