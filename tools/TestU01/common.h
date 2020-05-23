#include <stdlib.h>
#include <stdint.h>

static inline uint32_t rot(uint32_t v, uint32_t k) { k &= 31; return (v << k) | (v >> (32 - k)); }

static inline uint32_t reverse32(uint32_t v)
{
    v = ((v >> 1) & 0x55555555) | ((v & 0x55555555) << 1);
    v = ((v >> 2) & 0x33333333) | ((v & 0x33333333) << 2);
    v = ((v >> 4) & 0x0F0F0F0F) | ((v & 0x0F0F0F0F) << 4);
    v = ((v >> 8) & 0x00FF00FF) | ((v & 0x00FF00FF) << 8);
    return rot(v, 16);
}

static inline uint32_t seed()
{
    uint32_t x = (intptr_t) &rand;

    // Note: RAND_MAX is implementation dependent, but guaranteed to be at least 15b (0x7fff)
    x ^= rand();
    x = rot(x, 10);
    x ^= rand();
    x = rot(x, 11);
    x ^= rand();

    return x;
}