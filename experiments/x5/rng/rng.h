#pragma once

#include <stdint.h>
#include <immintrin.h>

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

extern __m128i s_simd;

// Generate byte swizzle mask from 16-bit element pattern
static inline __m128i get_swizzle_mask(const int pattern[8]) {
    // Convert 16-bit element indices to byte indices
    // Each 16-bit element occupies 2 bytes in little-endian format
    return _mm_set_epi8(
        (pattern[7] * 2) + 1, (pattern[7] * 2),  // element 7 -> bytes
        (pattern[6] * 2) + 1, (pattern[6] * 2),  // element 6 -> bytes
        (pattern[5] * 2) + 1, (pattern[5] * 2),  // element 5 -> bytes
        (pattern[4] * 2) + 1, (pattern[4] * 2),  // element 4 -> bytes
        (pattern[3] * 2) + 1, (pattern[3] * 2),  // element 3 -> bytes
        (pattern[2] * 2) + 1, (pattern[2] * 2),  // element 2 -> bytes
        (pattern[1] * 2) + 1, (pattern[1] * 2),  // element 1 -> bytes
        (pattern[0] * 2) + 1, (pattern[0] * 2)   // element 0 -> bytes
    );
}

static inline void advance() {
    static const int swizzle_pattern[8] = {1, 2, 7, 5, 6, 0, 3, 4};
    __m128i swizzle_mask = get_swizzle_mask(swizzle_pattern);
    
    __m128i x = _mm_srli_epi64(s_simd, 13);
    __m128i y = _mm_shuffle_epi8(s_simd, swizzle_mask);
    s_simd = _mm_xor_si128(x, y);
}

static inline uint64_t rng_u64() {
    advance();

    const uint64_t s0 = _mm_extract_epi64(s_simd, 0);
    const uint64_t s1 = _mm_extract_epi64(s_simd, 1);

    (void) s0;
    (void) s1;

    return (s0 * 0x00000100000001b3) + rol64(s1, s1);
}

#ifndef COUNT_OF
#define COUNT_OF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))
#endif
