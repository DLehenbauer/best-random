#!/bin/bash

logFile="rr-u64-16tb-$(echo "${0##*/}" | cut -f 1 -d '.').log"
clear
echo ">>> Logging to: $logFile"

test () {
    p0=$1
    p1=$2

    (echo ">>> p0=$p0, p1=$p1" && ./Rng/rng -p0 $p0 -p1 $p1 | stdbuf -oL -eL ./PractRand/RNG_test stdin64 -seed 0 -tf 2 -te 1 -multithreaded -tlmin 256MB -tlmax 16TB 2>&1) | tee -a $logFile
}

npm run make:rng
echo

test 13 16
test 13 17
test 13 18
test 13 19
test 13 20
test 13 21
test 13 22
test 13 23
test 13 24
test 13 25
test 13 26
test 13 28
test 13 30
test 14 1
test 14 3
test 14 5
test 14 7
test 14 8
test 14 9
test 14 10
test 14 11
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
