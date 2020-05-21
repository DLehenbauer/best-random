#include <stdlib.h>
#include <stdint.h>
#include <time.h>
#include <sys/time.h>

static inline uint32_t rot(uint32_t v, uint32_t k) { k &= 31; return (v << k) | (v >> (32 - k)); }

static inline uint32_t reverse32(uint32_t v)
{
    v = ((v >> 1) & 0x55555555) | ((v & 0x55555555) << 1);
    v = ((v >> 2) & 0x33333333) | ((v & 0x33333333) << 2);
    v = ((v >> 4) & 0x0F0F0F0F) | ((v & 0x0F0F0F0F) << 4);
    v = ((v >> 8) & 0x00FF00FF) | ((v & 0x00FF00FF) << 8);
    return rot(v, 16);
}

static inline uint32_t us() {
    struct timeval start;
    gettimeofday(&start, NULL);
    return start.tv_sec * 1000000 + start.tv_usec;
}

static inline uint32_t seed()
{
    uint32_t result = us() ^ (intptr_t) &time;
    for (int i = 0; i < 4; i++) {
        result = rot(result, 8);
        result ^= rand();
    }

    return result;
}