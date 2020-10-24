#! /bin/bash

# User configuration
tlmax=256MB

# Create log directory
workDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
npm run make:rng:rng
logDir=$workDir/logs
mkdir $logDir

# Run job
parallel --workDir $workDir "(echo '>>> p0={1}, p1={2}' && ../Rng/rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./RNG_test stdin64 -seed 0 -te 1 -tlmin 64MB -tlmax $tlmax 2>&1) | tee -a $logDir/{1}-{2}.txt" ::: {0..31} ::: {0..31}
