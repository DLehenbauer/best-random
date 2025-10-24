#pragma once

#include <stdint.h>

#ifndef COUNT_OF
#define COUNT_OF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))
#endif

// Modern GCC/CLang reduce these to a single instruction on x86/x64.
static inline uint32_t rol32(uint32_t v, int r) { r &= 31; return (v << r) | (v >> (32 - r)); }

static uint32_t s[4] = { 0 };
static unsigned int p[6] = { 0 };

// Operation functions: shr, shl, rol
static inline uint32_t op_shr(uint32_t v, unsigned int r) { return v >> r; }
static inline uint32_t op_shl(uint32_t v, unsigned int r) { return v << r; }
static inline uint32_t op_rol(uint32_t v, unsigned int r) { return rol32(v, r); }

// Function pointer table for operations (indexed by operation code)
static uint32_t (*const ops[])(uint32_t, unsigned int) = {
    op_shr,  // 0: shr (>>)
    op_shl,  // 1: shl (<<)
    op_rol   // 2: rol (rotate left)
};

static inline uint32_t next(void) {
    // Save x (s[0]) before shifting state
    uint32_t t = s[0];
    
    // Shift state: x=y, y=z, z=w
    s[0] = s[1];
    s[1] = s[2];
    s[2] = s[3];
    
    // Apply three XOR operations with configurable operations and shift amounts
    // op[0..2] = p[0..2], r[0..2] = p[3..5]
    t ^= ops[p[0]](t, p[3]);      // First XOR: t ^= op(p[0], t, p[3])
    t ^= ops[p[1]](t, p[4]);      // Second XOR: t ^= op(p[1], t, p[4])
    t ^= ops[p[2]](s[3], p[5]);   // Third XOR: t ^= op(p[2], s[3], p[5])
    
    // Set w = t
    s[3] = t;
    
    return t;
}
