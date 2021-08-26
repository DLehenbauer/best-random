#!/bin/bash
npm run make:rng:rng

logDir=$PWD/logs
argsFile=$PWD/args
workDir="../../tools/GJRand/src/gjrand.4.3.0.0/testunif/"
rng="../../../../Rng/rng"

test () {
    testName=$1
    bin=$2
    reportArg=$3
    sizeName=$4
    sizeBytes=$5

    reportFile=report-$testName-$sizeName.json

    rm -rf $logDir

    echo "$testName: $sizeName $(cat $argsFile | wc --lines)"

    mkdir $logDir \
        && cat $argsFile | parallel --colsep ' ' --workDir $workDir "mkdir '$logDir/{1}-{2}' && $rng -p0 {1} -p1 {2} | stdbuf -oL -eL $bin $sizeBytes $reportArg" \
        && node p.js > $reportFile \
        && cat $reportFile | node f.js > $argsFile
}

run () {
    name=$1
    bin=$2
    reportArg=$3

    test $name $bin "$reportArg" tiny 10485760 \
        && test $name $bin "$reportArg" small 104857600 \
        && test $name $bin "$reportArg" standard 1073741824 \
        && test $name $bin "$reportArg" big 10737418240 \
        && test $name $bin "$reportArg" huge 107374182400 \
        && test $name $bin "$reportArg" tera 1099511627776 \
        && test $name $bin "$reportArg" ten-tera 10995116277760
}

rm -f $argsFile
rm -f report-*.json
for i in {0..31}
do
    for j in {0..31}
    do
        echo "$i $j" >> $argsFile
    done
done

run  "all" "./mcp" "-d '$logDir/{1}-{2}' > /dev/nul"
#run "mod3" "./bin/mod3" "> '$logDir/{1}-{2}/report.txt'"
