#!/bin/bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

log_dir="$script_dir/logs"
args_file="$script_dir/args"
pass_file="$script_dir/pass"

rng_exec="$script_dir/rng/rng"

tools_dir="$script_dir/../../tools"
hwd="$tools_dir/hwd/hwd --progress"
#mcp="$tools_dir/GJRand/src/gjrand.4.3.0.0/testunif/mcp --standard"
practrand32="$tools_dir/PractRand/RNG_test stdin -tlmin 1KB -tlmax 8192PB"
#practrand32="$tools_dir/PractRand/RNG_test stdin -tf 2 -te 1 -tlmin 1KB -tlmax 8192PB"
practrand64="$tools_dir/PractRand/RNG_test stdin64 -tlmin 1KB -tlmax 8192PB"

test=$practrand32

# Define function to run a single test
run_test() {
    local log_file="$log_dir/${1}_${2}_${3}_${4}_${5}_${6}.log"
    
    echo "[$(date '+%m/%d %H:%M:%S')]: $*" 1>&2
    
    "$rng_exec" -i "$@" 2>"$log_file" \
        | stdbuf -oL -eL $test 2>&1 \
        | tee -a "$log_file" > /dev/null
}

# Export function and variables for parallel
export -f run_test
export log_dir rng_exec test

parallel --joblog "$script_dir/parallel.log" --lb -C ' ' run_test {} :::: "$args_file"
