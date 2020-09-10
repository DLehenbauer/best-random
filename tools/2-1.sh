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

test 5 16
test 5 18
test 5 20
test 5 22
test 5 24
test 5 25
test 5 28
test 5 30
test 8 10
test 8 11
test 8 12
test 8 13
test 8 14
test 8 15
test 8 17
test 8 18
test 8 19
test 8 20
test 8 21
test 8 22
test 8 23
test 8 25
test 8 27
test 8 29
test 8 31
test 9 0
test 9 2
test 9 4
test 9 6
test 9 7
test 9 11
test 9 12
test 9 15
test 9 16
test 9 17
test 9 18
test 9 19
test 9 20
test 9 21
test 9 22
