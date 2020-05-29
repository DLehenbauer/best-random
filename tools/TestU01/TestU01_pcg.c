#include <stdbool.h>
#include <stdio.h>
#include "TestU01.h"
#include "common.h"
#include "generators/pcg_basic.h"

pcg32_random_t rng;

static inline uint32_t gen32() { return pcg32_random_r(&rng); }
static inline uint32_t gen32_rev() { return reverse32(gen32()); }

unif01_Gen *createGenerator(bool high32, bool low32, bool reversed)
{
    if (high32) { printf("\nWarning: '-h' ignored for 32bit generator.\n"); }
    if (low32)  { printf("\nWarning: '-l' ignored for 32bit generator.\n"); }

    uint64_t x = seed();
    uint64_t y = seed();

    printf("\nNext seed: %016lx %016lx\n", x, y);

    pcg32_srandom_r(&rng, seed(), seed());

    return reversed
        ? unif01_CreateExternGenBits("PCG32 (reversed)", gen32_rev)
        : unif01_CreateExternGenBits("PCG32", gen32);
}
