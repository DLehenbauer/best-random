# best-random
A drop in replacement for `Math.random()` that is tiny, fast, seedable, and has good statistical properties.

## Installation
```
npm i best-random --save
```

## Usage
```js
const { Random } = require("best-random");
const rnd = new Random(/* seed: */ 0);      // Create a new PRNG w/seed 0

console.log(rnd.uint32());                  // Always prints '3530657145'
console.log(rnd.uint53());                  // Always prints '7925688982493953'
console.log(rnd.float64());                 // Always prints '0.03993065651624628'
```
