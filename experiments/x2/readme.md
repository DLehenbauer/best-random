# XSAdd (Scrambled)

```cpp
uint32_t mix(uint32_t a) {
    a = rot(a, r0);
    a += rot(y, r1);
    return a;
}

uint32_t hi32() { return mix(x - z); }
uint32_t lo32() { return mix(w - x); }
```

## GJRand (Huge)
p0 | p1 |              evaluation               |     p      | passed |               worst               
---|----|---------------------------------------|------------|--------|----------------------------------
26 | 11 |                 'ok'                  |   0.0637   |   11   | { name: 'z9 -t 1/1', p: 0.00505 }
24 | 9  |                 'ok'                  |   0.0126   |   10   |  { name: 'z9 1/1', p: 0.000977 }

## PractRand
p0 | p1 | Last good               
---|----|-----------
26 | 11 | 8GB    
24 | 9  | 8GB

## SmallCrush (x25)
p0 | p1 |  H  |  HR |  L |  LR |          worst
---|----|-----|-----|----|-----|--------------------------
26 | 11 | 100 | 100 | 96 | 100 | 0.363462 (RandomWalk1 J)
24 |  9 |  96 | 100 | 96 | 100 | 0.348571 (RandomWalk1 M)

# Combined

```cpp
uint32_t hi32() { return rot(x - z, 26) + rot(y, 11); }
uint32_t lo32() { return rot(w - x, 24) + rot(y, 9); }
```
PractRand last good @ 128gb

# Alt
```cpp
uint32_t hi32() { return rot(x + y, 26) - rot(z, 11); }
uint32_t lo32() { return rot(w - x, 7) + rot(z, 23); }
```
PractRand last good @ 128gb

# x/y/z only
```cpp
uint32_t hi32() { return rot(x - z, z) - rot(y, z ^ 27); }
uint32_t lo32() { return rot(y - x, x) - rot(z, x ^ 14); }
```
PractRand last good @64gb (mod3n)

```cpp
uint32_t hi32() { return rot(x - z, z) - rot(y, z ^ 15); }
uint32_t lo32() { return rot(z, x ^ 16) - rot(y - x, x); }
```
PractRand last good @64gb (mod3n)

```cpp
uint32_t hi32() { return rot(x - z, z) - rot(y, z ^ 19); }
uint32_t lo32() { return rot(z ^ y, z ^ 6) - rot(w, z ^ 10); }
```
676 passed GRand Big

```cpp
uint32_t hi32() { return rot(x * 1099087573, z) - rot(y, z ^ 8); }
uint32_t lo32() { return rot(z * 4028795517, y) - rot(w, y ^ 18); }
```
PractRand good @ 256gb

```cpp
uint32_t hi32() { return rot(x * 641822286, y) - rot(z, y ^ 16); }
uint32_t lo32() { return rot(y * 233254402, z) - rot(x, z ^ 9); }
```
PractRand still good @ 1TB  (692 passed big: try with 6/16?)

│    0    │ 6  │ 16 │    'ok'    │   1   │   13   │   { name: 'mod3 1/1', p: 0.511 }    │
│    1    │ 16 │ 9  │    'ok'    │   1   │   13   │ { name: 'binr -c 1/280', p: 0.508 } │

```cpp
uint32_t hi32() { return rot(x - z, z) ^ rot(y, z ^ 16); }
uint32_t lo32() { return rot(z - w, w) ^ rot(x, w ^ 8); }
```
PractRand last good at 32gb.

```cpp
uint32_t hi32() { return rot(x + y, z) - rot(z, z ^ 16); }
uint32_t lo32() { return rot(w - x, x) + rot(z, x ^ 9); }
```
PractRand last good at 256gb.

  │    0    │ 27 │ 20 │    'ok'    │ 0.998 │   13   │  { name: 'diff12 1/7', p: 0.377 }   │
  │    1    │ 27 │ 16 │    'ok'    │ 0.996 │   13   │   { name: 'z9 -t 1/1', p: 0.352 }   │
  │    2    │ 19 │ 20 │    'ok'    │ 0.995 │   13   │   { name: 'sh5da 1/1', p: 0.338 }   │
  │    3    │ 20 │ 15 │    'ok'    │ 0.995 │   13   │   { name: 'mod3 1/1', p: 0.335 }    │

```cpp
uint32_t hi32() { return rot(x + y, z) - rot(z, z ^ r0); }
uint32_t lo32() { return rot(w - y, x) + rot(x, x ^ r1); }
```
GJRand Big: P = 0.674 : ok
Mod3: p = 0.000644 @ 1.5e+10

```cpp
uint32_t hi32() { return rot(x - z, z) + rot(y, z ^ r0); }
uint32_t lo32() { return rot(z, x ^ r1) ^ rot(x + y, x); }
```
Mod3: p = 0.84 @ 2e+10

```cpp
uint32_t hi32() { return rot(x - z, z) - rot(y, z ^ 27); }
uint32_t lo32() { return rot(z, y) - rot(y - x, y ^ 20); }
```
Mod3: p = 0.84 @ 7e+10

```cpp
uint32_t hi32() { return rot(x * 25, z) + rot(y, z ^ 25); }
uint32_t lo32() { return rot(x * 19, y) - rot(z, y ^ 27); }

```
practrand last good at 32gb, but mod3 still good at 1e+13

