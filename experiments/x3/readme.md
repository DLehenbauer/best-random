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
r0=27: BCFN begins to fail at 512gb.  Mod3 good at 1 tera.

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

```cpp
uint32_t hi32() { return rot(x - z, z ^ r0) ^ rot(y, z); }
uint32_t lo32() { return rot(z - y, z ^ r1) ^ rot(x, z); }
```
```
  ┌─────────┬────┬────┬────────────┬───────┬────────┬─────────────────────────────────────┐
  │ (index) │ p0 │ p1 │ evaluation │   p   │ passed │                worst                │
  ├─────────┼────┼────┼────────────┼───────┼────────┼─────────────────────────────────────┤
  │    0    │ 23 │ 19 │    'ok'    │ 0.995 │   13   │    { name: 'rda 1/1', p: 0.34 }     │
  │    1    │ 21 │ 15 │    'ok'    │ 0.991 │   13   │    { name: 'z9 1/1', p: 0.305 }     │
  │    2    │ 15 │ 21 │    'ok'    │ 0.988 │   13   │     { name: 'z9 1/1', p: 0.29 }     │
  │    3    │ 22 │ 31 │    'ok'    │ 0.943 │   13   │ { name: 'binr -c 1/280', p: 0.198 } │
  │    4    │ 23 │ 23 │    'ok'    │ 0.943 │   13   │ { name: 'binr -c 1/280', p: 0.198 } │
  │    5    │ 21 │ 27 │    'ok'    │ 0.942 │   13   │   { name: 'sh5da 1/1', p: 0.197 }   │
  │    6    │ 15 │ 19 │    'ok'    │ 0.927 │   13   │  { name: 'diff12 1/7', p: 0.182 }   │
  │    7    │ 31 │ 17 │    'ok'    │ 0.925 │   13   │    { name: 'z9 1/1', p: 0.181 }     │
  │    8    │ 22 │ 14 │    'ok'    │ 0.873 │   13   │   { name: 'z9 -t 1/1', p: 0.147 }   │
  │    9    │ 22 │ 29 │    'ok'    │ 0.844 │   13   │   { name: 'sh5da 1/1', p: 0.133 }   │
  └─────────┴────┴────┴────────────┴───────┴────────┴─────────────────────────────────────┘
```

2TB+, Crush x25 @ 72-80%, Mod3 to 2e+13+ bytes
Both 32b reversed had 2 failures in 'CollisionOver, t=20' tests
``` cpp
uint32_t hi32() { return rot(x - z, z ^ 23) + rot(y, z); }
uint32_t lo32() { return rot(z - y, y) ^ rot(x, y ^ 19); }
```

```cpp
uint32_t hi32() { return rot(x ^ z, z) + rot(y, z ^ 23); }
uint32_t lo32() { return rot(z ^ y, y) + rot(x, y ^ 19); }
```
2TB reported unusual BCFN.  Strong high crush (88-84%).  Mod3 good at 2e+13+

```cpp
uint32_t hi32() { return rot(x - z, z) - rot(y, z ^ r0); }
uint32_t lo32() { return rot(y - x, x) + rot(w, x ^ r1); }
```
Mod3 fails at huge (460)

```cpp
uint32_t hi32() { return rot(x - z, z) + rot(y, z ^ 22); }
uint32_t lo32() { return rot(z - y, x) + rot(w, x ^ 27); }
```
Mod3 fails at tera (33)

```cpp
uint32_t hi32() { return rot(x ^ z, z ^ 23) + rot(y, z); }
uint32_t lo32() { return rot(z - y, y) ^ rot(x, y ^ 19); }
```
4TB reported unusual FPF, hi32 weaker than lo32.

```cpp
uint32_t hi32() { return rot(x - z, z) ^ rot(y, z ^ 23); }
uint32_t lo32() { return rot(z - y, y) ^ rot(x, y ^ 19); }
```
2TB reported unusal BCFN, hi crush x20 @ 80%

```cpp
uint32_t hi32() { return rot(x - z, z) ^ rot(y, z ^ r0); }
uint32_t lo32() { return rot(z - y, y) ^ rot(w, y ^ r1); }
```
Best tera: 31/22

```cpp
uint32_t hi32() { return rot(x - z, 29) + rot(y, 14); }
uint32_t lo32() { return rot(z - y, 20) - rot(x, 5); }
```
One passed huge w/p=0.198, BCFN unusual @128gb, mod3 not looking good at 5e+11.

```cpp
uint32_t hi32() { return rot(x - z, 20) + rot(y, 5); }
uint32_t lo32() { return rot(z - y, 5) - rot(x, 22); }
```
u32h/l fail at 64gb, mod3 ok to 1.5e+13, crush h:76/84, l:64/60

-----

