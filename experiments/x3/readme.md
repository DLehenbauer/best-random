```cpp
uint32_t hi32() { return rot(x - z, z) + rot(y, z ^ r0); }
uint32_t lo32() { return rot(w - x, x) + rot(z, x ^ r1); }
```

Mod3: 4

```cpp
uint32_t hi32() { return rot(x + y, y) - rot(z, y ^ r0); }
uint32_t lo32() { return rot(w - x, w) + rot(z, w ^ r1); }
```

Mod3: H

```cpp
uint32_t hi32() { return rot(x - z, z) + rot(y, z ^ r0); }
uint32_t lo32() { return rot(w - x, x) + rot(y, x ^ r1); }
```

Mod3: 2

```cpp
uint32_t hi32() { return rot(x - z, z) - rot(y, z ^ r0); }
uint32_t lo32() { return rot(y - x, x) - rot(z, x ^ r1); }
```

Mod3: 3

```cpp
uint32_t hi32() { return r0 * rot(x * r1); }
uint32_t lo32() { return r1 * rot(z * r0); }
```

Mod3: 1

```cpp
uint32_t mix(uint32_t a, uint32_t b) {
    a = rot(a, z ^ r0);
    a ^= rot(b, z);
    return a;
}

uint32_t hi32() { return mix(x - z, y); }
uint32_t lo32() { return mix(z - y, x); }
```
z=27: BCFN begins to fail at 512gb.  Mod3 good at 1 tera.

  ┌─────────┬────┬────┬────────────┬───────┬────────┬──────────────┐
  │ (index) │ p0 │ p1 │ evaluation │   p   │ passed │    worst     │
  ├─────────┼────┼────┼────────────┼───────┼────────┼──────────────┤
  │    0    │ 25 │ 0  │    'ok'    │ 0.972 │   1    │ { p: 0.972 } │
  │    1    │ 30 │ 0  │    'ok'    │ 0.972 │   1    │ { p: 0.972 } │
  │    2    │ 21 │ 0  │    'ok'    │ 0.919 │   1    │ { p: 0.919 } │
  │    3    │ 12 │ 0  │    'ok'    │ 0.87  │   1    │ { p: 0.87 }  │
  │    4    │ 17 │ 0  │    'ok'    │ 0.841 │   1    │ { p: 0.841 } │
  │    5    │ 19 │ 0  │    'ok'    │ 0.667 │   1    │ { p: 0.667 } │
  │    6    │ 20 │ 0  │    'ok'    │ 0.654 │   1    │ { p: 0.654 } │
  │    7    │ 8  │ 0  │    'ok'    │ 0.646 │   1    │ { p: 0.646 } │
  │    8    │ 7  │ 0  │    'ok'    │ 0.645 │   1    │ { p: 0.645 } │
  │    9    │ 9  │ 0  │    'ok'    │ 0.627 │   1    │ { p: 0.627 } │
  └─────────┴────┴────┴────────────┴───────┴────────┴──────────────┘
