# best-random
A humble replacement for `Math.random()` that is tiny, fast, seedable, and has good statistical properties.

## Overview
* Suitable for non-cryptographic applications
* Passes most statistical tests
* Period of ~2<sup>160</sup>
* ~600 bytes
* *Very* fast
 
## Installation
```
npm i best-random --save
```

## Usage
```js
const { Random } = require("best-random");

const rnd = new Random(/* seed: */ 42);     // New PRNG w/seed 42

console.log(rnd.float64());                 // Always prints '0.2403619304225596'
console.log(rnd.uint32());                  // Always prints '3079248431'
console.log(rnd.uint53());                  // Always prints '1933207184009787'
```
