#!/bin/bash
npm run make:rng:rng

logDir=$PWD/logs
argsFile=$PWD/args
workDir="../../tools/GJRand/src/gjrand.4.3.0.0/testunif/"
rng="../../../../Rng/rng"

all () {
    size=$1
    filter=$2

    rm -rf $logDir
    mkdir $logDir \
        && cat $argsFile | parallel --colsep ' ' --workDir $workDir "mkdir '$logDir/{1}-{2}' && $rng -p0 {1} -p1 {2} | stdbuf -oL -eL ./mcp --$size -d '$logDir/{1}-{2}'" \
        && node p.js > report-$size.json \
        && cat report-$size.json | node f.js > $argsFile
}

mod3 () {
    name=$1
    size=$2

    rm -rf $logDir
    mkdir $logDir \
        && cat $argsFile | parallel --colsep ' ' --workDir "$workDir/bin" "mkdir '$logDir/{1}-{2}' && '../$rng' -p0 {1} -p1 {2} | stdbuf -oL -eL ./mod3 $size > '$logDir/{1}-{2}/report.txt'" \
        && node p.js > report-mod3-$name.json \
        && cat report-mod3-$name.json | node f.js > $argsFile
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

all tiny 10485760 \
    && all small 104857600 \
    && mod3 standard 1073741824 \
    && mod3 big 10737418240 \
    && mod3 huge 107374182400 \
    && mod3 tera 1099511627776 \
    && mod3 ten-tera 10995116277760
