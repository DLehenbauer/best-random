#!/bin/bash

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

logDir="$script_dir/logs"
argsFile="$script_dir/args"
passFile="$script_dir/pass"
filterScript="$script_dir/f2.js"

# 'mcp' requires working directory to be testunif to find test binaries.
workDir="$script_dir/../../tools/GJRand/src/gjrand.4.3.0.0/testunif/"

# RNG executable relative to workDir
rng="../../../../Rng/rng"

test_core () {
    bin=$1
    sizeName=$2
    sizeBytes=$3
    reportArg=$4
    cleanupAfter=${5:-true}  # Optional 5th parameter, defaults to true

    echo "[$(date '+%m/%d %T')]: Removing '$logDir'..."
    find $logDir -delete

    touch pass

    testName=$(basename ${bin})

    reportFile=report-$testName-$sizeName.json

    echo -n "[$(date '+%m/%d %T')]: $testName ($sizeName) : $(cat $argsFile | wc --lines) "
    
    start=`date`
    
    # Build the parallel command with optional cleanup
    if [ "$cleanupAfter" = "true" ]; then
        cleanupCmd="&& rm -rf '$logDir/{1}/{2}'"
    else
        cleanupCmd=""
    fi
    
    cat $argsFile | parallel --colsep ' ' --workDir $workDir "mkdir -p '$logDir/{1}/{2}' && $rng -p0 {1} -p1 {2} | stdbuf -oL -eL $bin $sizeBytes $reportArg && node $filterScript $logDir {1} {2} | tee -a $passFile > /dev/null $cleanupCmd" \
       && cp $argsFile $argsFile.bak \
       && cp $passFile $passFile.bak \
       && cat $passFile | sort -g | uniq > $argsFile \
       && rm $passFile

    exit_code=$?

    if [ $exit_code -ne 0 ]; then
        >&2 echo "\nFailed with exit code ${exit_code}."
        exit $exit_code
    fi

    stop=`date`
    elapsed=`date -ud@$(($(date -ud"$stop" +%s)-$(date -ud"$start" +%s))) +%T`
    echo "-> $(cat $argsFile | wc --lines) ($elapsed)"
}

test () {
    sizeName=$2
    sizeBytes=$3
    cleanupAfter=${4:-true}  # Optional 4th parameter, defaults to true

    if [[ "$1" == "mcp" || "$1" == "pmcp" ]]; then
        bin="./$1"
        reportArg="-d '$logDir/{1}/{2}' > /dev/null"
    else
        bin="./bin/$1"
        reportArg="--progress > '$logDir/{1}/{2}/report.txt'"
    fi

    test_core $bin $sizeName $sizeBytes "$reportArg" $cleanupAfter | tee -a run.log
}

reset () {
    rm ../../tools/Rng/rng
    npm run make:rng:rng

    echo "[$(date '+%m/%d %T')]: Removing 'report-*.json'..."
    rm -f report-*.json
    
    echo "[$(date '+%m/%d %T')]: Removing '$passFile'..."
    rm -f $passFile

    echo "[$(date '+%m/%d %T')]: Removing '$argsFile'..."
    rm -f $argsFile
    
    echo "[$(date '+%m/%d %T')]: Building '$argsFile'..."
    for ((i = 0; i < 1024; i += 1));
    do
        for ((j = 0; j < 1024; j += 1));
        do
            echo "$i $j" >> $argsFile
        done
    done
}

size_tiny="tiny 10485760"
size_small="small 104857600"
size_standard="standard 1073741824"
size_big="big 10737418240"
size_huge="huge 107374182400"
size_tera="tera 1099511627776"
size_ten_tera="ten-tera 10995116277760"

echo "[$(date '+%m/%d %T')]: Begin" | tee -a run.log

# 'mod3': chi-square test on mod 3 residues.  Operates on a sliding window of 4 byte blocks.
#         Runs at full size in mcp.
#
# 'z9': Bit balance test, chi-square on 0/1 counts.  Operates on 4KB blocks.  'z9' runs at
#       full size in mcp.
#
# 'lownda': chi-square on low nibble distribution.  Operates on the low 4 bits of each 32 bit
#           word.  'lownda' runs at 1/2 size in mcp.  Sometimes rejects candidates at larger sizes.

#reset | tee -a run.log
#test "mod3" $size_tiny true && \
#test "mod3" $size_small true && \
#test "mod3" $size_standard true && \
#test "z9" $size_standard true && \
#test "mod3" $size_big true && \
#test "z9" $size_big true && \
#test "mod3" $size_huge true && \
#test "z9" $size_huge true && \
#test "mod3" $size_tera false && \
test "z9" $size_tera false && \
test "lownda" $size_tera false && \
test "mcp" $size_tera false

echo "[$(date '+%m/%d %T')]: End" | tee -a run.log
