# best-random
A drop in replacement for `Math.random()` that is tiny, fast, seedable, and has good statistical properties.

## Installation
```
npm i best-random --save
```

## Usage
```js
const { Random } = require("best-random");

const rnd = new Random(/* seed: */ 42);     // New PRNG w/seed 42

console.log(rnd.uint32());                  // Always prints '2612626173'
console.log(rnd.uint53());                  // Always prints '1685622589298221'
console.log(rnd.float64());                 // Always prints '0.7588413329267216'
```
