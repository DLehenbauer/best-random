Notes:
* Permutations that just 'hi32' and 'lo32' should be redundant (except that lownda focusen on lower bits only).
* Testing 'a + b' and 'b + a' were redundant.  One could have been replaced with '^'.
* All final candidates involved 'w' in both hi32() and lo32().

```c
uint32_t get_index(uint32_t r, uint32_t i) {
    i <<= 1;
    uint32_t mask = 0b11 << i;
    return (r & mask) >> i;
}

uint32_t a(uint32_t r) { return get_index(r, 0); }
uint32_t b(uint32_t r) { return get_index(r, 1); }
uint32_t c(uint32_t r) { return get_index(r, 2); }
uint32_t d(uint32_t r) { return get_index(r, 3); }
uint32_t e(uint32_t r) { return get_index(r, 4); }
uint32_t f(uint32_t r) { return get_index(r, 5); }

uint32_t get32(uint32_t r) {
    uint32_t _a = state[a(r)];
    uint32_t _b = state[b(r)];
    uint32_t _c = state[c(r)];
    uint32_t _d = state[d(r)];
    uint32_t _e = state[e(r)];
    uint32_t _f = f(r);

    switch (_f) {
        case 0: return rot(_a - _b, _c) - rot(_d, _e);
        case 1: return rot(_a - _b, _c) + rot(_d, _e);
        case 2: return rot(_a + _b, _c) - rot(_d, _e);
        default: return rot(_a + _b, _c) + rot(_d, _e);
    }
}

uint32_t hi32() { return get32(r0); }
uint32_t lo32() { return get32(r1); }

uint64_t rng_u64() {
    uint64_t t = rng_u32h();
    t <<= 32;
    return t | lo32();
}
```

```js
const process = require("process");

// Access the command line arguments
const args = process.argv.slice(2);

// Check if an argument was provided
if (args.length < 2) {
    console.log('Must provide two integer arguments.');
    process.exit(1);
}

// Parse the argument as an integer
const r0 = parseInt(args[0], 10);
const r1 = parseInt(args[1], 10);

const s = ["x", "y", "z", "w"];

function get_index(r, i) {
    i <<= 1;
    mask = 0b11 << i;
    return (r & mask) >> i;
}

function get_fn(input) {
    const a = s[get_index(input, 0)];
    const b = s[get_index(input, 1)];
    const c = s[get_index(input, 2)];
    const d = s[get_index(input, 3)];
    const e = s[get_index(input, 4)];
    const f = get_index(input, 5);
    
    switch (f) {
        case 0:  return `rot(${a} - ${b}, ${c}) - rot(${d}, ${e})`;
        case 1:  return `rot(${a} - ${b}, ${c}) + rot(${d}, ${e})`;
        case 2:  return `rot(${a} + ${b}, ${c}) - rot(${d}, ${e})`;
        default: return `rot(${a} + ${b}, ${c}) + rot(${d}, ${e})`;
    }
}

console.log(`r0=${r0} r1=${r1}`)
console.log(`uint32_t hi32() { return ${get_fn(r0)}; }`);
console.log(`uint32_t lo32() { return ${get_fn(r1)}; }`);
```

Strongest mix:
```c
uint32_t hi32() { return rot(x + z, r0 & 0x1f) + rot(w, (r0 >> 5) & 0x1f); }
uint32_t lo32() { return rot(w - y, r1 & 0x1f) - rot(x, (r1 >> 5) & 0x1f); }
```

Final Candidates