```cpp
uint32_t hi32() { return (x - z) ^ rot(y, r0); }
uint32_t lo32() { return (z - y) ^ rot(x, r1); }
```
56 pass 'standard':
  ┌─────────┬────┬────┬───────────────────────────────────────┬────────────┬────────┬──────────────────────────────────────┐
  │ (index) │ p0 │ p1 │ evaluation                            │ p          │ passed │ worst                                │
  ├─────────┼────┼────┼───────────────────────────────────────┼────────────┼────────┼──────────────────────────────────────┤
  │ 0       │ 16 │ 18 │ 'ok'                                  │ 0.991      │ 13     │ { name: 'z9 1/1', p: 0.303 }         │
  │ 1       │ 17 │ 14 │ 'ok'                                  │ 0.984      │ 13     │ { name: 'rda16 1/12', p: 0.273 }     │
  │ 2       │ 17 │ 15 │ 'ok'                                  │ 0.967      │ 13     │ { name: 'lownda 1/2', p: 0.23 }      │
  │ 3       │ 14 │ 17 │ 'ok'                                  │ 0.932      │ 13     │ { name: 'slicerda 1/3', p: 0.187 }   │
  │ 4       │ 17 │ 17 │ 'ok'                                  │ 0.899      │ 13     │ { name: 'mod3 1/1', p: 0.162 }       │
  │ 5       │ 16 │ 19 │ 'ok'                                  │ 0.868      │ 13     │ { name: 'slicerda 1/3', p: 0.144 }   │
  │ 6       │ 15 │ 15 │ 'ok'                                  │ 0.857      │ 13     │ { name: 'sh5da 1/1', p: 0.139 }      │
  │ 7       │ 17 │ 13 │ 'ok'                                  │ 0.846      │ 13     │ { name: 'slicerda 1/3', p: 0.134 }   │
  │ 8       │ 18 │ 17 │ 'ok'                                  │ 0.846      │ 13     │ { name: 'v256 1/1', p: 0.134 }       │
  │ 9       │ 17 │ 18 │ 'ok'                                  │ 0.805      │ 13     │ { name: 'binr -c 1/280', p: 0.118 }  │


```cpp
uint32_t hi32() { return (x - z) ^ rot(y, r0); }
uint32_t lo32() { return (z ^ y) - rot(x, r1); }
```

65 pass 'standard':

completed: 599/0 (standard)   ok: 65 (10.85%)   unusual: 67 (11.19%)   worrying: 467 (77.96%)
  pMin: 4.8e-123   pAvg: 0.051   pMax: 0.981

Best
  ┌─────────┬────┬────┬───────────────────────────────────────┬────────────┬────────┬──────────────────────────────────────┐
  │ (index) │ p0 │ p1 │ evaluation                            │ p          │ passed │ worst                                │
  ├─────────┼────┼────┼───────────────────────────────────────┼────────────┼────────┼──────────────────────────────────────┤
  │ 0       │ 19 │ 17 │ 'ok'                                  │ 0.981      │ 13     │ { name: 'selfcor 1/1', p: 0.262 }    │
  │ 1       │ 15 │ 15 │ 'ok'                                  │ 0.972      │ 13     │ { name: 'mod3 1/1', p: 0.24 }        │
  │ 2       │ 15 │ 18 │ 'ok'                                  │ 0.971      │ 13     │ { name: 'z9 1/1', p: 0.239 }         │
  │ 3       │ 19 │ 16 │ 'ok'                                  │ 0.963      │ 13     │ { name: 'binr -c 1/280', p: 0.224 }  │
  │ 4       │ 12 │ 17 │ 'ok'                                  │ 0.958      │ 13     │ { name: 'sh5da 1/1', p: 0.217 }      │
  │ 5       │ 16 │ 20 │ 'ok'                                  │ 0.95       │ 13     │ { name: 'sh5da 1/1', p: 0.206 }      │
  │ 6       │ 14 │ 15 │ 'ok'                                  │ 0.939      │ 13     │ { name: 'mod3 1/1', p: 0.194 }       │
  │ 7       │ 13 │ 17 │ 'ok'                                  │ 0.886      │ 13     │ { name: 'z9 1/1', p: 0.154 }         │
  │ 8       │ 16 │ 17 │ 'ok'                                  │ 0.886      │ 13     │ { name: 'sh5da 1/1', p: 0.154 }      │
  │ 9       │ 16 │ 14 │ 'ok'                                  │ 0.87       │ 13     │ { name: 'z9 1/1', p: 0.145 }         │

```cpp
uint32_t hi32() { return (x - z) ^ rot(y, r0); }
uint32_t lo32() { return (z + y) ^ rot(x, r1); }
```
ok: 42 (7.39%) pMin: 4.97e-104   pAvg: 0.022   pMax: 0.948

  ┌─────────┬────┬────┬───────────────────────────────────────┬────────────┬────────┬───────────────────────────────────────┐
  │ (index) │ p0 │ p1 │ evaluation                            │ p          │ passed │ worst                                 │
  ├─────────┼────┼────┼───────────────────────────────────────┼────────────┼────────┼───────────────────────────────────────┤
  │ 0       │ 18 │ 15 │ 'ok'                                  │ 0.948      │ 13     │ { name: 'sh5da 1/1', p: 0.204 }       │
  │ 1       │ 17 │ 18 │ 'ok'                                  │ 0.816      │ 13     │ { name: 'sh5da 1/1', p: 0.122 }       │
  │ 2       │ 16 │ 18 │ 'ok'                                  │ 0.805      │ 13     │ { name: 'binr -c 1/280', p: 0.118 }   │
  │ 3       │ 17 │ 14 │ 'ok'                                  │ 0.774      │ 13     │ { name: 'z9 1/1', p: 0.108 }          │
  │ 4       │ 16 │ 17 │ 'ok'                                  │ 0.605      │ 12     │ { name: 'mod3 1/1', p: 0.069 }        │
  │ 5       │ 16 │ 14 │ 'ok'                                  │ 0.602      │ 12     │ { name: 'z9 1/1', p: 0.0684 }         │
  │ 6       │ 18 │ 13 │ 'ok'                                  │ 0.558      │ 12     │ { name: 'binr -c 1/280', p: 0.0608 }  │
  │ 7       │ 15 │ 14 │ 'ok'                                  │ 0.537      │ 12     │ { name: 'mod3 1/1', p: 0.0575 }       │
  │ 8       │ 14 │ 15 │ 'ok'                                  │ 0.526      │ 11     │ { name: 'mod3 1/1', p: 0.0558 }       │
  │ 9       │ 17 │ 17 │ 'ok'                                  │ 0.496      │ 12     │ { name: 'sh5da 1/1', p: 0.0513 }      │