#!/bin/bash
set -eo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

pass_file="$script_dir/pass.s3"

# Build RNG if needed
pushd "$script_dir/rng" > /dev/null
make -s
popd > /dev/null

rng_exec="$script_dir/rng/rng"
# PractRand executable (assumes binary built in tools/PractRand)
practrand_exe="$script_dir/../../tools/PractRand/RNG_test"

# Clear pass file
> "$pass_file"

# PractRand test length limit; controls how far PractRand proceeds (-tlmax).
# Use human-friendly PractRand units (examples: 4MB, 16MB, 256MB, 1GB, etc.).
# This replaces earlier byte truncation via dd.
pr_limit="1TB"

# Run PractRand on a candidate; returns 0 if no FAIL lines encountered.
# We stop feeding data after pr_bytes_limit bytes to keep screening quick.
execute_practrand() {
    local params="$*"
    # Ensure PractRand executable exists
    if [ ! -x "$practrand_exe" ]; then
        echo "[ERROR] PractRand executable not found at $practrand_exe" 1>&2
        return 2
    fi
    # Feed RNG output directly; -tlmax limits total tested length. stdbuf ensures line-buffered output.
    local output
    output=$( "$rng_exec" -p "$@" | stdbuf -oL "$practrand_exe" stdin64 -tlmax "$pr_limit" 2>&1 ) || true

    # Collect FAIL lines (may include severity markers like ! or !!)
    local fail_lines
    fail_lines=$(echo "$output" | grep -E 'FAIL' || true)

    echo "$output"

    # Determine worst p-value line (handles p =, p~=)
    # PractRand uses 2-sided p-values: both 0 and 1 are bad, so we want the value closest to either extreme.
    # We compute min(p, 1-p) to get distance from nearest extreme, then sort ascending to find worst.
    local worst_line
    # Use Perl big number logic to avoid underflow for extremely small p-values (e.g. 1e-1785) and
    # robustly handle forms like 1-1e-10 by computing distance = min(p, 1-p) without relying on IEEE double or bc scale.
    worst_line=$(echo "$output" | perl -Mbignum -ne 'if(/ p[~ ]*= *([^ ]+)/){
        my $raw = $1;
        my ($dist);
        if($raw =~ /^1-([0-9.]+)e-([0-9]+)$/){
            my ($c,$e)=($1,$2); # distance is 1 - p = c*10^-e
            $dist = Math::BigFloat->new($c) * Math::BigFloat->new(10)->bpow(-$e);
        } elsif($raw =~ /^([0-9.]+)e-([0-9]+)$/){
            my ($c,$e)=($1,$2); $dist = Math::BigFloat->new($c) * Math::BigFloat->new(10)->bpow(-$e);
        } elsif($raw =~ /^([0-9.]+)$/){
            my $p = Math::BigFloat->new($1);
            if($p->bcmp(Math::BigFloat->new("0.5")) <= 0){ $dist = $p; } else { $dist = Math::BigFloat->new(1)->bsub($p); }
        } else { next; }
        # Track smallest distance (most extreme). Compare via bcmp.
        if(!defined $main::best_dist || $dist->bcmp($main::best_dist) < 0){ $main::best_dist = $dist->copy; $main::best_line = $_; }
    } END { print $main::best_line if defined $main::best_line; }')

    # Trim leading whitespace from worst_line
    worst_line=$(echo "$worst_line" | sed 's/^[[:space:]]*//')

    # Count failure lines for reporting
    local fail_count=0
    if [ -n "$fail_lines" ]; then
        fail_count=$(echo "$fail_lines" | wc -l | tr -d ' ')
    fi

    if [ -n "$fail_lines" ]; then
        # Failure: show worst p-value line or fallback text with count
        echo "[FAIL-PRACTRAND] $params: ${worst_line:-no p-value} ($fail_count total failures)" 1>&2
        return 1
    else
        # Pass: show worst p-value line or fallback using parameter expansion
        echo "[PASS-PRACTRAND] $params: ${worst_line:-ok}" 1>&2
        return 0
    fi
}

# Define function to run progressive tests
run_test() {
    local params="$*"
    execute_practrand "$@" || return
    echo "$params" >> "$pass_file"
}

# Export function and variables for parallel
export -f run_test execute_practrand
export rng_exec practrand_exe pass_file pr_limit

# Run tests in parallel
#run_test 0 0 0 0 0 2 0 2 17 1 0 1
#python3 "$script_dir/args.py" | parallel -j $(nproc) --lb --colsep ' ' run_test {}
cat args | parallel --lb --colsep ' ' run_test {}
