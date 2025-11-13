#pragma once

#include <stdint.h>

typedef uint64_t rng_state_t;
typedef uint64_t rng_out_t;

// Modern GCC/CLang reduce this to a single instruction on x86/x64.
static inline uint64_t rol64(uint64_t v, int r) { r &= 63; return (v << r) | (v >> (64 - r)); }

static rng_state_t s[2] = { 0 };

/* p[0..5] = mixing parameters: a, b, c, op1, op2, d
 * op1/op2 codes:
 *   0 = +
 *   1 = ^
 *   2 = -
 * (+) and (^) are commutative; enumeration prunes a>b pairs.
 * (-) is non-commutative; both permutations tested.
 */
static unsigned int p[6] = { 0 };

// Combine operation functions
static inline uint64_t op_add(uint64_t a, uint64_t b) { return a + b; }
static inline uint64_t op_xor(uint64_t a, uint64_t b) { return a ^ b; }
static inline uint64_t op_sub(uint64_t a, uint64_t b) { return a - b; }

typedef uint64_t (*combine_op_t)(uint64_t, uint64_t);

// Function pointer table for combine operations
static combine_op_t const combine_ops[] = {
    op_add, // 0: +
    op_xor, // 1: ^
    op_sub  // 2: -
};

static inline rng_out_t next() {
    const uint64_t s0 = s[0];
    const uint64_t s1 = s[1];

    s[0] = s1 ^ (s0 >> 9);
    s[1] = s1 ^ rol64(s0, 35);

    // Parameterized mixing: rol64(s[a] op1 s[b], c) op2 s[d]
    // Since we only have s[0] and s[1], we map: a=0->s0, a=1->s1, d=0->s0, d=1->s1
    const uint64_t sa = (p[0] == 0) ? s0 : s1;
    const uint64_t sb = (p[1] == 0) ? s0 : s1;
    const uint64_t sd = (p[5] == 0) ? s0 : s1;
    
    const combine_op_t op1 = combine_ops[p[3]];
    const combine_op_t op2 = combine_ops[p[4]];
    
    return op2(rol64(op1(sa, sb), p[2]), sd);
}
