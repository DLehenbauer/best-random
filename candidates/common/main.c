#include <assert.h>
#include <errno.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/time.h>
#include <unistd.h>
#include <getopt.h>

#include "rng.h"

#ifndef COUNT_OF
#define COUNT_OF(x) ((sizeof(x)/sizeof(0[x])) / ((size_t)(!(sizeof(x) % sizeof(0[x])))))
#endif

#define BUFFER_SIZE (1 << 20) // 1 MB
#define ELEMENT_COUNT (BUFFER_SIZE / sizeof(rng_out_t))

// SplitMix64 PRNG to generate seed values.
// (See: https://prng.di.unimi.it/splitmix64.c)
static inline uint64_t splitmix64_next(uint64_t *x) {
    uint64_t z = (*x += 0x9e3779b97f4a7c15ULL);
    z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9ULL;
    z = (z ^ (z >> 27)) * 0x94d049bb133111ebULL;
    return z ^ (z >> 31);
}

static void auto_seed(void) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    uint64_t time_us = (uint64_t)tv.tv_sec * 1000000ULL + (uint64_t)tv.tv_usec;

    void* heap_ptr = malloc(1);
    uint64_t heap_addr = (uint64_t)(uintptr_t) heap_ptr;
    free(heap_ptr);

    uint64_t entropy[] = {
        time_us,                            // Time of day in microseconds
        (uint64_t) getpid(),                // Process identifier
        heap_addr,                          // Heap address (ASLR variation)
        (uint64_t)(uintptr_t) &entropy,     // Stack address (ASLR variation)
        (uint64_t)(uintptr_t) &auto_seed,   // Code address (ASLR variation)
        (uint64_t) clock()                  // CPU ticks consumed by process
    };

    uint64_t mix = 0;
    for (size_t i = 0; i < COUNT_OF(entropy); i++) {
        mix += entropy[i];
        mix = splitmix64_next(&mix);
    }

    // When generating the seed state, we ensure at least one bit is set.  This is because
    // xorshift-based RNGs typically have a fixed point at the all-zero state.
    uint64_t set_bits = 0;
    do {
        for (size_t i = 0; i < COUNT_OF(s); i++) {
            s[i] = (rng_state_t) splitmix64_next(&mix);
            set_bits |= s[i];
        }
    } while (set_bits == 0);
}

static void usage(const char* prog) {
    fprintf(stderr,
            "Usage: %s [-i] [-s <s[0]> ... <s[%zu]>]%s\n"
            "  -i  Dump initial state to stderr before generating output.\n"
            "  -s  Provide exactly %zu seed value%s (decimal). Without -s seeds are auto-generated.\n",
            prog, 
            (size_t)COUNT_OF(s) - 1,
            COUNT_OF(p) > 0 ? " -p <p[0]> ... <p[%zu]>" : "",
            COUNT_OF(s),
            COUNT_OF(s) == 1 ? "" : "s");
    
    if (COUNT_OF(p) > 0) {
        fprintf(stderr,
                "  -p  Provide exactly %zu parameter value%s (decimal). Required.\n",
                (size_t)COUNT_OF(p),
                COUNT_OF(p) == 1 ? "" : "s");
    }
}

static int parse_uint_array(int argc, char* argv[], int startIndex, 
                            const char* option_name, size_t count,
                            void* dest, size_t elem_size, bool* already_set) {
    if (*already_set) {
        fprintf(stderr, "%s: -%s specified multiple times\n", argv[0], option_name);
        usage(argv[0]);
        exit(EXIT_FAILURE);
    }
    *already_set = true;
    
    if (argc - startIndex < (int)count) {
        fprintf(stderr, "%s: -%s requires %zu value%s.\n",
                argv[0], option_name, count, count == 1 ? "" : "s");
        exit(EXIT_FAILURE);
    }
    
    for (size_t k = 0; k < count; k++) {
        char* end = NULL;
        errno = 0;
        unsigned long long v = strtoull(argv[startIndex + (int)k], &end, 10);
        if (end == argv[startIndex + (int)k] || *end != '\0' || errno == ERANGE) {
            fprintf(stderr, "%s: invalid decimal for %s[%zu]: '%s'\n", 
                    argv[0], option_name, k, argv[startIndex + (int)k]);
            exit(EXIT_FAILURE);
        }
        
        switch (elem_size) {
        case sizeof(uint64_t):
            ((uint64_t*)dest)[k] = (uint64_t)v;
            break;
        case sizeof(uint32_t):
            ((uint32_t*)dest)[k] = (uint32_t)v;
            break;
        default:
            assert(false && "Unsupported element size");
            break;
        }
    }
    
    return (int)count - 1;  // Return number of additional arguments consumed
}

