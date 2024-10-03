#pragma once

#include <stdint.h>

void rng_set(uint32_t s0, uint32_t s1, uint32_t s2, uint32_t s3);
void rng_set_ext(uint32_t s0, uint32_t s1, uint32_t s2, uint32_t s3, uint32_t p0, uint32_t p1);
void rng_get(uint32_t* s0, uint32_t* s1, uint32_t* s2, uint32_t* s3, uint32_t* p0, uint32_t* p1);
void rng_expose(uint32_t** s0, uint32_t** s1, uint32_t** s2, uint32_t** s3);
uint64_t rng_u64();
uint32_t rng_u32h();
uint32_t rng_u32l();
uint32_t get_index(uint32_t r, uint32_t i);
