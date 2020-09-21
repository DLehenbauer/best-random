"use strict";

const assert = require("assert").strict;
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

const table = new Array(32 * 32).fill(undefined).map(() => ({
    length: 0,
    failures: 0,
    suspicious: 0,
    unusual: 0,
    anomalies: 0,
}));

function toIndex(p0, p1) {
    assert(0 <= p0 && p0 < 32);
    assert(0 <= p1 && p1 < 32);

    return p0 * 32 + p1;
}

function getRow(p0, p1) {
    return table[toIndex(p0, p1)];
}

async function parseFile(filename) {
    return new Promise((accept) => {
        const readInterface = readline.createInterface({
            input: fs.createReadStream(filename),
            console: false
        });


        let p0 = -1, p1 = -1;
        let length = 0;
        let lastLength = -1;
        let anomalies = 0;
        let unusual = 0;
        let suspicious = 0;
        let failures = 0;
        let lastAnomalous = false;
        let lastUnusual = false;
        let lastSuspicious = false;
        let lastFailed = false;

        const paramExp = />>> p0=(\d+), p1=(\d+)$/;
        const lengthExp = /length= \d+ \w+ \(\d+\^(\d+) bytes\), time= [0-9.]+ seconds$/;
        const unusExp = /\bunusual\b/;
        const suspExp = /\bsuspicious\b/i;
        const failExp = /\bFAIL\b/;
        const anomExp = /\bR.*\bp.*=.*$/;

        function record() {
            assert.equal(unusual + suspicious + failures, anomalies);
            // assert(length >= 0);

            if (p0 >= 0) {
                const i = toIndex(p0, p1);
                const row = table[i];
                table[i] = {
                    p0,
                    p1,
                    delta: p1 - p0,
                    length: Math.max(row.length, length),
                    failures: Math.max(row.failures, failures),
                    suspicious: Math.max(row.suspicious, suspicious),
                    unusual: Math.max(row.unusual, unusual),
                    anomalies: Math.max(row.anomalies, anomalies),
                    lastAnomalous,
                    lastUnusual,
                    lastSuspicious,
                    lastFailed,
                };
            }

            lastLength = length;
            length = -1;
            anomalies = 0;
            unusual = 0;
            suspicious = 0;
            failures = 0;
            lastAnomalous = false;
            lastUnusual = false;
            lastSuspicious = false;
            lastFailed = false;
        }

        readInterface.on('line', function(line) {
            {
                const matches = line.match(paramExp);
                if (matches) {
                    const next0 = parseInt(matches[1]);
                    const next1 = parseInt(matches[2]);

                    assert(next0 > p0 || (next0 === p0 && next1 > p1));

                    record();
                
                    p0 = next0;
                    p1 = next1;
                }
            }

            {
                const matches = line.match(lengthExp);
                if (matches) {
                    length = parseInt(matches[1]);
                    lastAnomalous = false;
                    lastUnusual = false;
                    lastSuspicious = false;
                    lastFailed = false;        
                }
            }

            const isAnomalous = line.match(anomExp);
            const isUnusual = line.match(unusExp);
            const isSuspicious = line.match(suspExp);
            const isFailed = line.match(failExp);

            if (isAnomalous) { anomalies++; }
            if (isUnusual) { unusual++; }
            if (isSuspicious) { suspicious++; }
            if (isFailed) { failures++; }

            lastAnomalous = lastAnomalous || isAnomalous;
            lastUnusual = lastUnusual || isUnusual;
            lastSuspicious = lastSuspicious || isSuspicious;
            lastFailed = lastFailed || isFailed;

            assert.equal(unusual + suspicious + failures, anomalies);
        });

        readInterface.on("close", () => {
            record();
            accept({ table, p0, p1, length: lastLength });
        });   
    });
}

const colorFn = (row, isCurrent, length) => {
    const str = length > 0
        ? `${length}`
        : "??"

    if (isCurrent) {
        return row.lastSuspicious
            ? chalk.bgRed(chalk.black(str))
            : row.lastAnomalous
                ? chalk.bgYellow(chalk.black(str))
                : chalk.bgWhite(chalk.black(str));
    }

    assert.equal(length, row.length);

    return row.failures > 0
        ? chalk.gray("..")
        : row.lastSuspicious
            ? chalk.red(str)
            : row.lastAnomalous
                ? chalk.yellow(str)
                : row.length < 42
                    ? chalk.gray(str)
                    : chalk.white(str);
}

function showMap(current, fn = colorFn) {
    let line = "   ";
    for (let p0 = 0; p0 < 32; p0++) {
        line += `${p0}`.padStart(2, " ") + " ";
    }
    console.log(line);

    for (let p0 = 0; p0 < 32; p0++) {
        line = `${p0}`.padStart(2, " ") + " ";
        for (let p1 = 0; p1 < 32; p1++) {
            const row = getRow(p0, p1);

            let length = row.length;
            let isCurrent = false;

            for (const entry of current) {
                if (p0 === entry.p0 && p1 === entry.p1) {
                    isCurrent = true;
                    length = entry.length;
                    break;
                }
            }

            line += `${fn(row, isCurrent, length)} `;
        }

        console.log(line);
    }
}

