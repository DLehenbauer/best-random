# Multipliers for LCGs with m=2<sup>32</sup>

### [Computationally Easy, Spectrally Good Multipliers for Congruential Pseudorandom Number Generators](https://labs.oracle.com/pls/apex/f?p=LABS:0:0:APPLICATION_PROCESS=GETDOC_INLINE:::DOC_ID:1360)

| a | H<sup>∗</sup><sub>8</sub>(m, a) | M<sup>∗</sup><sub>8</sub>(m, a) | f2 | f3 | f4 | f5 | f6 | λ |
|-|-|-|-|-|-|-|-|-|
| 0xadb4a92d = 2914298157 = (3)(4133)(235043)        | 0.8875 | 0.7289 | 0.9759 | 0.9362 | 0.7558 | 0.8776 | 0.7513 | 4.4 × 10<sup>4</sup> |
| 0xa13fc965 = 2705312101 = (929)(2912069)           | 0.8486 | 0.7552 | 0.8969 | 0.8469 | 0.8044 | 0.8452 | 0.7939 | 4.1 × 10<sup>4</sup> |
| 0x8664f205 = 2254762501 = (241)<sup>2</sup>(38821) | 0.7925 | 0.7649 | 0.7996 | 0.7987 | 0.7792 | 0.7945 | 0.7649 | 3.4 × 10<sup>4</sup> |
| 0xcf019d85 = 3472989573 = (3)(113)(10244807)       | 0.8720 | 0.7395 | 0.9512 | 0.8868 | 0.9037 | 0.7427 | 0.7474 | 5.3 × 10<sup>4</sup> |

### [Tables of Linear Congruential Generators of Different Sizes and Good Lattice Structure](https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf)

| a | M8(m, a) | M16(m, a) | M32(m, a) |
|-|-|-|-|
| 0xac564b05 = 2891336453 = (29)(99701257)  | 0.75466∗ | 0.56806  | 0.56806  |
| 0x01c8e815 = 29943829   = (19)(1575991)   | 0.67429  | 0.67105∗ | 0.58062  |
| 0x01ed0675 = 32310901   = (7)(29)(159167) | 0.65630  | 0.65336  | 0.65336∗ |

# Multipliers for MCGs with m=2<sup>32</sup>

### [Computationally Easy, Spectrally Good Multipliers for Congruential Pseudorandom Number Generators](https://labs.oracle.com/pls/apex/f?p=LABS:0:0:APPLICATION_PROCESS=GETDOC_INLINE:::DOC_ID:1360)

| a | H<sup>∗</sup><sub>8</sub>(m, a) | M<sup>∗</sup><sub>8</sub>(m, a) | f2 | f3 | f4 | f5 | f6 | λ |
|-|-|-|-|-|-|-|-|-|
| 0xae3cc725 = 2923218725 = (5)<sup>2</sup>(7)<sup>2</sup>(2386301) | 0.8799 | 0.7395 | 0.9789 | 0.9054 | 0.8330 | 0.7532 | 0.7741 | 8.9 × 10<sup>4</sup> |
| 0x9fe72885 = 2682726533 = (306913)(8741)                          | 0.8311 | 0.7523 | 0.8576 | 0.8584 | 0.8799 | 0.7589 | 0.7565 | 8.2 × 10<sup>4</sup> |
| 0xae36bfb5 = 2922823605 = (3)(5)(13)(2767)(5417)                  | 0.8239 | 0.7616 | 0.8405 | 0.8791 | 0.7703 | 0.7887 | 0.8276 | 8.9 × 10<sup>4</sup> |
| 0x82c1fcad = 2193751213 = (17)(541)(238529)                       | 0.8799 | 0.7395 | 0.9789 | 0.9054 | 0.8330 | 0.7532 | 0.7741 | 6.7 × 10<sup>4</sup> |

### [Tables of Linear Congruential Generators of Different Sizes and Good Lattice Structure](https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf)

| a | a<sup>*</sup> = a<sup>m/4−1</sup> mod 2<sup>32</sup> | M8(m, a) | M16(m, a) | M32(m, a) |
|------------|-----------|---------------------|---------------------|---------------------|
| 0x2c2c57ed =  741103597 = (13)(83)(686843) | 0x34ed9de5 = 887987685 = (3)(5)(13)<sup>2</sup>(29)(47)(257)  | 0.75652<sup>∗</sup> | 0.53707             | 0.53707             |
| 0x5f356495 = 1597334677 = (929)(1719413)   | 0x32c446bd = 851723965 = (5)(170344793)                       | 0.70068             | 0.67686<sup>∗</sup> | 0.64694             |
| 0x2c9277b5 =  747796405 = (5)(5387)(27763) | 0x0c2bfe9d = 204209821 = (107)(233)(8191)                     | 0.66893             | 0.66001             | 0.66001<sup>∗</sup> |

Notes:
* a<sup>*</sup> produces the same sequence as a, but in reverse order.

### Others

| a | Source |
|---|--------|
| 0x6c078965 = 1812433253 = (1289)(1406077) | [Borosh-Niederreiter](https://www.gnu.org/software/gsl/doc/html/rng.html#c.gsl_rng_borosh13) |
| 0x01000193 = 16777619 = (16777619)| [32b FNV prime](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function#FNV_hash_parameters) |

# 32b Galois LFSRs with maximum period
```ts
() => a = (a >>> 1) ^ (-(a & 1) & 0xd0000001);
() => a = (a >>> 1) ^ (-(a & 1) & 0x80200003);
```

# Weyl Sequence
| a | Source |
|---|--------|
| 0x9e3779b9 = 2654435769 = (3)(89)(523)(19009) | [Golden ratio](https://softwareengineering.stackexchange.com/questions/402542/where-do-magic-hashing-constants-like-0x9e3779b9-and-0x9e3779b1-come-from) |
| 0x6d2b79f5 = 1831565813 = (7)(11)(859)(27691) | [Mulberry32](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c) |
| 362437 | [xorwow](https://en.wikipedia.org/wiki/Xorshift#xorwow) |

# Permutations
|  shift  | range |
|---------|-------|
| a >> 27 | 0..31 |
| a >> 28 | 0..15 |
| a >> 29 |  0..7 |
| a >> 30 |  0..3 |
| a >> 31 |  0..1 |

