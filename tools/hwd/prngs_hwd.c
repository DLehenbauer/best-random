#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

static inline uint64_t next() {
    uint64_t u64;
    size_t elements_read = fread(&u64, sizeof(u64), 1, stdin);
    if (elements_read != 1) {
        fprintf(stderr, "EOF on stdin.\n");
        exit(1);
    }
    return u64;
}
