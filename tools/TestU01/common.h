#include <stdlib.h>
#include <stdint.h>
#include <time.h>
#include <sys/time.h>

static inline uint32_t rot32(uint32_t v, uint32_t k) { k &= 31; return (v << k) | (v >> (32 - k)); }
static inline uint64_t rot64(uint64_t v, uint64_t k) { k &= 63; return (v << k) | (v >> (64 - k)); }

static inline uint32_t reverse32(uint32_t v)
{
    v = ((v >> 1) & 0x55555555) | ((v & 0x55555555) << 1);
    v = ((v >> 2) & 0x33333333) | ((v & 0x33333333) << 2);
    v = ((v >> 4) & 0x0F0F0F0F) | ((v & 0x0F0F0F0F) << 4);
    v = ((v >> 8) & 0x00FF00FF) | ((v & 0x00FF00FF) << 8);
    return rot32(v, 16);
}

static inline uint32_t us()
{
    struct timeval start;
    gettimeofday(&start, NULL);
    return start.tv_sec * 1000000 + start.tv_usec;
}

static inline void init_seed(uint32_t seed) {
    if (seed == 0) {
        seed = (unsigned) time(NULL);
        seed ^= (intptr_t) &time;
        seed += us();
    }

    srand(seed);
}

static inline uint64_t seed()
{
    uint64_t x = rand();
    
    // RAND_MAX is implementation dependent, but guaranteed to be at least 15b (0x7fff)
    for (int i = 0; i < 5; i++) {
        x = rot64(x, 13);
        x ^= rand();
    }

    return x + rand();
}