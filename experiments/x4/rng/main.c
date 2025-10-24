#include <assert.h>
#include <errno.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "rng.h"

#if defined(_WIN32)
#include <windows.h>
#define SLEEP_MS(ms) Sleep(ms)
static inline uint64_t get_time_us(void) {
    FILETIME ft;
    GetSystemTimeAsFileTime(&ft);
    uint64_t t = ((uint64_t)ft.dwHighDateTime << 32) | ft.dwLowDateTime;
    return t / 10;  // Convert 100ns intervals to microseconds
}
#else
#include <sys/time.h>
#include <unistd.h>
#define SLEEP_MS(ms) usleep((ms) * 1000)
static inline uint64_t get_time_us(void) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return (uint64_t)tv.tv_sec * 1000000 + (uint64_t)tv.tv_usec;
}
#endif

#define BUFFER_SIZE (1 << 20) // 1 MB
#define ELEMENT_SIZE (sizeof(uint64_t))
#define ELEMENT_COUNT (BUFFER_SIZE / ELEMENT_SIZE)

// SplitMix64 is used for seeding the RNG state.
// (See https://prng.di.unimi.it/splitmix64.c)
static inline uint64_t splitmix64(uint64_t* state) {
    uint64_t z = (*state += 0x9e3779b97f4a7c15ULL);
    z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9ULL;
    z = (z ^ (z >> 27)) * 0x94d049bb133111ebULL;
    return z ^ (z >> 31);
}

static void autoseed(void) {
    // Portable seed entropy sources
    void* heap_ptr = malloc(1);
    uint64_t seed = 0x243F6A8885A308D3ULL;  // Arbitrary initial value (fractional part of pi)
    uint64_t entropy[] = {
        (uint64_t)time(NULL),               // Seconds since epoch
        (uint64_t)(uintptr_t)&entropy,      // Stack address (ASLR)
        (uint64_t)(uintptr_t)&printf,       // Code address (ASLR)
        (uint64_t)(uintptr_t)heap_ptr,      // Heap address (ASLR)
        get_time_us(),                      // Microsecond timestamp (wall-clock time)
    };
    free(heap_ptr);
    
    // Mix entropy sources using splitmix64
    for (size_t i = 0; i < COUNT_OF(entropy); i++) {
        seed ^= entropy[i];
        seed = splitmix64(&seed);
    }
    
    // Seed the RNG state
    for (int i = 0; i < COUNT_OF(s); i++) {
        s[i] = (uint32_t)splitmix64(&seed);
    }
}

bool parseArg(int argc, char* argv[]) {
    bool dump_state = false;
    int i = 1;
    
    // Check for -i flag
    if (argc > 1 && strcmp(argv[1], "-i") == 0) {
        dump_state = true;
        i = 2;
    }
    
    // Check if we have the correct number of parameters
    if (argc - i != (int)COUNT_OF(p)) {
        fprintf(stderr,
                "Error: expected exactly %zu decimal integer%s for p[].\n"
                "Usage: %s [-i] <p[0]> ... <p[%zu]>\n",
                (size_t)COUNT_OF(p),
                COUNT_OF(p) == 1 ? "" : "s",
                argv[0],
                (size_t)COUNT_OF(p) - 1);
        exit(EXIT_FAILURE);
    }

    // Parse the parameters
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
    
    return dump_state;
}

int main(int argc, char* argv[]) {
    FILE* fp = freopen(NULL, "wb", stdout); // Only necessary on Windows, but harmless.
    assert(fp);

    memset(s, 0, sizeof(s));

    bool dump_state = parseArg(argc, argv);

    // Seed until we get a non-zero state
    while (1) {
        bool all_zero = true;
        for (size_t i = 0; i < COUNT_OF(s); i++) {
            all_zero &= (s[i] == 0);
        }

        if (!all_zero) {
            break;
        }

        autoseed();
    }

    // Dump state if -i flag was provided
    if (dump_state) {
        fprintf(stderr, "s[] = {");
        for (size_t i = 0; i < COUNT_OF(s); i++) {
            fprintf(stderr, "%s0x%08x", i > 0 ? ", " : " ", s[i]);
        }
        fprintf(stderr, " }\n");

        fprintf(stderr, "p[] = {");
        for (size_t i = 0; i < COUNT_OF(p); i++) {
            fprintf(stderr, "%s%u", i > 0 ? ", " : " ", p[i]);
        }
        fprintf(stderr, " }\n");
    }

    while (1) {
        static uint64_t buffer[ELEMENT_COUNT] __attribute__((aligned(64)));
        static const uint64_t* end = buffer + ELEMENT_COUNT;

        for (uint64_t* p = buffer; p < end; p++) {
            uint64_t u = next() | (((uint64_t)next()) << 32);
            *p = u;
        }

        fwrite((void*)&buffer, BUFFER_SIZE, 1, stdout);
    }

    return 0;
}
