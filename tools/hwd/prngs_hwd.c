#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#if HWD_PRNG_BITS == 64
typedef uint64_t rng_out_t;
#else
typedef uint32_t rng_out_t;
#endif

static inline rng_out_t next() {
    rng_out_t output;
    size_t elements_read = fread(&output, sizeof(output), 1, stdin);
    if (elements_read != 1) {
        fprintf(stderr, "EOF on stdin.\n");
        exit(1);
    }
    return output;
}
