#include <assert.h>
#include <errno.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <getopt.h>

#include "rng.h"

#ifndef COUNT_OF
#define COUNT_OF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))
#endif

#define BUFFER_SIZE (1 << 20) // 1 MB
#define ELEMENT_SIZE (sizeof(uint64_t))
#define ELEMENT_COUNT (BUFFER_SIZE / ELEMENT_SIZE)

// SplitMix64 PRNG to generate seed values.
static inline uint64_t splitmix64_next(uint64_t *x) {
    uint64_t z = (*x += 0x9e3779b97f4a7c15ULL);
    z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9ULL;
    z = (z ^ (z >> 27)) * 0x94d049bb133111ebULL;
    return z ^ (z >> 31);
}

// Return true if every element in the array is zero.
static inline bool all_zero(const uint64_t *arr, size_t n) {
    uint64_t acc = 0;
    for (size_t i = 0; i < n; ++i) acc |= arr[i];
    return acc == 0;
}

static void auto_seed(void) {
    uint64_t mix = (uint64_t)time(NULL);
    mix ^= ((uint64_t)clock()) << 21;       // CPU ticks add finer resolution
    mix ^= ((uint64_t)getpid()) << 32;      // Process identifier
    mix ^= (uint64_t)(uintptr_t)&mix;       // Stack address (ASLR variation)
    mix ^= (uint64_t)(uintptr_t)&auto_seed; // Code address (ASLR variation)

    do {
        for (size_t i = 0; i < COUNT_OF(s); i++) {
            s[i] = splitmix64_next(&mix);
        }
    } while (all_zero(s, COUNT_OF(s)));     // Avoid fixed point at all-zero state
}

static void parse_seeds(int argc, char* argv[], int startIndex) {
    // Require at least COUNT_OF(s) args available from startIndex.
    if (argc - startIndex < (int)COUNT_OF(s)) {
        fprintf(stderr, "%s: -s requires %zu seed value%s.\n",
                argv[0], (size_t)COUNT_OF(s), COUNT_OF(s) == 1 ? "" : "s");
        exit(EXIT_FAILURE);
    }
    
    for (size_t k = 0; k < COUNT_OF(s); k++) {
        char* end = NULL;
        errno = 0;
        unsigned long long v = strtoull(argv[startIndex + (int)k], &end, 10); // strictly base-10
        if (end == argv[startIndex + (int)k] || *end != '\0' || errno == ERANGE) {
            fprintf(stderr, "%s: invalid decimal for s[%zu]: '%s'\n", argv[0], k, argv[startIndex + (int)k]);
            exit(EXIT_FAILURE);
        }
        s[k] = (uint64_t)v;
    }
}

static void dump_state(void) {
    fprintf(stderr, "Seed state (%zu x %zub):", (size_t)COUNT_OF(s), (size_t)ELEMENT_SIZE * 8);
    for (size_t i = 0; i < COUNT_OF(s); i++) {
        fprintf(stderr, " %llu", (unsigned long long)s[i]);
    }
    fprintf(stderr, "\n");
}

static void usage(const char* prog) {
    fprintf(stderr,
            "Usage: %s [-i] [-s <s[0]> ... <s[%zu]>]\n"
            "  -s  Provide exactly %zu seed value%s (decimal). Without -s seeds are auto-generated.\n"
            "  -i  Dump current seed state to stderr before generating output.\n",
            prog,
            (size_t)COUNT_OF(s) - 1,
            (size_t)COUNT_OF(s),
            COUNT_OF(s) == 1 ? "" : "s");
}

int main(int argc, char* argv[]) {
    FILE* fp = freopen(NULL, "wb", stdout); // Typically needed only on Windows; harmless elsewhere.
    assert(fp);

    bool wantDump = false;
    bool haveSeeds = false;

    int opt;
    while ((opt = getopt(argc, argv, "is:h")) != -1) {
        switch (opt) {
        case 'i':
            wantDump = true;
            break;
        case 's':
            if (haveSeeds) { usage(argv[0]); exit(EXIT_FAILURE); }
            // optarg is the first seed; ensure there are exactly COUNT_OF(s) args following -s
            parse_seeds(argc, argv, optind - 1);
            haveSeeds = true;
            // Advance optind by the count of seeds consumed
            optind += (int)COUNT_OF(s) - 1;
            break;
        case 'h':
            usage(argv[0]);
            return 0;
        default:
            return EXIT_FAILURE;
        }
    }

    // Any remaining non-option arguments are unexpected (no positional args supported).
    if (optind < argc) {
        fprintf(stderr, "%s: unexpected argument -- '%s'\n", argv[0], argv[optind]);
        return EXIT_FAILURE;
    }

    if (!haveSeeds) {
        auto_seed();
    }

    if (wantDump) {
        dump_state();
    }

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
