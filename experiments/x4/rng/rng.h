#pragma once

#include <stdint.h>

typedef uint32_t rng_state_t;
typedef uint32_t rng_out_t;

// Modern GCC/CLang reduce these to a single instruction on x86/x64.
static inline uint32_t rol32(uint32_t v, int r) { r &= 31; return (v << r) | (v >> (32 - r)); }

static rng_state_t s[3] = { 0 };
static unsigned int p[6] = { 0 };

// Operation functions: shr, shl, rol
static inline rng_out_t op_shr(rng_state_t v, unsigned int r) { return v >> r; }
static inline rng_out_t op_shl(rng_state_t v, unsigned int r) { return v << r; }
static inline rng_out_t op_rol(rng_state_t v, unsigned int r) { return rol32(v, r); }

typedef rng_out_t (*rng_op_func_t)(rng_state_t, unsigned int);

// Function pointer table for operations (indexed by operation code)
static rng_op_func_t const ops[] = {
    op_shr,  // 0: shr (>>)
    op_shl,  // 1: shl (<<)
    op_rol   // 2: rol (rotate left)
};

static inline rng_out_t next(void) {
    const rng_op_func_t op1 = ops[p[0]];
    const rng_op_func_t op2 = ops[p[1]];
    const rng_op_func_t op3 = ops[p[2]];

    const unsigned int a0 = p[3];
    const unsigned int a1 = p[4];
    const unsigned int a2 = p[5];

    rng_state_t t = s[0];    
    t ^= op1(t, a0);
    t ^= op2(t, a1);
    t ^= op3(s[2], a2);
    
    s[0] = s[1];
    s[1] = s[2];
    s[2] = t;
    
    return s[0] + s[1];
}
