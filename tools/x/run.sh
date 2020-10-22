npm run make:rng:rng
logDir=$PWD/logs
mkdir $logDir
parallel --workDir ../GJRand/src/gjrand.4.3.0.0/testunif/ "mkdir '$logDir/{1}-{2}' && ../../../../Rng/rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./mcp --small -d '$logDir/{1}-{2}'" ::: {0..31} ::: {0..31}