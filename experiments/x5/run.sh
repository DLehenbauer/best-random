#!/bin/bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

log_dir="$script_dir/logs"

# Build RNG if needed
pushd "$script_dir/rng" > /dev/null
make -s
popd > /dev/null

# Ensure logs directory exists
mkdir -p "$log_dir"

pass_file="$script_dir/pass"

rng_exec="$script_dir/rng/rng"

tools_dir="$script_dir/../../tools"
hwd64="$tools_dir/hwd/hwd64 --progress"
hwd64_t="$tools_dir/hwd/hwd64 -t --progress"
pr32="$tools_dir/PractRand/RNG_test stdin -tlmin 1KB -tlmax 8192PB"
pr32_12="$tools_dir/PractRand/RNG_test stdin -te 1 -tf 2 -tlmin 1KB -tlmax 8192PB"
pr64="$tools_dir/PractRand/RNG_test stdin64 -tlmin 1KB -tlmax 8192PB"
pr64_12="$tools_dir/PractRand/RNG_test stdin64 -te 1 -tf 2 -tlmin 1KB -tlmax 8192PB"

test=$hwd64

# Define function to run a single test
run_test() {
    log_file="$log_dir/$(printf '%s\n' "$@" | paste -sd '_').log"
    
    echo "[$(date '+%m/%d %H:%M:%S')]: $*" 1>&2
    
    "$rng_exec" -i -p "$@" 2>"$log_file" \
        | stdbuf -oL -eL $test 2>&1 \
        | tee -a "$log_file" > /dev/null
}

# Export function and variables for parallel
export -f run_test
export log_dir rng_exec test

# Run tests in parallel using args.py
rm -rf $log_dir
mkdir -p $log_dir

python3 "$script_dir/args.py" | parallel --joblog "$script_dir/parallel.log" --lb -C ' ' run_test {}
