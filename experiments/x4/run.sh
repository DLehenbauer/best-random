#!/bin/bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

log_dir="$script_dir/logs"
args_file="$script_dir/args"
pass_file="$script_dir/pass"

# Ensure logs directory exists
rm -rf "$log_dir"
mkdir -p "$log_dir"

# Reset args file
#seq 0 31 > "$args_file"
cp "$script_dir/args.orig" "$args_file"

pushd "$script_dir/rng"
make clean
make
popd

rng_exec="$script_dir/rng/rng"

tools_dir="$script_dir/../../tools"
hwd32="$tools_dir/hwd/hwd32 --progress"
hwd64="$tools_dir/hwd/hwd64 --progress"
pr32="$tools_dir/PractRand/RNG_test stdin -tlmin 1KB -tlmax 8192PB"
pr32_12="$tools_dir/PractRand/RNG_test stdin -te 1 -tf 2 -tlmin 1KB -tlmax 8192PB"
pr64="$tools_dir/PractRand/RNG_test stdin64 -tlmin 1KB -tlmax 8192PB"
pr64_12="$tools_dir/PractRand/RNG_test stdin64 -te 1 -tf 2 -tlmin 1KB -tlmax 8192PB"

test=$pr32

# Define function to run a single test
run_test() {
    local params="$*"
    local log_file="$log_dir/${params// /_}.log"
    
    echo "[$(date '+%m/%d %H:%M:%S')]: $params" 1>&2
    
    "$rng_exec" -i -p "$@" 2>"$log_file" \
        | stdbuf -oL -eL $test 2>&1 \
        | tee -a "$log_file" > /dev/null
}

# Export function and variables for parallel
export -f run_test
export log_dir rng_exec test

parallel --joblog "$script_dir/parallel.log" --lb -C ' ' run_test {} :::: "$args_file"
