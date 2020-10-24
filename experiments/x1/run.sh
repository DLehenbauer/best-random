npm run make:rng:rng
logDir=$PWD/logs

mkdir $logDir
parallel --workDir "../../tools/GJRand/src/gjrand.4.3.0.0/testunif/" "mkdir '$logDir/{1}-{2}' && ../../../../Rng/rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./mcp --tiny -d '$logDir/{1}-{2}'" ::: {0..31} ::: {0..31}

node p.js > report-tiny.json
cat report-tiny.json | node f.js > args
rm -rf logs
mkdir $logDir
cat args | parallel --colsep ' ' --workDir "../../tools/GJRand/src/gjrand.4.3.0.0/testunif/" "mkdir '$logDir/{1}-{2}' && ../../../../Rng/rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./mcp --standard -d '$logDir/{1}-{2}'"