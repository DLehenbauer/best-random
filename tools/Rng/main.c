#include <assert.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <stdlib.h>
#include "../TestU01/common.h"
#include "rng.h"

#define ELEMENT_COUNT 255
#define BUFFER_SIZE (sizeof(uint32_t) * ELEMENT_COUNT)

static bool emitHi = true;
static bool emitLo = true;
static bool reverse = false;
static uint32_t p0 = 0;
static uint32_t p1 = 0;

int parseArg(int argc, char* argv[], int i) {
    char* arg = argv[i++];
    if (strcmp(arg, "-h") == 0)   { emitLo = false; return emitHi ? i : 0; }
    if (strcmp(arg, "-l") == 0)   { emitHi = false; return emitLo ? i : 0; }
    if (strcmp(arg, "-r") == 0)   { reverse = true; return i; }
    if (strcmp(arg, "-i") == 0)   { 
        printf("p0 = %d\n", p0);
        printf("p1 = %d\n", p1);
        printf("a0 = %d\n", get_index(p0, 0));
        printf("b0 = %d\n", get_index(p0, 1));
        printf("c0 = %d\n", get_index(p0, 2));
        printf("d0 = %d\n", get_index(p0, 3));
        printf("e0 = %d\n", get_index(p0, 4));
        printf("f0 = %d\n", get_index(p0, 5));
        printf("a1 = %d\n", get_index(p1, 0));
        printf("b1 = %d\n", get_index(p1, 1));
        printf("c1 = %d\n", get_index(p1, 2));
        printf("d1 = %d\n", get_index(p1, 3));
        printf("e1 = %d\n", get_index(p1, 4));
        printf("f1 = %d\n", get_index(p1, 5));
        return 0;
    }

    if (i >= argc) { return 0; }

    uint32_t p = atoi(argv[i++]);
    if (strcmp(arg, "-p0") == 0)  { p0 = p; return i; }
    if (strcmp(arg, "-p1") == 0)  { p1 = p; return i; }

    return 0;
}

static inline void write(uint32_t value) {
    static uint32_t buffer[ELEMENT_COUNT];
    static int i = 0;

    if (i == ELEMENT_COUNT) {
        fwrite((void*) &buffer, sizeof(uint32_t), ELEMENT_COUNT, stdout);
        i = 0;
    }

    buffer[i++] = value;
}

int main(int argc, char *argv[]) {
    FILE* fp = freopen(NULL, "wb", stdout);  // Only necessary on Windows, but harmless.
    assert(fp);

    // Get the default values for p0/p1 from the RNG
    uint32_t unused;
    rng_get(&unused, &unused, &unused, &unused, &p0, &p1);

    for (int i = 1; i < argc;) {
        i = parseArg(argc, argv, i);
        if (i == 0) {
            fprintf(stderr, "%s [-h] [-l] [-r]\n", argv[0]);
            fprintf(stderr, "    -h = high 32bits only\n");
            fprintf(stderr, "    -l = low 32bits only\n");
            fprintf(stderr, "    -r = reverse bits\n");
            fprintf(stderr, "    -i = info\n");
            return 1;
        }
    }

    init_seed(0);
    rng_set_ext(seed(), seed(), seed(), seed(), p0, p1);

    while (1) {
        uint64_t raw = rng_u64();
        uint32_t value;

        if (emitLo) {
            value = raw;
            if (reverse) { value = reverse32(value); }
            write(value);
        }

        if (emitHi) {
            value = raw >> 32;
            if (reverse) { value = reverse32(value); }
            write(value);
        }
    }

    return 0;
}
