#!/bin/bash
npm run make:rng:rng

logDir=$PWD/logs
argsFile=$PWD/args
workDir="../../tools/GJRand/src/gjrand.4.3.0.0/testunif/bin"
rng="../../../../../Rng/rng"

run () {
    name=$1
    size=$2
    filter=$3

    rm -rf $logDir
    mkdir $logDir \
        && cat $argsFile | parallel --colsep ' ' --workDir $workDir "mkdir '$logDir/{1}-{2}' && $rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./mod3 $size > '$logDir/{1}-{2}/report.txt'" \
        && node p.js > report-mod3-$name.json \
        && cat report-mod3-$name.json | node f$filter.js > $argsFile
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

run tiny 10485760 1 \
    && run small 104857600 1 \
    && run standard 1073741824 1 \
    && run big 10737418240 1 \
    && run huge 107374182400 1
