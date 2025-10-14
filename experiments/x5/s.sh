#!/bin/bash

# Note that pass and pass.bak are only approximately sorted, so negative/inaccurate results
# are possible (most noticeable early in the run).

update () {
    previous_args_file="pass.bak"

    total=$(cat $previous_args_file | wc -l)
    lastPassed=$(tail -n 1 pass)
    processed=$(grep -n "^$lastPassed$" $previous_args_file | cut -d : -f 1)
    percent_done=$(echo "scale=2; ($processed * 100) / $total" | bc)

    passed=$(cat pass | wc -l)
    rejected=$(echo "scale=2; $processed - $passed" | bc)
    percent_passed=$(echo "scale=2; 100 - ($passed * 100) / $processed" | bc)

    echo
    date
    echo "$lastPassed -- processed: $processed/$total ($percent_done%) rejected: $rejected/$processed ($percent_passed%)"
    echo
    node ./scan.js
}

# Update the display once every 'n' seconds
#while true; do update; sleep 10; done;
update
