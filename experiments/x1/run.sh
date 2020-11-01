npm run make:rng:rng

logDir=$PWD/logs
workDir="../../tools/GJRand/src/gjrand.4.3.0.0/testunif/"
rng="../../../../Rng/rng"

process () {
    size=$1

    node p.js > report-$size.json \
        && cat report-$size.json | node f.js > args \
        && rm -rf logs
}

run () {
    size=$1

    mkdir $logDir \
        && cat args | parallel --colsep ' ' --workDir $workDir "mkdir '$logDir/{1}-{2}' && $rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./mcp --$size -d '$logDir/{1}-{2}'" \
        && process $size
}

mkdir $logDir
parallel --workDir $workDir "mkdir '$logDir/{1}-{2}' && $rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./mcp --tiny -d '$logDir/{1}-{2}'" ::: {0..31} ::: {0..31}

process tiny \
    && run small \
    && run standard \
    && run big \
    && run huge \
