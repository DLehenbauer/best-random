"use strict";

const assert = require("assert").strict;
const fs = require('fs');
const readline = require('readline');

const readInterface = readline.createInterface({
    input: fs.createReadStream('u64.log'),
    console: false
});

const table = [];

let p0 = -1, p1 = -1;
let length = 0;
let anomalies = 0;
let unusual = 0;
let suspicious = 0;
let failures = 0;

const paramExp = />>> p0=(\d+), p1=(\d+)$/;
const lengthExp = /length= \d+ \w+ \(\d+\^(\d+) bytes\), time= [0-9.]+ seconds$/;
const unusExp = /\bunusual\b/;
const suspExp = /\bsuspicious\b/i;
const failExp = /\bFAIL\b/;
const anomExp = /\bR.*\bp.*=.*$/;

function toIndex(p0, p1) {
    assert(0 <= p0 && p0 < 32);
    assert(0 <= p1 && p1 < 32);

    return p0 * 32 + p1;
}

function record() {
    assert.equal(unusual + suspicious + failures, anomalies);
    assert(length >= 0);

    if (p0 >= 0) {
        const i = toIndex(p0, p1);
        table[i] = { p0, p1, delta: p1 - p0, length, failures, suspicious, unusual, anomalies };
    }

    length = -1;
    anomalies = 0;
    unusual = 0;
    suspicious = 0;
    failures = 0;
}

readInterface.on('line', function(line) {
    {
        const matches = line.match(paramExp);
        if (matches) {
            const next0 = parseInt(matches[1]);
            const next1 = parseInt(matches[2]);

            assert((next0 === p0 && next1 === p1 + 1)
                || (next0 === p0 + 1 && next1 === 0));

            record();
        
            p0 = next0;
            p1 = next1;
        }
    }

    {
        const matches = line.match(lengthExp);
        if (matches) {
            length = parseInt(matches[1]);
        }
    }

    if (line.match(anomExp)) { anomalies++; }
    if (line.match(unusExp)) { unusual++; }
    if (line.match(suspExp)) { suspicious++; }
    if (line.match(failExp)) { failures++; }

    assert.equal(unusual + suspicious + failures, anomalies);
});

readInterface.on("close", () => {
    record();

    const remaining = table
        .filter((row) => row.failures === 0)
        .sort((left, right) => right.length - left.length)
        .sort((left, right) => left.anomalies - right.anomalies);

    console.table(remaining);
    console.log(`${remaining.length}/${table.length} (${(remaining.length/table.length * 100).toFixed(1)}%) remaining`);

    let deltas = [];
    for (const row of remaining) {
        const delta = row.delta + 32;               // +32 to avoid negative array indices
        deltas[delta] = (deltas[delta] | 0) + 1;
    }

    deltas = deltas.map((count, index) => ({ delta: index - 32, count }));  // -32 to compensate for above.

    console.table(deltas.sort((left, right) => right.count - left.count));
});
