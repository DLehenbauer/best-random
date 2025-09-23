```
r0=3375 r1=754
uint32_t hi32() { return rot(w + w, z) + rot(x, y); }
uint32_t lo32() { return rot(z - x, w) - rot(w, z); }
```

completed: 37/37 (100.00%)   ok: 0 (0.00%)   unusual: 20 (54.05%)   worrying: 17 (45.95%)
  pMin: 1.13e-87   pAvg: 0   pMax: 0.000377

Best Worst
  ┌─────────┬──────┬──────┬───────────────────────────────────────┬────────────┬────────┬───────────────────────────────────────┐
  │ (index) │ p0   │ p1   │ evaluation                            │ p          │ passed │ worst                                 │
  ├─────────┼──────┼──────┼───────────────────────────────────────┼────────────┼────────┼───────────────────────────────────────┤
  │ 0       │ 3288 │ 775  │ 'unusual'                             │ 0.000377   │ 10     │ { name: 'mod3 1/1', p: 0.000029 }     │
  │ 1       │ 1079 │ 3522 │ 'unusual'                             │ 0.000266   │ 10     │ { name: 'mod3 1/1', p: 0.0000205 }    │
  │ 2       │ 3282 │ 775  │ 'unusual'                             │ 0.0000978  │ 11     │ { name: 'lownda 1/2', p: 0.00000752 } │
  │ 3       │ 3298 │ 567  │ 'unusual'                             │ 0.0000381  │ 11     │ { name: 'mod3 1/1', p: 0.00000293 }   │
  │ 4       │ 3522 │ 1079 │ 'unusual'                             │ 0.0000109  │ 10     │ { name: 'mod3 1/1', p: 8.41e-7 }      │
  │ 5       │ 1992 │ 3645 │ 'unusual'                             │ 0.0000109  │ 10     │ { name: 'mod3 1/1', p: 8.39e-7 }      │
  │ 6       │ 573  │ 3016 │ 'unusual'                             │ 0.00000424 │ 10     │ { name: 'mod3 1/1', p: 3.26e-7 }      │
  │ 7       │ 775  │ 3288 │ 'unusual'                             │ 0.00000192 │ 11     │ { name: 'lownda 1/2', p: 1.48e-7 }    │
  │ 8       │ 3639 │ 1992 │ 'very unusual'                        │ 3.04e-7    │ 11     │ { name: 'mod3 1/1', p: 2.34e-8 }      │
  │ 9       │ 1992 │ 3639 │ 'very unusual'                        │ 1.85e-7    │ 9      │ { name: 'mod3 1/1', p: 1.42e-8 }      │
  │ 10      │ 3010 │ 1559 │ 'very unusual'                        │ 1.46e-7    │ 12     │ { name: 'mod3 1/1', p: 1.12e-8 }      │
  │ 11      │ 1559 │ 3016 │ 'very unusual'                        │ 1.25e-7    │ 11     │ { name: 'mod3 1/1', p: 9.59e-9 }      │
  │ 12      │ 1837 │ 3314 │ 'very unusual'                        │ 4.87e-8    │ 11     │ { name: 'mod3 1/1', p: 3.75e-9 }      │
  │ 13      │ 2274 │ 1591 │ 'very unusual'                        │ 2.55e-8    │ 11     │ { name: 'mod3 1/1', p: 1.96e-9 }      │
  │ 14      │ 3607 │ 968  │ 'Worrying and very unusual'           │ 8.62e-9    │ 10     │ { name: 'mod3 1/1', p: 6.63e-10 }     │
  │ 15      │ 3645 │ 1992 │ 'Worrying and very unusual'           │ 3.44e-9    │ 10     │ { name: 'mod3 1/1', p: 2.65e-10 }     │
  │ 16      │ 3016 │ 1559 │ 'Worrying and very unusual'           │ 7.84e-10   │ 9      │ { name: 'mod3 1/1', p: 6.03e-11 }     │
  │ 17      │ 775  │ 3282 │ 'Worrying and very unusual'           │ 4.78e-10   │ 10     │ { name: 'mod3 1/1', p: 3.68e-11 }     │
  │ 18      │ 1559 │ 3010 │ 'Worrying and very unusual'           │ 4.6e-10    │ 10     │ { name: 'mod3 1/1', p: 3.54e-11 }     │
  │ 19      │ 968  │ 3607 │ 'Worrying and very unusual'           │ 2.01e-10   │ 10     │ { name: 'mod3 1/1', p: 1.55e-11 }     │
  │ 20      │ 567  │ 3298 │ 'EXTREMELY Worrying and very unusual' │ 6.42e-11   │ 11     │ { name: 'mod3 1/1', p: 4.94e-12 }     │
  │ 21      │ 1591 │ 2274 │ 'EXTREMELY Worrying and very unusual' │ 3.55e-11   │ 9      │ { name: 'mod3 1/1', p: 2.73e-12 }     │
  │ 22      │ 1234 │ 2829 │ 'EXTREMELY Worrying and very unusual' │ 5.34e-12   │ 6      │ { name: 'rda 1/1', p: 4.11e-13 }      │
  │ 23      │ 1992 │ 2583 │ 'EXTREMELY Worrying and very unusual' │ 7.29e-13   │ 9      │ { name: 'mod3 1/1', p: 5.61e-14 }     │
  │ 24      │ 2829 │ 1234 │ 'EXTREMELY Worrying and very unusual' │ 1.02e-14   │ 8      │ { name: 'rda 1/1', p: 7.81e-16 }      │
  │ 25      │ 3016 │ 573  │ 'EXTREMELY Worrying and very unusual' │ 9.79e-15   │ 9      │ { name: 'mod3 1/1', p: 7.53e-16 }     │
  │ 26      │ 962  │ 3613 │ 'EXTREMELY Worrying and very unusual' │ 1.33e-16   │ 10     │ { name: 'z9 -t 1/1', p: 1.02e-17 }    │
  │ 27      │ 3314 │ 1837 │ 'EXTREMELY Worrying and very unusual' │ 2.87e-18   │ 10     │ { name: 'mod3 1/1', p: 2.21e-19 }     │
  │ 28      │ 962  │ 3607 │ 'EXTREMELY Worrying and very unusual' │ 2.57e-18   │ 8      │ { name: 'z9 -t 1/1', p: 1.98e-19 }    │
  │ 29      │ 3607 │ 962  │ 'EXTREMELY Worrying and very unusual' │ 7.73e-26   │ 9      │ { name: 'z9 -t 1/1', p: 5.95e-27 }    │
  │ 30      │ 3613 │ 962  │ 'EXTREMELY Worrying and very unusual' │ 7.8e-27    │ 9      │ { name: 'z9 -t 1/1', p: 6e-28 }       │
  │ 31      │ 2107 │ 3520 │ 'EXTREMELY Worrying and very unusual' │ 3.5e-43    │ 7      │ { name: 'rda 1/1', p: 2.69e-44 }      │
  │ 32      │ 2589 │ 968  │ 'EXTREMELY Worrying and very unusual' │ 9.93e-47   │ 9      │ { name: 'z9 -t 1/1', p: 7.64e-48 }    │
  │ 33      │ 2583 │ 968  │ 'EXTREMELY Worrying and very unusual' │ 6.63e-47   │ 9      │ { name: 'z9 -t 1/1', p: 5.1e-48 }     │
  │ 34      │ 968  │ 2583 │ 'EXTREMELY Worrying and very unusual' │ 1.88e-50   │ 9      │ { name: 'z9 -t 1/1', p: 1.45e-51 }    │
  └─────────┴──────┴──────┴───────────────────────────────────────┴────────────┴────────┴───────────────────────────────────────┘
Weakness
  ┌─────────┬──────────────┬──────────┬──────────┐
  │ (index) │ test         │ failures │ percent  │
  ├─────────┼──────────────┼──────────┼──────────┤
  │ 0       │ 'z9 -t 1/1'  │ 8        │ '21.62%' │
  │ 1       │ 'mod3 1/1'   │ 5        │ '13.51%' │
  │ 2       │ 'rda 1/1'    │ 3        │ '8.11%'  │
  │ 3       │ 'nda 1/28'   │ 1        │ '2.70%'  │
  │ 4       │ 'lownda 1/2' │ 0        │ '0.00%'  │
  └─────────┴──────────────┴──────────┴──────────┘