#include <stdbool.h>
#include <stdio.h>
#include <sys/time.h>
#include "TestU01.h"
#include "common.h"
#include "../rng/rng.h"

uint32_t gen32_high() { return rng_u32h(); }
uint32_t gen32_high_rev() { return reverse32(gen32_high()); }
uint32_t gen32_low() { return rng_u32l(); }
uint32_t gen32_low_rev() { return reverse32(gen32_low()); }

uint32_t shift = 0;
uint64_t value = 0;

uint32_t gen32() {
    shift ^= 32;

    if (shift) {
        value = rng_u64();
    }

    return value >> shift;
}

uint32_t gen32_rev() { return reverse32(gen32()); }

unif01_Gen *createGenerator(bool high32, bool low32, bool reversed)
{
    struct timeval start;
    gettimeofday(&start, NULL);

    uint32_t x = start.tv_sec * 1000000 + start.tv_usec;
    uint32_t y = (intptr_t) &printf;
    uint32_t z = (intptr_t) &gettimeofday;
    uint32_t w = (intptr_t) &gen32;

    for (int i = 0; i < 7; i++) {
        gen32_high();
    }

    printf("\nseed: %x %x %x %x\n", x, y, z, w);
    rng_init(x, y, z, w);

    if (high32)
    {
        return reversed
            ? unif01_CreateExternGenBits("best-random (high 32b reversed)", gen32_high_rev)
            : unif01_CreateExternGenBits("best-random (high 32b)", gen32_high);
    }
    else if (low32)
    {
        return reversed
            ? unif01_CreateExternGenBits("best-random (low 32b reversed)", gen32_high_rev)
            : unif01_CreateExternGenBits("best-random (low 32b)", gen32_high);
    }
    else
    {
        return reversed
            ? unif01_CreateExternGenBits("best-random (high 32b / low32b interleaved reversed)", gen32_rev)
            : unif01_CreateExternGenBits("best-random (high 32b / low32b interleaved)", gen32);
    }
}
