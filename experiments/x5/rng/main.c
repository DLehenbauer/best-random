#include <assert.h>
#include <errno.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>
#include <time.h>
#include <unistd.h>

#include "rng.h"

#define BUFFER_SIZE (1 << 20) // 1 MB
#define ELEMENT_SIZE (sizeof(uint64_t))
#define ELEMENT_COUNT (BUFFER_SIZE / ELEMENT_SIZE)

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
    return (m >> 64) ^ (uint64_t)m;
}

void parseArg(int argc, char* argv[], int i) {
    if (argc - i != (int)COUNT_OF(p)) {
        fprintf(stderr,
                "Error: expected exactly %zu decimal integer%s for p[].\n"
                "Usage: %s <p[0]> ... <p[%zu]>\n",
                (size_t)COUNT_OF(p),
                COUNT_OF(p) == 1 ? "" : "s",
                argv[0],
                (size_t)COUNT_OF(p) - 1);
        exit(EXIT_FAILURE);
    }

    for (size_t k = 0; k < COUNT_OF(p); k++, i++) {
        char* end = NULL;
        errno = 0;
        unsigned long long v = strtoull(argv[i], &end, 10); // strictly base-10
        if (end == argv[i] || *end != '\0' || errno == ERANGE) {
            fprintf(stderr, "Error: invalid decimal for p[%zu]: '%s'\n", k, argv[i]);
            exit(EXIT_FAILURE);
        }
        p[k] = (uint64_t)v;
    }
}

int main(int argc, char* argv[]) {
    FILE* fp = freopen(NULL, "wb", stdout); // Only necessary on Windows, but harmless.
    assert(fp);

    init_seed(0);
    for (int i = 0; i < COUNT_OF(s); i++) {
        s[i] = seed();
    }

    parseArg(argc, argv, 1);

    while (1) {
        static uint64_t buffer[ELEMENT_COUNT] __attribute__((aligned(64)));
        static const uint64_t* end = buffer + ELEMENT_COUNT;

        for (uint64_t* p = buffer; p < end; p++) {
            *p = rng_u64();
        }

        fwrite((void*)&buffer, BUFFER_SIZE, 1, stdout);
    }

    return 0;
}
