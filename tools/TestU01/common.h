#include <stdint.h>
#include <stdlib.h>
#include <sys/time.h>
#include <time.h>
#include <unistd.h>

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

// Adapted from SplitMix64:
// (See: https://prng.di.unimi.it/splitmix64.c)
static inline uint64_t mix64(uint64_t a, uint64_t b) {
    a ^= b * 0x9e3779b97f4a7c15ULL;
	a = (a ^ (a >> 30)) * 0xbf58476d1ce4e5b9ULL;
	a = (a ^ (a >> 27)) * 0x94d049bb133111ebULL;
	return a ^ (a >> 31);
}

static inline uint64_t us(void) 
{
    // Get the current time in microseconds since the epoch
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return (uint64_t)(tv.tv_sec * 1000000 + tv.tv_usec);
}

static uint64_t wyrand_state = 0x1234567890abcdefULL;

static inline void init_seed(uint64_t seed) {
    if (seed == 0) {
        seed = mix64(
            mix64(
                (uint64_t) time(NULL),          // Current time
                (uint64_t) getpid()),           // Process ID
            mix64(
                (uint64_t)(uintptr_t) &seed,    // Address of seed
                (uint64_t) us()));              // Microseconds since epoch
    }

    wyrand_state = seed;
}

static inline uint64_t seed(void) {
    // See https://github.com/wangyi-fudan/wyhash
    wyrand_state += 0x2d358dccaa6c78a5ull;
    __uint128_t a = wyrand_state;
    __uint128_t b = a ^ 0x8bb84b93962eacc9ull;
    __uint128_t m = a * b;
    return (m >> 64) ^ (uint64_t) m;
}
