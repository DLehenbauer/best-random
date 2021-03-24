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