function genScript(tlmax, limit, config) {
    const header = `#!/bin/bash

logFile="rr-u64-${tlmax.toLowerCase()}-$(echo "\${0##*/}" | cut -f 1 -d '.').log"
clear
echo ">>> Logging to: $logFile"

test () {
    p0=$1
    p1=$2

    # echo "static uint32_t r0 = $p0;" > ./Rng/params.h
    # echo "static uint32_t r1 = $p1;" >> ./Rng/params.h

    # npm run make:practrand:rng
    # (echo ">>> p0=$p0, p1=$p1" && stdbuf -oL -eL ./PractRand/RNG_test best -tf 2 -te 1 -multithreaded -tlmin 256MB -tlmax ${tlmax.toUpperCase()} 2>&1) | tee -a $logFile

    (echo ">>> p0=$p0, p1=$p1" && ./Rng/rng -p0 $p0 -p1 $p1 | stdbuf -oL -eL ./PractRand/RNG_test stdin64 -seed 0 -tf 2 -te 1 -multithreaded -tlmin 64MB -tlmax ${tlmax.toUpperCase()} 2>&1) | tee -a $logFile
}

npm run make:rng
echo
`;

    const max = Math.max(...config.map(_ => _.time));
    const total = config.reduce((accumulator, _) => accumulator + (max / _.time), 0);

    const jobParams = config.map(({ name, time, procs }) => ({
        name,
        procs,
        ratio: (max / time) / total
    }));

    const tests = [];

    for (let p0 = 0; p0 < 32; p0++) {
        for (let p1 = 0; p1 < 32; p1++) {
            const row = getRow(p0, p1);
            if (row.failures === 0 && row.length < limit) {
                tests.push({p0, p1});
            }
        }
    }

    const jobs = [];

    let start = 0;
    for (const { name, procs, ratio } of jobParams) {
        const adjustedRatio = ratio / procs;
        const testCount = Math.ceil(tests.length * adjustedRatio);
        for (let batch = 1; batch <= procs; batch++) {            
            jobs.push({
                name: `${name}-${batch}`,
                tests: tests.slice(start, start + testCount),
                ratio,
                adjustedRatio,
            });

            start += testCount;
        }
    }

    // Sanity check that each test appears in exactly one job.
    for (const test of tests) {
        let found = 0;

        for (const job of jobs) {
            if (job.tests.indexOf(test) >= 0) {
                found++;
            }
        }

        assert.equal(found, 1, `All tests must be included exactly once, but found ${JSON.stringify(test)} ${found} times.`);
    }

    for (const {name, tests, ratio, adjustedRatio} of jobs) {
        console.log(`${name}.sh: ${tests.length} (${(adjustedRatio * 100).toFixed(1)}%)`)

        fs.writeFileSync(`${name}.sh`, `${header}

${tests.map(({p0, p1}) => `test ${p0} ${p1}`).join("\n")}
`);
    }
}

function genCsv(limit) {
    console.log(`S?,p0,p1,H,HR,L,LR`)
    for (let p0 = 0; p0 < 32; p0++) {
        for (let p1 = 0; p1 < 32; p1++) {
            const row = getRow(p0, p1);
            if (row.failures === 0 && row.length >= limit) {
                console.log(`${row.lastSuspicious ? '*' : ''},${p0},${p1},,,,`)
            }
        }

        assert.equal(found, 1);
    }

    for (const {name, tests, ratio, adjustedRatio} of jobs) {
        console.log(`${name}.sh: ${tests.length} (${(adjustedRatio * 100).toFixed(1)}%)`)

        fs.writeFileSync(`${name}.sh`, `${header}

${tests.map(({p0, p1}) => `test ${p0} ${p1}`).join("\n")}
`);
    }
}

const oldLogs = [
    "rr-u64-64gb.log",
    "rr-u64-512gb.log",
    "rr-u64-8tb-home.log",
].concat([
    "mid-1", "mid-2", "pc-1", "pc-2", "slow-1", "slow-2"
].map((name) => `rr-u64-4tb-${name}.log`));

const currentLogs = [
    "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"
].map((name) => `rr-u64-4tb-${name}.log`);

const display = async () => {
    console.clear();
    showMap(await Promise.all(currentLogs.map(log => parseFile(log))));
}

Promise.all(oldLogs.map(log => parseFile(log))).then(() => {
    display();
    setInterval(display, 60 * 1000);
});

// genScript("4tb", /* limit: */ 42, [
//     { name: "2", time: 14810 + 14805, procs: 2 },
//     { name: "3", time: 16616 + 16615, procs: 2 },
//     { name: "4", time: 25184 + 27885, procs: 2 },
// ]);
// genCsv(42);