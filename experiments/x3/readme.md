```cpp
uint32_t hi32() { return rot(x - z, z) + rot(y, z ^ r0); }
uint32_t lo32() { return rot(w - x, x) + rot(z, x ^ r1); }
```

| r0 | r1 |       Test           |
|----|----|----------------------|
| 12 | 24 | Mod3: 2.49e-10 @ 1.5e+12 |
| 14 | 16 | Mod3: 1.2e-10 @ 1.5e+12 |
| 14 | 26 | Mod3: 6.91e-08 @ 1e+12 |
| 20 |  2 | Mod3: 2.63e-09 @ 7e+11 |
