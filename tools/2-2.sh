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

test 9 23
test 9 24
test 9 26
test 9 28
test 9 30
test 10 1
test 10 3
test 10 5
test 10 7
test 10 8
test 10 11
test 10 12
test 10 13
test 10 14
test 10 15
test 10 16
test 10 17
test 10 18
test 10 19
test 10 20
test 10 21
test 10 22
test 10 23
test 10 24
test 10 25
test 10 27
test 10 29
test 10 31
test 11 0
test 11 2
test 11 4
test 11 6
test 11 7
test 11 8
test 11 9
test 11 12
test 11 13
test 11 14
test 11 15
test 11 16
test 11 17
