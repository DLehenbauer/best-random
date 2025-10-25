#pragma once

#include <stdint.h>

typedef uint32_t rng_state_t;
typedef uint64_t rng_out_t;

// Modern GCC/CLang reduce these to a single instruction on x86/x64.
static inline uint32_t rol32(uint32_t v, int r) { r &= 31; return (v << r) | (v >> (32 - r)); }

static rng_state_t s[3] = { 0 };

// p[0..5] = hi parameters: a, b, c, op1, op2, d
// p[6..11] = lo parameters: a, b, c, op1, op2, d
// where op1, op2: 0=+/^, 1=-
// Note: op_add_or_xor uses + if a<=b, ^ if a>b (to avoid testing symmetric cases)
static unsigned int p[12] = { 0 };

// Combine operation functions
static inline uint32_t op_add_or_xor(uint32_t a, uint32_t b) { return (a <= b) ? (a + b) : (a ^ b); }
static inline uint32_t op_sub(uint32_t a, uint32_t b) { return a - b; }

typedef uint32_t (*combine_op_t)(uint32_t, uint32_t);

// Function pointer table for combine operations
static combine_op_t const combine_ops[] = {
    op_add_or_xor,  // 0: + if a<=b, ^ if a>b
    op_sub          // 1: -
};

static inline rng_out_t next(void) {
    // hi = rol32(s[a] op1 s[b], c) op2 s[d]
    const combine_op_t hi_op1 = combine_ops[p[3]];
    const combine_op_t hi_op2 = combine_ops[p[4]];
    rng_out_t hi = hi_op2(rol32(hi_op1(s[p[0]], s[p[1]]), p[2]), s[p[5]]);
    
    // lo = rol32(s[a] op1 s[b], c) op2 s[d]
    const combine_op_t lo_op1 = combine_ops[p[9]];
    const combine_op_t lo_op2 = combine_ops[p[10]];
    uint32_t lo = lo_op2(rol32(lo_op1(s[p[6]], s[p[7]]), p[8]), s[p[11]]);
    
    rng_out_t result = (hi << 32) | lo;

    rng_state_t t = s[0];
    t ^= t >> 4;
    t ^= t << 3;
    t ^= rol32(s[2], 15);
    
    s[0] = s[1];
    s[1] = s[2];
    s[2] = t;

    return result;
}
