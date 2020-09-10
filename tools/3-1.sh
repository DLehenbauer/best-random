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

test 11 18
test 11 19
test 11 20
test 11 21
test 11 22
test 11 23
test 11 24
test 11 25
test 11 26
test 11 28
test 11 30
test 12 3
test 12 6
test 12 7
test 12 9
test 12 10
test 12 14
test 12 15
test 12 16
test 12 17
test 12 18
test 12 19
test 12 20
test 12 21
test 12 22
test 12 23
test 12 24
test 12 25
test 12 27
test 12 29
test 12 31
test 13 0
test 13 4
test 13 6
test 13 7
test 13 8
test 13 9
test 13 10
test 13 11
test 13 14
