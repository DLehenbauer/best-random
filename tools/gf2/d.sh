#!/usr/bin/env bash
# Continuously clear the screen and print the tail of results.txt every 10 seconds.
# Usage: ./d.sh [lines]
# Example: ./d.sh 50

set -euo pipefail
LINES=${1:-10}
FILE="results.txt"

if [[ ! -e "$FILE" ]]; then
  echo "Error: $FILE not found in $(pwd)" >&2
  exit 2
fi

trap 'echo; echo "Exiting."; exit' INT TERM

total=$(cat args | wc -l)
processed=$(cat "$FILE" | wc -l)
percent_done=$(echo "scale=2; ($processed * 100) / $total" | bc)

passed=$(echo $(grep -c ": OK" "$FILE"))
rejected=$(echo "scale=2; $processed - $passed" | bc)
percent_passed=$(echo "scale=2; 100 - ($passed * 100) / $processed" | bc)

echo
echo "== tail of $FILE - $(date) =="
tail -n "$LINES" "$FILE"
echo "ok: $passed processed: $processed/$total ($percent_done%) rejected: $rejected/$processed ($percent_passed%)"
echo
