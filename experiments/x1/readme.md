# XSAdd / Scramble 96 -> 64

```cpp
uint32_t mix(uint32_t a) {
    a = rol(a ^ y, r0);
    a -= rol(y, r1);
    return a;
}

uint32_t hi32() { return mix(x); }
uint32_t lo32() { return mix(z); }
```
