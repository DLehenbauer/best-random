# XSAdd + Weyl sequence

```cpp
uint32_t mix(uint32_t a) {
    a = rot(a, r0);
    a -= rot(z, r1);
    return a;
}

uint32_t hi32() { return mix(x - s); }
uint32_t lo32() { return mix(s - w); }
```