In the next round (which IIRC was tera), everything looked to be converging on failure.
```
r0=55 r1=2498
uint32_t hi32() { return rot(w - y, w) - rot(x, x); }
uint32_t lo32() { return rot(z + x, x) - rot(w, y); }
r0=55 r1=2530
uint32_t hi32() { return rot(w - y, w) - rot(x, x); }
uint32_t lo32() { return rot(z + x, z) - rot(w, y); }
r0=55 r1=2536
uint32_t hi32() { return rot(w - y, w) - rot(x, x); }
uint32_t lo32() { return rot(x + z, z) - rot(w, y); }
r0=55 r1=3560
uint32_t hi32() { return rot(w - y, w) - rot(x, x); }
uint32_t lo32() { return rot(x + z, z) + rot(w, y); }
r0=61 r1=2504
uint32_t hi32() { return rot(y - w, w) - rot(x, x); }
uint32_t lo32() { return rot(x + z, x) - rot(w, y); }
r0=210 r1=2823
uint32_t hi32() { return rot(z - x, y) - rot(w, x); }
uint32_t lo32() { return rot(w + y, x) - rot(x, w); }
r0=210 r1=2829
uint32_t hi32() { return rot(z - x, y) - rot(w, x); }
uint32_t lo32() { return rot(y + w, x) - rot(x, w); }
r0=210 r1=3847
uint32_t hi32() { return rot(z - x, y) - rot(w, x); }
uint32_t lo32() { return rot(w + y, x) + rot(x, w); }
r0=216 r1=2823
uint32_t hi32() { return rot(x - z, y) - rot(w, x); }
uint32_t lo32() { return rot(w + y, x) - rot(x, w); }
r0=216 r1=3847
uint32_t hi32() { return rot(x - z, y) - rot(w, x); }
uint32_t lo32() { return rot(w + y, x) + rot(x, w); }
r0=216 r1=3853
uint32_t hi32() { return rot(x - z, y) - rot(w, x); }
uint32_t lo32() { return rot(y + w, x) + rot(x, w); }
r0=228 r1=3919
uint32_t hi32() { return rot(x - y, z) - rot(w, x); }
uint32_t lo32() { return rot(w + w, x) + rot(y, w); }
r0=244 r1=3663
uint32_t hi32() { return rot(x - y, w) - rot(w, x); }
uint32_t lo32() { return rot(w + w, x) + rot(y, z); }
r0=248 r1=3879
uint32_t hi32() { return rot(x - z, w) - rot(w, x); }
uint32_t lo32() { return rot(w + y, z) + rot(x, w); }
r0=248 r1=3885
uint32_t hi32() { return rot(x - z, w) - rot(w, x); }
uint32_t lo32() { return rot(y + w, z) + rot(x, w); }
r0=295 r1=3314
uint32_t hi32() { return rot(w - y, z) - rot(x, y); }
uint32_t lo32() { return rot(z + x, w) + rot(w, x); }
r0=295 r1=3320
uint32_t hi32() { return rot(w - y, z) - rot(x, y); }
uint32_t lo32() { return rot(x + z, w) + rot(w, x); }
r0=450 r1=2615
uint32_t hi32() { return rot(z - x, x) - rot(w, y); }
uint32_t lo32() { return rot(w + y, w) - rot(x, z); }
r0=482 r1=2103
uint32_t hi32() { return rot(z - x, z) - rot(w, y); }
uint32_t lo32() { return rot(w + y, w) - rot(x, x); }
r0=482 r1=3871
uint32_t hi32() { return rot(z - x, z) - rot(w, y); }
uint32_t lo32() { return rot(w + w, y) + rot(x, w); }
r0=535 r1=4034
uint32_t hi32() { return rot(w - y, y) - rot(x, z); }
uint32_t lo32() { return rot(z + x, x) + rot(w, w); }
r0=535 r1=4040
uint32_t hi32() { return rot(w - y, y) - rot(x, z); }
uint32_t lo32() { return rot(x + z, x) + rot(w, w); }
r0=541 r1=3016
uint32_t hi32() { return rot(y - w, y) - rot(x, z); }
uint32_t lo32() { return rot(x + z, x) - rot(w, w); }
r0=567 r1=3298
uint32_t hi32() { return rot(w - y, w) - rot(x, z); }
uint32_t lo32() { return rot(z + x, z) + rot(w, x); }
r0=573 r1=3016
uint32_t hi32() { return rot(y - w, w) - rot(x, z); }
uint32_t lo32() { return rot(x + z, x) - rot(w, w); }
r0=706 r1=3645
uint32_t hi32() { return rot(z - x, x) - rot(w, z); }
uint32_t lo32() { return rot(y + w, w) + rot(x, z); }
r0=775 r1=3282
uint32_t hi32() { return rot(w - y, x) - rot(x, w); }
uint32_t lo32() { return rot(z + x, y) + rot(w, x); }
r0=775 r1=3288
uint32_t hi32() { return rot(w - y, x) - rot(x, w); }
uint32_t lo32() { return rot(x + z, y) + rot(w, x); }
r0=961 r1=2623
uint32_t hi32() { return rot(y - x, x) - rot(w, w); }
uint32_t lo32() { return rot(w + w, w) - rot(x, z); }
r0=962 r1=3607
uint32_t hi32() { return rot(z - x, x) - rot(w, w); }
uint32_t lo32() { return rot(w + y, y) + rot(x, z); }
r0=962 r1=3613
uint32_t hi32() { return rot(z - x, x) - rot(w, w); }
uint32_t lo32() { return rot(y + w, y) + rot(x, z); }
r0=968 r1=2583
uint32_t hi32() { return rot(x - z, x) - rot(w, w); }
uint32_t lo32() { return rot(w + y, y) - rot(x, z); }
r0=968 r1=2589
uint32_t hi32() { return rot(x - z, x) - rot(w, w); }
uint32_t lo32() { return rot(y + w, y) - rot(x, z); }
r0=968 r1=2621
uint32_t hi32() { return rot(x - z, x) - rot(w, w); }
uint32_t lo32() { return rot(y + w, w) - rot(x, z); }
r0=968 r1=3607
uint32_t hi32() { return rot(x - z, x) - rot(w, w); }
uint32_t lo32() { return rot(w + y, y) + rot(x, z); }
r0=968 r1=3613
uint32_t hi32() { return rot(x - z, x) - rot(w, w); }
uint32_t lo32() { return rot(y + w, y) + rot(x, z); }
r0=1079 r1=2530
uint32_t hi32() { return rot(w - y, w) + rot(x, x); }
uint32_t lo32() { return rot(z + x, z) - rot(w, y); }
r0=1079 r1=3522
uint32_t hi32() { return rot(w - y, w) + rot(x, x); }
uint32_t lo32() { return rot(z + x, x) + rot(w, y); }
r0=1079 r1=3528
uint32_t hi32() { return rot(w - y, w) + rot(x, x); }
uint32_t lo32() { return rot(x + z, x) + rot(w, y); }
r0=1079 r1=3560
uint32_t hi32() { return rot(w - y, w) + rot(x, x); }
uint32_t lo32() { return rot(x + z, z) + rot(w, y); }
r0=1085 r1=2530
uint32_t hi32() { return rot(y - w, w) + rot(x, x); }
uint32_t lo32() { return rot(z + x, z) - rot(w, y); }
r0=1107 r1=3887
uint32_t hi32() { return rot(w - x, y) + rot(y, x); }
uint32_t lo32() { return rot(w + w, z) + rot(x, w); }
r0=1234 r1=2829
uint32_t hi32() { return rot(z - x, y) + rot(w, x); }
uint32_t lo32() { return rot(y + w, x) - rot(x, w); }
r0=1240 r1=2621
uint32_t hi32() { return rot(x - z, y) + rot(w, x); }
uint32_t lo32() { return rot(y + w, w) - rot(x, z); }
r0=1240 r1=2829
uint32_t hi32() { return rot(x - z, y) + rot(w, x); }
uint32_t lo32() { return rot(y + w, x) - rot(x, w); }
r0=1249 r1=3919
uint32_t hi32() { return rot(y - x, z) + rot(w, x); }
uint32_t lo32() { return rot(w + w, x) + rot(y, w); }
r0=1266 r1=2895
uint32_t hi32() { return rot(z - x, w) + rot(w, x); }
uint32_t lo32() { return rot(w + w, x) - rot(y, w); }
r0=1268 r1=2639
uint32_t hi32() { return rot(x - y, w) + rot(w, x); }
uint32_t lo32() { return rot(w + w, x) - rot(y, z); }
r0=1273 r1=2895
uint32_t hi32() { return rot(y - z, w) + rot(w, x); }
uint32_t lo32() { return rot(w + w, x) - rot(y, w); }
r0=1319 r1=2290
uint32_t hi32() { return rot(w - y, z) + rot(x, y); }
uint32_t lo32() { return rot(z + x, w) - rot(w, x); }
r0=1319 r1=2296
uint32_t hi32() { return rot(w - y, z) + rot(x, y); }
uint32_t lo32() { return rot(x + z, w) - rot(w, x); }
r0=1474 r1=3133
uint32_t hi32() { return rot(z - x, x) + rot(w, y); }
uint32_t lo32() { return rot(y + w, w) + rot(x, x); }
r0=1474 r1=3639
uint32_t hi32() { return rot(z - x, x) + rot(w, y); }
uint32_t lo32() { return rot(w + y, w) + rot(x, z); }
r0=1506 r1=2103
uint32_t hi32() { return rot(z - x, z) + rot(w, y); }
uint32_t lo32() { return rot(w + y, w) - rot(x, x); }
r0=1506 r1=2109
uint32_t hi32() { return rot(z - x, z) + rot(w, y); }
uint32_t lo32() { return rot(y + w, w) - rot(x, x); }
r0=1559 r1=3010
uint32_t hi32() { return rot(w - y, y) + rot(x, z); }
uint32_t lo32() { return rot(z + x, x) - rot(w, w); }
r0=1559 r1=3016
uint32_t hi32() { return rot(w - y, y) + rot(x, z); }
uint32_t lo32() { return rot(x + z, x) - rot(w, w); }
r0=1559 r1=4034
uint32_t hi32() { return rot(w - y, y) + rot(x, z); }
uint32_t lo32() { return rot(z + x, x) + rot(w, w); }
r0=1559 r1=4040
uint32_t hi32() { return rot(w - y, y) + rot(x, z); }
uint32_t lo32() { return rot(x + z, x) + rot(w, w); }
r0=1565 r1=3010
uint32_t hi32() { return rot(y - w, y) + rot(x, z); }
uint32_t lo32() { return rot(z + x, x) - rot(w, w); }
r0=1565 r1=3016
uint32_t hi32() { return rot(y - w, y) + rot(x, z); }
uint32_t lo32() { return rot(x + z, x) - rot(w, w); }
r0=1591 r1=2274
uint32_t hi32() { return rot(w - y, w) + rot(x, z); }
uint32_t lo32() { return rot(z + x, z) - rot(w, x); }
r0=1591 r1=3298
uint32_t hi32() { return rot(w - y, w) + rot(x, z); }
uint32_t lo32() { return rot(z + x, z) + rot(w, x); }
r0=1591 r1=3304
uint32_t hi32() { return rot(w - y, w) + rot(x, z); }
uint32_t lo32() { return rot(x + z, z) + rot(w, x); }
r0=1837 r1=2296
uint32_t hi32() { return rot(y - w, z) + rot(x, w); }
uint32_t lo32() { return rot(x + z, w) - rot(w, x); }
r0=1837 r1=3314
uint32_t hi32() { return rot(y - w, z) + rot(x, w); }
uint32_t lo32() { return rot(z + x, w) + rot(w, x); }
r0=1986 r1=3133
uint32_t hi32() { return rot(z - x, x) + rot(w, w); }
uint32_t lo32() { return rot(y + w, w) + rot(x, x); }
r0=1992 r1=2583
uint32_t hi32() { return rot(x - z, x) + rot(w, w); }
uint32_t lo32() { return rot(w + y, y) - rot(x, z); }
r0=1992 r1=3639
uint32_t hi32() { return rot(x - z, x) + rot(w, w); }
uint32_t lo32() { return rot(w + y, w) + rot(x, z); }
r0=1992 r1=3645
uint32_t hi32() { return rot(x - z, x) + rot(w, w); }
uint32_t lo32() { return rot(y + w, w) + rot(x, z); }
r0=2103 r1=1506
uint32_t hi32() { return rot(w + y, w) - rot(x, x); }
uint32_t lo32() { return rot(z - x, z) + rot(w, y); }
r0=2103 r1=962
uint32_t hi32() { return rot(w + y, w) - rot(x, x); }
uint32_t lo32() { return rot(z - x, x) - rot(w, w); }
r0=2107 r1=3520
uint32_t hi32() { return rot(w + z, w) - rot(x, x); }
uint32_t lo32() { return rot(x + x, x) + rot(w, y); }
r0=2109 r1=1506
uint32_t hi32() { return rot(y + w, w) - rot(x, x); }
uint32_t lo32() { return rot(z - x, z) + rot(w, y); }
r0=2109 r1=1986
uint32_t hi32() { return rot(y + w, w) - rot(x, x); }
uint32_t lo32() { return rot(z - x, x) + rot(w, w); }
r0=2109 r1=962
uint32_t hi32() { return rot(y + w, w) - rot(x, x); }
uint32_t lo32() { return rot(z - x, x) - rot(w, w); }
r0=2256 r1=1964
uint32_t hi32() { return rot(x + x, y) - rot(w, x); }
uint32_t lo32() { return rot(x - w, z) + rot(z, w); }
r0=2274 r1=1591
uint32_t hi32() { return rot(z + x, z) - rot(w, x); }
uint32_t lo32() { return rot(w - y, w) + rot(x, z); }
r0=2290 r1=1837
uint32_t hi32() { return rot(z + x, w) - rot(w, x); }
uint32_t lo32() { return rot(y - w, z) + rot(x, w); }
r0=2290 r1=813
uint32_t hi32() { return rot(z + x, w) - rot(w, x); }
uint32_t lo32() { return rot(y - w, z) - rot(x, w); }
r0=2296 r1=775
uint32_t hi32() { return rot(x + z, w) - rot(w, x); }
uint32_t lo32() { return rot(w - y, x) - rot(x, w); }
r0=2296 r1=813
uint32_t hi32() { return rot(x + z, w) - rot(w, x); }
uint32_t lo32() { return rot(y - w, z) - rot(x, w); }
r0=2367 r1=3010
uint32_t hi32() { return rot(w + w, w) - rot(x, y); }
uint32_t lo32() { return rot(z + x, x) - rot(w, w); }
r0=2496 r1=2110
uint32_t hi32() { return rot(x + x, x) - rot(w, y); }
uint32_t lo32() { return rot(z + w, w) - rot(x, x); }
r0=2536 r1=1079
uint32_t hi32() { return rot(x + z, z) - rot(w, y); }
uint32_t lo32() { return rot(w - y, w) + rot(x, x); }
r0=2583 r1=1992
uint32_t hi32() { return rot(w + y, y) - rot(x, z); }
uint32_t lo32() { return rot(x - z, x) + rot(w, w); }
r0=2583 r1=968
uint32_t hi32() { return rot(w + y, y) - rot(x, z); }
uint32_t lo32() { return rot(x - z, x) - rot(w, w); }
r0=2589 r1=968
uint32_t hi32() { return rot(y + w, y) - rot(x, z); }
uint32_t lo32() { return rot(x - z, x) - rot(w, w); }
r0=2618 r1=1287
uint32_t hi32() { return rot(z + z, w) - rot(x, z); }
uint32_t lo32() { return rot(w - y, x) + rot(x, y); }
r0=2621 r1=1992
uint32_t hi32() { return rot(y + w, w) - rot(x, z); }
uint32_t lo32() { return rot(x - z, x) + rot(w, w); }
r0=2623 r1=1985
uint32_t hi32() { return rot(w + w, w) - rot(x, z); }
uint32_t lo32() { return rot(y - x, x) + rot(w, w); }
r0=2639 r1=1268
uint32_t hi32() { return rot(w + w, x) - rot(y, z); }
uint32_t lo32() { return rot(x - y, w) + rot(w, x); }
r0=2675 r1=3280
uint32_t hi32() { return rot(w + x, w) - rot(y, z); }
uint32_t lo32() { return rot(x + x, y) + rot(w, x); }
r0=2823 r1=1234
uint32_t hi32() { return rot(w + y, x) - rot(x, w); }
uint32_t lo32() { return rot(z - x, y) + rot(w, x); }
r0=2829 r1=1234
uint32_t hi32() { return rot(y + w, x) - rot(x, w); }
uint32_t lo32() { return rot(z - x, y) + rot(w, x); }
r0=2847 r1=450
uint32_t hi32() { return rot(w + w, y) - rot(x, w); }
uint32_t lo32() { return rot(z - x, x) - rot(w, y); }
r0=2895 r1=1266
uint32_t hi32() { return rot(w + w, x) - rot(y, w); }
uint32_t lo32() { return rot(z - x, w) + rot(w, x); }
r0=3010 r1=1559
uint32_t hi32() { return rot(z + x, x) - rot(w, w); }
uint32_t lo32() { return rot(w - y, y) + rot(x, z); }
r0=3010 r1=1565
uint32_t hi32() { return rot(z + x, x) - rot(w, w); }
uint32_t lo32() { return rot(y - w, y) + rot(x, z); }
r0=3010 r1=541
uint32_t hi32() { return rot(z + x, x) - rot(w, w); }
uint32_t lo32() { return rot(y - w, y) - rot(x, z); }
r0=3010 r1=573
uint32_t hi32() { return rot(z + x, x) - rot(w, w); }
uint32_t lo32() { return rot(y - w, w) - rot(x, z); }
r0=3016 r1=1559
uint32_t hi32() { return rot(x + z, x) - rot(w, w); }
uint32_t lo32() { return rot(w - y, y) + rot(x, z); }
r0=3016 r1=573
uint32_t hi32() { return rot(x + z, x) - rot(w, w); }
uint32_t lo32() { return rot(y - w, w) - rot(x, z); }
r0=3127 r1=1474
uint32_t hi32() { return rot(w + y, w) + rot(x, x); }
uint32_t lo32() { return rot(z - x, x) + rot(w, y); }
r0=3280 r1=3699
uint32_t hi32() { return rot(x + x, y) + rot(w, x); }
uint32_t lo32() { return rot(w + x, w) + rot(y, z); }
r0=3280 r1=3708
uint32_t hi32() { return rot(x + x, y) + rot(w, x); }
uint32_t lo32() { return rot(x + w, w) + rot(y, z); }
r0=3282 r1=775
uint32_t hi32() { return rot(z + x, y) + rot(w, x); }
uint32_t lo32() { return rot(w - y, x) - rot(x, w); }
r0=3288 r1=775
uint32_t hi32() { return rot(x + z, y) + rot(w, x); }
uint32_t lo32() { return rot(w - y, x) - rot(x, w); }
r0=3296 r1=3645
uint32_t hi32() { return rot(x + x, z) + rot(w, x); }
uint32_t lo32() { return rot(y + w, w) + rot(x, z); }
r0=3298 r1=567
uint32_t hi32() { return rot(z + x, z) + rot(w, x); }
uint32_t lo32() { return rot(w - y, w) - rot(x, z); }
r0=3304 r1=567
uint32_t hi32() { return rot(x + z, z) + rot(w, x); }
uint32_t lo32() { return rot(w - y, w) - rot(x, z); }
r0=3314 r1=1325
uint32_t hi32() { return rot(z + x, w) + rot(w, x); }
uint32_t lo32() { return rot(y - w, z) + rot(x, y); }
r0=3314 r1=1591
uint32_t hi32() { return rot(z + x, w) + rot(w, x); }
uint32_t lo32() { return rot(w - y, w) + rot(x, z); }
r0=3314 r1=1837
uint32_t hi32() { return rot(z + x, w) + rot(w, x); }
uint32_t lo32() { return rot(y - w, z) + rot(x, w); }
r0=3459 r1=3887
uint32_t hi32() { return rot(w + x, x) + rot(z, y); }
uint32_t lo32() { return rot(w + w, z) + rot(x, w); }
r0=3468 r1=3887
uint32_t hi32() { return rot(x + w, x) + rot(z, y); }
uint32_t lo32() { return rot(w + w, z) + rot(x, w); }
r0=3504 r1=1524
uint32_t hi32() { return rot(x + x, w) + rot(z, y); }
uint32_t lo32() { return rot(x - y, w) + rot(w, y); }
r0=3520 r1=2107
uint32_t hi32() { return rot(x + x, x) + rot(w, y); }
uint32_t lo32() { return rot(w + z, w) - rot(x, x); }
r0=3522 r1=1079
uint32_t hi32() { return rot(z + x, x) + rot(w, y); }
uint32_t lo32() { return rot(w - y, w) + rot(x, x); }
r0=3528 r1=1597
uint32_t hi32() { return rot(x + z, x) + rot(w, y); }
uint32_t lo32() { return rot(y - w, w) + rot(x, z); }
r0=3607 r1=962
uint32_t hi32() { return rot(w + y, y) + rot(x, z); }
uint32_t lo32() { return rot(z - x, x) - rot(w, w); }
r0=3607 r1=968
uint32_t hi32() { return rot(w + y, y) + rot(x, z); }
uint32_t lo32() { return rot(x - z, x) - rot(w, w); }
r0=3613 r1=1992
uint32_t hi32() { return rot(y + w, y) + rot(x, z); }
uint32_t lo32() { return rot(x - z, x) + rot(w, w); }
r0=3613 r1=962
uint32_t hi32() { return rot(y + w, y) + rot(x, z); }
uint32_t lo32() { return rot(z - x, x) - rot(w, w); }
r0=3639 r1=1992
uint32_t hi32() { return rot(w + y, w) + rot(x, z); }
uint32_t lo32() { return rot(x - z, x) + rot(w, w); }
r0=3639 r1=962
uint32_t hi32() { return rot(w + y, w) + rot(x, z); }
uint32_t lo32() { return rot(z - x, x) - rot(w, w); }
r0=3645 r1=1992
uint32_t hi32() { return rot(y + w, w) + rot(x, z); }
uint32_t lo32() { return rot(x - z, x) + rot(w, w); }
r0=3699 r1=3280
uint32_t hi32() { return rot(w + x, w) + rot(y, z); }
uint32_t lo32() { return rot(x + x, y) + rot(w, x); }
r0=3708 r1=2256
uint32_t hi32() { return rot(x + w, w) + rot(y, z); }
uint32_t lo32() { return rot(x + x, y) - rot(w, x); }
r0=3708 r1=3280
uint32_t hi32() { return rot(x + w, w) + rot(y, z); }
uint32_t lo32() { return rot(x + x, y) + rot(w, x); }
r0=3724 r1=1404
uint32_t hi32() { return rot(x + w, x) + rot(z, z); }
uint32_t lo32() { return rot(x - w, w) + rot(y, y); }
r0=3847 r1=1234
uint32_t hi32() { return rot(w + y, x) + rot(x, w); }
uint32_t lo32() { return rot(z - x, y) + rot(w, x); }
r0=3887 r1=2435
uint32_t hi32() { return rot(w + w, z) + rot(x, w); }
uint32_t lo32() { return rot(w + x, x) - rot(z, y); }
r0=3887 r1=2444
uint32_t hi32() { return rot(w + w, z) + rot(x, w); }
uint32_t lo32() { return rot(x + w, x) - rot(z, y); }
r0=3887 r1=3459
uint32_t hi32() { return rot(w + w, z) + rot(x, w); }
uint32_t lo32() { return rot(w + x, x) + rot(z, y); }
r0=3887 r1=3468
uint32_t hi32() { return rot(w + w, z) + rot(x, w); }
uint32_t lo32() { return rot(x + w, x) + rot(z, y); }
r0=3919 r1=1249
uint32_t hi32() { return rot(w + w, x) + rot(y, w); }
uint32_t lo32() { return rot(y - x, z) + rot(w, x); }
r0=4034 r1=1559
uint32_t hi32() { return rot(z + x, x) + rot(w, w); }
uint32_t lo32() { return rot(w - y, y) + rot(x, z); }
r0=4034 r1=535
uint32_t hi32() { return rot(z + x, x) + rot(w, w); }
uint32_t lo32() { return rot(w - y, y) - rot(x, z); }
r0=4036 r1=3647
uint32_t hi32() { return rot(x + y, x) + rot(w, w); }
uint32_t lo32() { return rot(w + w, w) + rot(x, z); }
r0=4040 r1=1597
uint32_t hi32() { return rot(x + z, x) + rot(w, w); }
uint32_t lo32() { return rot(y - w, w) + rot(x, z); }
r0=4040 r1=2367
uint32_t hi32() { return rot(x + z, x) + rot(w, w); }
uint32_t lo32() { return rot(w + w, w) - rot(x, y); }
r0=4040 r1=535
uint32_t hi32() { return rot(x + z, x) + rot(w, w); }
uint32_t lo32() { return rot(w - y, y) - rot(x, z); }
r0=4040 r1=541
uint32_t hi32() { return rot(x + z, x) + rot(w, w); }
uint32_t lo32() { return rot(y - w, y) - rot(x, z); }
```