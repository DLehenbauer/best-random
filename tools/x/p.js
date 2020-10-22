const assert = require("assert").strict;
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

async function parseFile(filename) {
    return new Promise((accept, reject) => {
        const readInterface = readline.createInterface({
            input: fs.createReadStream(filename),
            console: false
        });

        readInterface.on("close", () => {
            reject(new Error("Could not parse P value summary."));
        });


        const passedExp = /^(\d+) out of 13 tests ok.$/;
        const summaryExp = /^Overall summary one sided P-value \(smaller numbers bad\)$/;
        const pExp = /^P = ([^ ]+)/;

        let summary = false;
        let passed = -1;

        readInterface.on('line', function(line) {
            if (passed < 0) {
                const matches = line.match(passedExp);
                if (matches !== null) {
                    passed = parseInt(matches[1]);
                }
            } else if (!summary) {
                if (line.match(summaryExp)) {
                    summary = true;
                }
            } else {
                const matches = line.match(pExp);
                readInterface.removeAllListeners();

                accept({ p: matches[1], passed });
            }
        });
    });
}

(async () => {
    let table = [];
    let p0 = 0, p1 = 0;
    try {
        for (p0 = 0; p0 < 32; p0++) {
            for (p1 = 0; p1 < 32; p1++) {
                const filename = `./logs/${p0}-${p1}/report.txt`;
                if (fs.existsSync(filename)) {
                    const { p, passed } = await parseFile(filename);
                    table.push({
                        p0,
                        p1,
                        p,
                        passed
                    });
                }
            }
        }
    } catch (e) {
        console.warn(`Abort at ${p0},${p1}: ${e.message}`);
    }

    table.sort((left, right) => right.p - left.p);

    console.table(
        table // .filter((row) => row.passed === 13),
    );
})()
