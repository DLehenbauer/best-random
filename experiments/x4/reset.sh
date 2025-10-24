#!/bin/bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

log_dir="$script_dir/logs"
args_file="$script_dir/args"
pass_file="$script_dir/pass"
rng_dir="$script_dir/rng"

echo "[$(date '+%m/%d %T')]: Building rng..."

pushd $rng_dir
make clean
make
popd

echo "[$(date '+%m/%d %T')]: Removing '$log_dir'..."
rm -rf $log_dir
mkdir -p $log_dir

rng_log="$log_dir/rng.log"
echo "[$(date '+%m/%d %T')]: Creating '$rng_log'..."
rng_h="$rng_dir/rng.h"
rng_exec="$rng_dir/rng"

echo "=== RNG Configuration Log ===" > "$rng_log"
echo "" >> "$rng_log"
echo "Timestamp: $(date)" >> "$rng_log"
echo "" >> "$rng_log"
echo "File: rng/rng.h" >> "$rng_log"
echo "Modified: $(stat -c '%y' "$rng_h" 2>/dev/null || stat -f '%Sm' "$rng_h")" >> "$rng_log"
echo "" >> "$rng_log"
echo "File: rng/rng (executable)" >> "$rng_log"
echo "Modified: $(stat -c '%y' "$rng_exec" 2>/dev/null || stat -f '%Sm' "$rng_exec")" >> "$rng_log"
echo "" >> "$rng_log"
echo "=== Contents of rng/rng.h ===" >> "$rng_log"
echo "" >> "$rng_log"
cat "$rng_h" >> "$rng_log"

echo "[$(date '+%m/%d %T')]: Removing '$pass_file'..."
rm -f $pass_file

echo "[$(date '+%m/%d %T')]: Resetting '$args_file'..."
sort -V args.orig > args
