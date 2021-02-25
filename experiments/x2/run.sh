#!/bin/bash
npm run make:rng:rng

logDir=$PWD/logs
argsFile=$PWD/args
workDir="../../tools/GJRand/src/gjrand.4.3.0.0/testunif/"
rng="../../../../Rng/rng"

run () {
    size=$1
    filter=$2

    rm -rf $logDir
    mkdir $logDir \
        && cat $argsFile | parallel --colsep ' ' --workDir $workDir "mkdir '$logDir/{1}-{2}' && $rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./mcp --$size -d '$logDir/{1}-{2}'" \
        && node p.js > report-$size.json \
        && cat report-$size.json | node f$filter.js > $argsFile
}

rm $argsFile
rm report-*.json
for i in {0..31}
do
    for j in {0..31}
    do
        echo "$i $j" >> $argsFile
    done
done

run tiny 1 \
    && run small 1 \
    && run standard 2 \
    && run big 2
