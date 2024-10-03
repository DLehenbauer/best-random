#!/bin/bash
rm ../../tools/Rng/rng
npm run make:rng:rng

logDir=$PWD/logs
argsFile=$PWD/args
workDir="../../tools/GJRand/src/gjrand.4.3.0.0/testunif/"
rng="../../../../Rng/rng"
bins=(
    "./bin/rda"
    "./bin/mod3"
    "./bin/lownda"
    "./bin/z9"
)

test_bin () {
    bin=$1
    sizeName=$2
    sizeBytes=$3
    reportArg="> '$logDir/{1}/{2}/report.txt'"

    testName=$(basename ${bin})

    reportFile=report-$testName-$sizeName.json

    rm -rf $logDir

    echo -n "$testName: $sizeName $(cat $argsFile | wc --lines) "
    
    start=`date`
    
    mkdir $logDir \
        && cat $argsFile | parallel --colsep ' ' --workDir $workDir "mkdir -p '$logDir/{1}/{2}' && $rng -p0 {1} -p1 {2} | stdbuf -oL -eL $bin $sizeBytes $reportArg" \
        && node p.js > $reportFile \
        && cat $reportFile | node f.js > $argsFile

    exit_code=$?

    if [ $exit_code -ne 0 ]; then
        >&2 echo "\nFailed with exit code ${exit_code}."
        exit $exit_code
    fi

    stop=`date`
    elapsed=`date -ud@$(($(date -ud"$stop" +%s)-$(date -ud"$start" +%s))) +%T`
    echo "-> $(cat $argsFile | wc --lines) ($elapsed)"
}

test_bins () {
    sizeName=$1
    sizeBytes=$2

    for bin in "${bins[@]}"; do
        test_bin $bin $sizeName $sizeBytes
    done
}

test_all () {
    sizeName=$1
    sizeBytes=$2
    reportArg="-d '$logDir/{1}/{2}' > /dev/null"
    bin="./mcp"

    testName=$(basename ${bin})

    reportFile=report-$testName-$sizeName.json

    rm -rf $logDir

    echo -n "$testName: $sizeName $(cat $argsFile | wc --lines) "
    
    start=`date`
    
    mkdir $logDir \
        && cat $argsFile | parallel --colsep ' ' --workDir $workDir "mkdir -p '$logDir/{1}/{2}' && $rng -p0 {1} -p1 {2} | stdbuf -oL -eL $bin $sizeBytes $reportArg" \
        && node p.js > $reportFile \
        && cat $reportFile | node f.js > $argsFile

    exit_code=$?

    if [ $exit_code -ne 0 ]; then
        >&2 echo "\nFailed with exit code ${exit_code}."
        exit $exit_code
    fi

    stop=`date`
    elapsed=`date -ud@$(($(date -ud"$stop" +%s)-$(date -ud"$start" +%s))) +%T`
    echo "-> $(cat $argsFile | wc --lines) ($elapsed)"
}

reset_args () {
    rm -rf $logDir
    mkdir $logDir

    rm -f $argsFile
    rm -f report-*.json
    for i in {0..4095}
    do
        for j in {0..4095}
        do
            echo "$i $j" >> $argsFile
        done
    done
}

size_tiny=10485760
size_small=104857600
size_standard=1073741824
size_big=10737418240
size_standard=1073741824
size_huge=107374182400
size_tera=1099511627776
size_ten_tera=10995116277760

#reset_args

test_bins tiny $size_tiny && \
test_bins small $size_small && \
test_bins standard $size_standard && \
test_all small $size_small && \
test_bins big $size_big && \
test_all standard $size_standard && \
test_bins huge $size_huge && \
test_all big $size_big && \
test_bins tera $size_tera && \
test_all huge $size_huge && \
test_bins ten-tera $size_ten_tera && \
test_all tera $size_tera && \
test_all ten-tera $size_ten_tera