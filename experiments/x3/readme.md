```cpp
uint32_t hi32() { return rot(x - z, z) + rot(y, z ^ r0); }
uint32_t lo32() { return rot(w - x, x) + rot(z, x ^ r1); }
```

Mod3: All fail by 1TB
