#!/usr/bin/env bash
# Run hunt.py in parallel using argument lines from the "args" file.
# Usage: ./run.sh [args-file] [output-file] [jobs]
# Defaults:
#   args-file = ./args
#   output-file = ./results.txt
#   jobs = +0  (let GNU parallel choose based on CPU count)

set -euo pipefail
source venv/bin/activate

PROG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARGS_FILE="${1:-$PROG_DIR/args}"
OUT_FILE="${2:-$PROG_DIR/results.txt}"

# Default number of jobs to the number of CPUs (fallback to 1 if nproc
# is unavailable). Allow the user to override by passing a third argument.
JOBS="${3:-$(nproc 2>/dev/null || echo 1)}"

if ! command -v parallel >/dev/null 2>&1; then
  echo "Error: GNU parallel is not installed or not on PATH." >&2
  exit 1
fi

if [ ! -f "$ARGS_FILE" ]; then
  echo "Error: args file not found: $ARGS_FILE" >&2
  exit 2
fi

# Make sure output directory exists
mkdir -p "$(dirname "$OUT_FILE")"

echo "Starting parallel run: args=$ARGS_FILE out=$OUT_FILE jobs=$JOBS" >&2
printf "# Run started: %s\n" "$(date --iso-8601=seconds)" >> "$OUT_FILE"

# Stream sanitized lines (at least 8 fields, normalized whitespace) directly
# into GNU parallel; we no longer create a temporary snapshot file.
awk 'NF >= 8 {print $1, $2, $3, $4, $5, $6, $7, $8}' "$ARGS_FILE" |
  parallel --colsep ' ' -j "$JOBS" \
    python3 "$PROG_DIR/hunt.py" {1} {2} {3} {4} {5} {6} {7} {8} >> "$OUT_FILE" 2>&1

printf "# Run finished: %s\n" "$(date --iso-8601=seconds)" >> "$OUT_FILE"

echo "Parallel run complete; results in $OUT_FILE" >&2
