#!/bin/bash

logFile="rr-u64-4tb-$(echo "${0##*/}" | cut -f 1 -d '.').log"
clear
echo ">>> Logging to: $logFile"

test () {
    p0=$1
    p1=$2

    (echo ">>> p0=$p0, p1=$p1" && ./Rng/rng -p0 $p0 -p1 $p1 | stdbuf -oL -eL ./PractRand/RNG_test stdin64 -seed 0 -tf 2 -te 1 -multithreaded -tlmin 256MB -tlmax 4TB 2>&1) | tee -a $logFile
}

npm run make:rng
echo


test 22 23
test 22 24
test 22 25
test 22 27
test 22 29
test 22 31
test 24 3
test 24 5
test 24 6
test 24 7
test 24 9
test 24 10
test 24 11
test 24 12
test 24 13
test 24 14
test 24 15
test 24 17
test 24 18
test 24 19
test 24 20
test 24 21
test 24 22
test 24 25
test 24 26
test 24 27
test 24 29
test 24 31
