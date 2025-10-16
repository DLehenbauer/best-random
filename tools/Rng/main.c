#include <assert.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <stdlib.h>
#include "../TestU01/common.h"
#include "rng.h"

#define ELEMENT_SIZE (sizeof(uint64_t))
#define BUFFER_SIZE (1 << 20)  // 1MB
#define ELEMENT_COUNT (BUFFER_SIZE / ELEMENT_SIZE)

static uint32_t p0 = 0;
static uint32_t p1 = 0;

int parseArg(int argc, char* argv[], int i) {
    char* arg = argv[i++];
    if (strcmp(arg, "-i") == 0)   { 
        printf("p0 = %d\n", p0);
        printf("p1 = %d\n", p1);
        return 0;
    }

    if (i >= argc) { return 0; }

    uint32_t p = atoi(argv[i++]);
    if (strcmp(arg, "-p0") == 0)  { p0 = p; return i; }
    if (strcmp(arg, "-p1") == 0)  { p1 = p; return i; }

    return 0;
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
            fprintf(stderr, "%s [-i]\n", argv[0]);
            fprintf(stderr, "    -i = info\n");
            return 1;
        }
    }

    init_seed(0);
    rng_set_ext(seed(), seed(), seed(), seed(), p0, p1);

    while (1) {
        static uint64_t buffer[ELEMENT_COUNT];

        for (unsigned int i = 0; i < ELEMENT_COUNT; i++) {
            buffer[i] = rng_u64();
        }

        fwrite((void*) &buffer, BUFFER_SIZE, 1, stdout);
    }

    return 0;
}
