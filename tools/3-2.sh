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

test 20 8
test 20 9
test 20 10
test 20 11
test 20 12
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
test 21 11
test 21 15
test 21 17
test 21 30
test 22 3
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
test 22 23
test 22 24
test 22 25
test 22 27
test 22 29
test 22 31
test 23 9
test 23 11
test 23 13
test 23 14
test 23 17
test 23 19
test 23 30
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