static int parse_seeds(int argc, char* argv[], int startIndex, bool* haveSeeds) {
    return parse_uint_array(argc, argv, startIndex, "s", COUNT_OF(s), s, sizeof(s[0]), haveSeeds);
}

static int parse_params(int argc, char* argv[], int startIndex, bool* haveParams) {
    return parse_uint_array(argc, argv, startIndex, "p", COUNT_OF(p), p, sizeof(p[0]), haveParams);
}

static void dump_state(void) {
    fprintf(stderr, "Seed state (%zu x %zub):", (size_t)COUNT_OF(s), (size_t)sizeof(s[0]) * 8);
    for (size_t i = 0; i < COUNT_OF(s); i++) {
        fprintf(stderr, " %ju", (uintmax_t)s[i]);
    }
    fprintf(stderr, "\n");

    if (COUNT_OF(p) > 0) {
        fprintf(stderr, "Parameters (%zu x %zub):", (size_t)COUNT_OF(p), (size_t)sizeof(p[0]) * 8);
        for (size_t i = 0; i < COUNT_OF(p); i++) {
            fprintf(stderr, " %ju", (uintmax_t)p[i]);
        }
        fprintf(stderr, "\n");
    }
}

static bool parseArgs(int argc, char* argv[]) {
    bool wantDump = false;
    bool haveSeeds = false;
    bool haveParams = false;

    // Build getopt string conditionally
    const char* optstring = COUNT_OF(p) > 0 ? "is:p:h" : "is:h";

    int opt;
    while ((opt = getopt(argc, argv, optstring)) != -1) {
        switch (opt) {
        case 'i':
            wantDump = true;
            break;
        case 's':
            optind += parse_seeds(argc, argv, optind - 1, &haveSeeds);
            break;
        case 'p':
            optind += parse_params(argc, argv, optind - 1, &haveParams);
            break;
        case 'h':
            usage(argv[0]);
            exit(EXIT_SUCCESS);
        default:
            fprintf(stderr, "%s: unexpected argument -- '%c'\n", argv[0], opt);
            exit(EXIT_FAILURE);
        }
    }

    // Any remaining non-option arguments are unexpected (no positional args supported).
    if (optind < argc) {
        fprintf(stderr, "%s: unexpected argument -- '%s'\n", argv[0], argv[optind]);
        exit(EXIT_FAILURE);
    }

    // If COUNT_OF(p) > 0, require -p to be provided
    if (COUNT_OF(p) > 0 && !haveParams) {
        fprintf(stderr, "%s: -p is required\n", argv[0]);
        usage(argv[0]);
        exit(EXIT_FAILURE);
    }

    if (!haveSeeds) {
        auto_seed();
    }

    if (wantDump) {
        dump_state();
    }

    return wantDump;
}

int main(int argc, char* argv[]) {
    parseArgs(argc, argv);

    FILE* fp = freopen(NULL, "wb", stdout); // Typically needed only on Windows; harmless elsewhere.
    assert(fp);

    while (1) {
        static rng_out_t buffer[ELEMENT_COUNT] __attribute__((aligned(64)));
        static const rng_out_t* end = buffer + ELEMENT_COUNT;
        for (rng_out_t* p = buffer; p < end; p++) {
            *p = next();
        }
        fwrite((void*)&buffer, BUFFER_SIZE, 1, stdout);
    }

    return EXIT_SUCCESS;
}
