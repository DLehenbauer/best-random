#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>
#include <time.h>
#include <unistd.h>

#include "rng.h"

// Define the SIMD state variable
__m128i s_simd = { 0 };

#define ELEMENT_COUNT (4096 / sizeof(uint64_t))
#define BUFFER_SIZE (sizeof(uint64_t) * ELEMENT_COUNT)

// Adapted from SplitMix64:
// (See: https://prng.di.unimi.it/splitmix64.c)
static inline uint64_t mix64(uint64_t a, uint64_t b) {
    a += b * 0x9e3779b97f4a7c15ULL;
	a = (a ^ (a >> 30)) * 0xbf58476d1ce4e5b9ULL;
	a = (a ^ (a >> 27)) * 0x94d049bb133111ebULL;
	return a ^ (a >> 31);
}

static uint64_t wyrand_state;

static inline void init_seed(uint64_t seed) {
    if (seed == 0) {
        struct timeval tv;
        gettimeofday(&tv, NULL);
        uint64_t us = (uint64_t)(tv.tv_sec * 1000000 + tv.tv_usec);

        seed = mix64(
            mix64(
                (uint64_t) getpid(),            // Process ID
                (uint64_t) time(NULL)),         // Current time
            mix64(
                (uint64_t) us,                  // Microseconds since epoch
                (uint64_t)(uintptr_t) &seed));  // Address of seed
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

static inline void out_u64(uint64_t value) {
    static uint64_t buffer[ELEMENT_COUNT];
    static int i = 0;

    if (i == ELEMENT_COUNT) {
        fwrite((void*) &buffer, sizeof(uint64_t), ELEMENT_COUNT, stdout);
        i = 0;
    }

    buffer[i++] = value;
}

int main(int argc, char *argv[]) {
    FILE* fp = freopen(NULL, "wb", stdout);  // Only necessary on Windows, but harmless.
    assert(fp);

    init_seed(0);
    s_simd = _mm_set_epi64x(seed(), seed());

    while (1) {
        out_u64(rng_u64());
    }

    return 0;
}
