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

echo "[$(date '+%m/%d %T')]: Removing '$pass_file'..."
rm -f $pass_file

echo "[$(date '+%m/%d %T')]: Removing '$args_file'..."
rm -f $args_file
    
echo "[$(date '+%m/%d %T')]: Building '$args_file'..."
for ((i = 0; i < 64; i += 1));
do
    echo "$i" >> $args_file
done
