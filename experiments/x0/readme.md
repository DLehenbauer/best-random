# XSAdd + Weyl sequence

```cpp
const uint32_t S = 0x9e3779b9;

uint32_t mix(uint32_t a) {
    a = rot(a, r0);
    a += rot(y, r1);
    return a;
}

uint32_t hi32() { return mix(x - s); }
uint32_t lo32() { return mix(s - w); }
```
