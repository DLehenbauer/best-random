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
OUT_FILE="${1:-$PROG_DIR/results.txt}"

# Make sure output directory exists
mkdir -p "$(dirname "$OUT_FILE")"

printf "# Run started: %s\n" "$(date --iso-8601=seconds)" | tee -a "$OUT_FILE"
python3 "$PROG_DIR/hunt.py" {1} {2} {3} {4} {5} {6} 2>&1 | tee -a "$OUT_FILE"
printf "# Run finished: %s\n" "$(date --iso-8601=seconds)" | tee -a "$OUT_FILE"

echo "Parallel run complete; results in $OUT_FILE"
