#include "TestU01.h"
#include "common.h"
#include <stdbool.h>
#include <stdio.h>
#include <time.h>
#include "generators/pcg_basic.h"

pcg32_random_t rng;

static inline uint32_t gen32() { return pcg32_random_r(&rng); }
static inline uint32_t gen32_rev() { return reverse32(gen32()); }

unif01_Gen *createGenerator(bool high32, bool low32, bool reversed)
{
    if (high32) { printf("\nWarning: '-h' ignored for 32bit generator.\n"); }
    if (low32)  { printf("\nWarning: '-l' ignored for 32bit generator.\n"); }

    pcg32_srandom_r(&rng, time(NULL) ^ (intptr_t) &printf, (intptr_t) &createGenerator);

    return reversed
        ? unif01_CreateExternGenBits("PCG32 (reversed)", gen32_rev)
        : unif01_CreateExternGenBits("PCG32", gen32);
}
