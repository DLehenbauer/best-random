#!/bin/bash
set -eo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
pass_file="$script_dir/pass"

# Clear pass file
> "$pass_file"

# Always rebuild RNG to ensure up-to-date
pushd "$script_dir/rng" > /dev/null
make clean
make
popd > /dev/null

gjrand_testunif_dir="$script_dir/../../tools/GJRand/src/gjrand.4.3.0.0/testunif"
rng_exec="$script_dir/rng/rng"
hwd64="$script_dir/../../tools/hwd/hwd64"

# Helper function to execute a single test at a given size with a threshold
execute_test() {
    local test_name=$1
    local test=$2
    local size=$3
    local threshold=$4
    shift 4
    local params="$*"
    
    # Run the test and capture the last line
    local last_line=$("$rng_exec" -p "$@" | "$test" $size 2>&1 | tail -n 1)
    
    # Extract P value from last line (format: "P = <value>" or "p = <value> (...)")
    local p_value=$(echo "$last_line" | sed -n 's/^[Pp] = \([^ ]*\).*$/\1/p')
    
    # Check P value using awk for floating point comparison
    if echo "$p_value $threshold" | awk '{exit !($1 > $2)}'; then
        echo "[PASS: $test_name] $params: $last_line" 1>&2
        return 0
    else
        echo "[FAIL: $test_name] $params: $last_line" 1>&2
        return 1
    fi
}

# Define function to run progressive tests
run_test() {
    local params="$*"

    gjrand_mod3="$gjrand_testunif_dir/bin/mod3"
    gjrand_z9="$gjrand_testunif_dir/bin/z9"

    size_tiny="10485760"            # 10 MB
    size_small="104857600"          # 100 MB
    size_standard="1073741824"      # 1 GB
    size_big="10737418240"          # 10 GB
    size_huge="107374182400"        # 100 GB
    size_tera="1099511627776"       # 1 TB
    size_ten_tera="10995116277760"  # 10 TB
    
    #execute_test MOD3-TINY $gjrand_mod3 $size_tiny 0 "$@" || return
    execute_test MOD3-SMALL $gjrand_mod3 $size_small 0 "$@" || return
    #execute_test MOD3-STANDARD $gjrand_mod3 $size_standard 1e-20 "$@" || return
    execute_test Z9-STANDARD $gjrand_z9 $size_standard 1e-20 "$@" || return
    
    # All tests passed - log to pass file
    echo "$params" >> "$pass_file"
}

# Export function and variables for parallel
export -f run_test execute_test
export rng_exec gjrand_testunif_dir hwd64 pass_file

# Run tests in parallel
python3 "$script_dir/args.py" | parallel --joblog "$script_dir/parallel.log" --lb --colsep ' ' run_test {}
#cat args | parallel -j $(nproc) --lb --colsep ' ' run_test {}
