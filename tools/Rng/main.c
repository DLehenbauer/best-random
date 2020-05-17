#include <assert.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <sys/time.h>
#include "rng.h"

#define ELEMENT_COUNT 255
#define BUFFER_SIZE (sizeof(uint32_t) * ELEMENT_COUNT)

static bool emitHi = true;
static bool emitLo = true;
static bool reverse = false;

uint32_t reverse32(uint32_t v) {
    v = ((v >> 1) & 0x55555555) | ((v & 0x55555555) << 1);
    v = ((v >> 2) & 0x33333333) | ((v & 0x33333333) << 2);
    v = ((v >> 4) & 0x0F0F0F0F) | ((v & 0x0F0F0F0F) << 4);
    v = ((v >> 8) & 0x00FF00FF) | ((v & 0x00FF00FF) << 8);
    v = (v >> 16) | (v << 16);

    return v;
}

bool parseArg(char* arg) {
    if (strcmp(arg, "-h") == 0)   { emitLo = false; return emitHi; }
    if (strcmp(arg, "-l") == 0)   { emitHi = false; return emitLo; }
    if (strcmp(arg, "-r") == 0)   { reverse = true; return true; }

    return false;
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

    for (int i = 1; i < argc; i++) {
        if (!parseArg(argv[i])) {
            fprintf(stderr, "%s [-h] [-l] [-r]\n", argv[0]);
            fprintf(stderr, "    -h = high 32bits only\n");
            fprintf(stderr, "    -l = low 32bits only\n");
            fprintf(stderr, "    -r = reverse bits\n");
            return 1;
        }
    }

    struct timeval start;
    gettimeofday(&start, NULL);

    uint32_t x = start.tv_sec * 1000000 + start.tv_usec;
    uint32_t y = (intptr_t) &printf;
    uint32_t z = (intptr_t) &gettimeofday;
    uint32_t w = (intptr_t) &reverse32;

    rng_init(x, y, z, w);

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
