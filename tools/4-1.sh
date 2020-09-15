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


test 20 13
test 20 14
test 20 15
test 20 16
test 20 17
test 20 18
test 20 22
test 20 23
test 20 24
test 20 25
test 20 26
test 20 27
test 20 29
test 20 31
test 22 5
test 22 7
test 22 8
test 22 9
test 22 10
test 22 11
test 22 12
test 22 13
test 22 15
test 22 16
test 22 17
test 22 18
test 22 19
test 22 20