#include <stdbool.h>
#include <stdio.h>
#include "TestU01.h"
#include "common.h"
#include "../Rng/rng.h"

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
    uint32_t x = seed();
    uint32_t y = seed();
    uint32_t z = seed();
    uint32_t w = seed();

    rng_set(x, y, z, w);

    uint32_t p0;
    uint32_t p1;

    rng_get(&x, &y, &z, &w, &p0, &p1);
    printf("\nNext seed: %08x %08x %08x %08x (p0=%d p1=%d)\n", x, y, z, w, p0, p1);

    if (high32)
    {
        return reversed
            ? unif01_CreateExternGenBits("best-random (high 32b reversed)", gen32_high_rev)
            : unif01_CreateExternGenBits("best-random (high 32b)", gen32_high);
    }
    else if (low32)
    {
        return reversed
            ? unif01_CreateExternGenBits("best-random (low 32b reversed)", gen32_low_rev)
            : unif01_CreateExternGenBits("best-random (low 32b)", gen32_low);
    }
    else
    {
        return reversed
            ? unif01_CreateExternGenBits("best-random (high 32b / low32b interleaved reversed)", gen32_rev)
            : unif01_CreateExternGenBits("best-random (high 32b / low32b interleaved)", gen32);
    }
}
