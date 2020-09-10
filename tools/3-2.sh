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


test 14 12
test 14 15
test 14 17
test 14 18
test 14 19
test 14 20
test 14 21
test 14 23
test 14 24
test 14 25
test 14 27
test 14 29
test 14 31
test 16 25
test 16 27
test 16 29
test 16 31
test 17 4
test 17 5
test 17 6
test 17 7
test 17 8
test 17 9
test 17 10
test 17 11
test 17 12
test 17 13
test 17 14
test 17 20
test 17 21
test 17 22
test 17 23
test 17 24
test 17 25
test 17 26
test 17 28
test 17 30
test 20 5
test 20 6
test 20 7
test 20 9
test 20 10
test 20 11
test 20 12
