#pragma once

#include <stdint.h>

typedef uint64_t rng_state_t;
typedef uint64_t rng_out_t;

// Modern GCC/CLang reduce this to a single instruction on x86/x64.
static inline uint64_t rol64(uint64_t v, int r) { r &= 63; return (v << r) | (v >> (64 - r)); }

static rng_state_t s[2] = { 0 };

// Parameters for mixing:
// p[0]: index for sa (0 or 1)
// p[1]: index for sb (0 or 1)
// p[2]: index for op1 (0: ^, 1: +, 2: -)
// p[3]: rotation amount rl (0-63)
// p[4]: index for sc (0 or 1)
// p[5]: index for op2 (0: ^, 1: +, 2: -)
static unsigned int p[6] = { 0 };

// Combine operation functions
static inline uint64_t op_xor(uint64_t a, uint64_t b) { return a ^ b; }
static inline uint64_t op_add(uint64_t a, uint64_t b) { return a + b; }
static inline uint64_t op_sub(uint64_t a, uint64_t b) { return a - b; }

typedef uint64_t (*combine_op_t)(uint64_t, uint64_t);

// Function pointer table for combine operations
static combine_op_t const combine_ops[] = {
    op_xor, // 0: ^
    op_add, // 1: +
    op_sub  // 2: -
};

static inline rng_out_t next() {
    const uint64_t s0 = s[0];
    const uint64_t s1 = s[1];

    s[0] = s1 ^ (s0 >> 9);
    s[1] = s1 ^ rol64(s0, 35);

    // Parameterized mixing: op2(rol64(op1(sa, sb), rl), sc)
    //
    // For sa, sb, sc:
    //   p[x] == 0 -> s0
    //   p[x] == 1 -> s1
    //
    // For op1, op2:
    //   p[x] == 0 -> ^
    //   p[x] == 1 -> +
    //   p[x] == 2 -> -
    //
    // For rl:
    //   p[x] rotation amount
    
    const uint64_t sa = s[p[0]];
    const uint64_t sb = s[p[1]];
    const combine_op_t op1 = combine_ops[p[2]];
    const int rl = p[3];
    const uint64_t sc = s[p[4]];
    const combine_op_t op2 = combine_ops[p[5]];
    
    return op2(rol64(op1(sa, sb), rl), sc);
}
