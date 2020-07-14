#include <stdint.h>

void rng_init(uint32_t s0, uint32_t s1, uint32_t s2, uint32_t s3, uint32_t p0, uint32_t p1);
uint64_t rng_u64();
uint32_t rng_u32h();
uint32_t rng_u32l();
