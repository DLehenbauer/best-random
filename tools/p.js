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
            assert(length >= 0);

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
    if (isCurrent) {
        return row.lastSuspicious
            ? chalk.bgRed(chalk.black(length))
            : row.lastAnomalous
                ? chalk.bgYellow(chalk.black(length))
                : chalk.bgGray(chalk.black(length));
    }

    return row.failures > 0
        ? chalk.gray("..")
        : row.lastSuspicious
            ? chalk.red(length)
            : row.lastAnomalous
                ? chalk.yellow(length)
                : row.length < 42
                    ? chalk.gray(length)
                    : chalk.white(length);
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

function genScript(limit, logFile) {
    console.log(`#!/bin/bash

logFile="rr-u64-${limit.toLowerCase()}-$(echo "\${0##*/}" | cut -f 1 -d '.').log"
clear
echo ">>> Logging to: $logFile"

test () {
    p0=$1
    p1=$2

    (echo ">>> p0=$p0, p1=$p1" && ./Rng/rng -p0 $p0 -p1 $p1 | stdbuf -oL -eL ./PractRand/RNG_test stdin64 -seed 0 -tf 2 -te 1 -multithreaded -tlmin 256MB -tlmax ${limit.toUpperCase()} 2>&1) | tee -a $logFile
}

npm run make:rng
echo
`)
    for (let p0 = 0; p0 < 32; p0++) {
        for (let p1 = 0; p1 < 32; p1++) {
            const row = getRow(p0, p1);
            if (row.failures === 0 && row.length < 42) {
                console.log(`test ${p0} ${p1}`);
            }
        }
    }
}

console.clear();
parseFile("rr-u64-64gb.log").then(async () => {
    await parseFile("rr-u64-512gb.log");
    await parseFile("rr-u64-8tb-home.log");
    
    await Promise.all([
        "mid-1", "mid-2", "pc-1", "pc-2", "slow-1", "slow-2"
    ].map((name) => parseFile(`rr-u64-4tb-${name}.log`)));

    const current = await Promise.all([
        "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"
    ].map((name) => parseFile(`rr-u64-16tb-${name}.log`)));

    showMap(current);
    // genScript("16tb", "u64-2.log");
});