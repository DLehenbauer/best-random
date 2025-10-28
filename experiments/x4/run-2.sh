#!/bin/bash
set -eo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

pass_file="$script_dir/pass"

# Build RNG if needed
pushd "$script_dir/rng" > /dev/null
make -s
popd > /dev/null

rng_exec="$script_dir/rng/rng"
gjrand_mod3="$script_dir/../../tools/GJRand/src/gjrand.4.3.0.0/testunif/bin/mod3"
gjrand_z9="$script_dir/../../tools/GJRand/src/gjrand.4.3.0.0/testunif/bin/z9"
hwd="$script_dir/../../tools/hwd/hwd64"

# Clear pass file
> "$pass_file"

size_tiny="10485760"
size_small="104857600"
size_standard="1073741824"
size_big="10737418240"
size_huge="107374182400"
size_tera="1099511627776"
size_ten_tera="10995116277760"

# Helper function to execute a single test at a given size with a threshold
execute_test() {
    local test_name=$1
    local size=$2
    local threshold=$3
    shift 3
    local params="$*"
    
    # Run the test and capture the last line
    local last_line=$("$rng_exec" -p "$@" | "$gjrand_mod3" $size 2>&1 | tail -n 1)
    
    # Extract P value from last line (format: "P = <value>" or "p = <value> (...)")
    local p_value=$(echo "$last_line" | sed -n 's/^[Pp] = \([^ ]*\).*$/\1/p')
    
    # Check P value using awk for floating point comparison
    if echo "$p_value $threshold" | awk '{exit !($1 > $2)}'; then
        echo "[PASS-$test_name] $params: $last_line" 1>&2
        return 0
    else
        echo "[FAIL-$test_name] $params: $last_line" 1>&2
        return 1
    fi
}

# Define function to run progressive tests
run_test() {
    local params="$*"
    
    execute_test TINY $size_tiny 0 "$@" || return
    execute_test SMALL $size_small 0 "$@" || return
    
    # All tests passed - log to pass file
    echo "$params" >> "$pass_file"
}

# Export function and variables for parallel
export -f run_test execute_test
export rng_exec hwd gjrand_mod3 gjrand_z9 pass_file size_tiny size_small size_standard

# Run tests in parallel
#run_test 0 0 0 0 0 2 0 2 17 1 0 1
python3 "$script_dir/args.py" | parallel -j $(nproc) --lb --colsep ' ' run_test {}
