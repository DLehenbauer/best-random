#!/bin/bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

log_dir="$script_dir/logs"
args_file="$script_dir/args"
pass_file="$script_dir/pass"
rng_exec="$script_dir/rng/rng"
tools_dir="$script_dir/../../tools"
hwd_exec="$tools_dir/hwd/hwd"

parallel --joblog "$script_dir/parallel.log" --lb --trim lr "echo \"[$(date '+%m/%d %H:%M:%S')]: {0}\" 1>&2; $rng_exec {0} | stdbuf -oL -eL \"$hwd_exec\" | tee \"$log_dir/{0}.log\" > /dev/null" :::: "$args_file"
