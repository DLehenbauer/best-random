function emit(p0, p1) {
    console.log(`(echo ">>> p0=${p0}, p1=${p1}" && ./rng/rng -p0 ${p0} -p1 ${p1} | stdbuf -oL -eL ./PractRand/RNG_Test stdin64 -seed 0 -tf 2 -te 1 -multithreaded 2>&1) | tee -a u64.log`)
}

console.log("npm run make:rng");
console.log("cat ./rng/rng.c | tee u64.log")
for (let p0 = 0; p0 < 32; p0++) {
    for (let p1 = 0; p1 < 32; p1++) {
        emit(p0, p1);
    }
}