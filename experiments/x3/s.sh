#!/bin/bash

update () {
    lastPassed=$(tail -n 1 pass)
    processed=$(grep -n "^$lastPassed$" pass.bak | cut -d : -f 1)
    passed=$(cat pass | wc -l)
    rejected=$(echo "scale=2; $processed - $passed" | bc)
    percent=$(echo "scale=2; 100 - ($passed * 100) / $processed" | bc)
    total=$(cat args | wc -l)
    done=$(echo "scale=2; ($processed * 100) / $total" | bc)

    echo
    date
    echo "$lastPassed -- passed: $passed processed: $processed ($done%) rejected: $rejected ($percent%)"
}

# Update the display once every 'n' seconds
#while true; do update; sleep 10; done;
update
