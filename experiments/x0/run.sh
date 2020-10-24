npm run make:rng:rng
logDir=$PWD/logs
mkdir $logDir
cat args | parallel --colsep ' ' --workDir "../GJRand/src/gjrand.4.3.0.0/testunif/" "mkdir '$logDir/{1}-{2}' && ../../../../Rng/rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./mcp --huge -d '$logDir/{1}-{2}'"