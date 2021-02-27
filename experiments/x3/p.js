const assert = require("assert").strict;
const fs = require('fs');

const resultExp = /^P = (.*)$/gm;

async function parseFile(filename) {
    return new Promise((accept) => {
        const data = fs.readFileSync(filename, 'utf8');

        const matchAll = (exp, callback) => {
            const allMatches = [...data.matchAll(exp)];
            if (allMatches.length > 0) {
                callback(allMatches);
                return true;
            }

            return false;
        }

        // const match = (exp, callback) => {
        //     return matchAll(exp, (matches) => {
        //         assert.equal(matches.length, 1, `Expected 0 or 1 match, but got '${matches.length}'`);
        //         callback(matches[0]);
        //     });
        // }

        const result = {};

        matchAll(resultExp, ($) => {
            const ps = $.map(([, p]) => parseFloat(p));
            const p = ps[ps.length - 1];
            result.p = p;
            result.worst = { p };
            result.passed = p <= 1e-8 ? 0 : 1;
            result.evaluation = p <= 1e-10
                ? "EXTREMELY Worrying and very unusual"
                : p <= 1e-8
                    ? "Worrying and very unusual"
                    : p <= 1e-6
                        ? "very unusual"
                        : p <= 0.01
                            ? "unusual"
                            : "ok";
        });

        for (const property of ["p"]) {
            assert.notEqual(result[property], undefined, `Require property '${property}' missing from '${filename}'.`);
        }

        accept(result);
    });
}

(async () => {
    console.clear();

    let table = [];
    let p0 = 0, p1 = 0;
    for (p0 = 0; p0 < 32; p0++) {
        for (p1 = 0; p1 < 32; p1++) {
            const filename = `./logs/${p0}-${p1}/report.txt`;
            if (fs.existsSync(filename)) {
                try {
                    const results = await parseFile(filename);
                    table.push({
                        p0,
                        p1,
                        ...results
                    });
                } catch (e) {
                    console.warn(`Abort at ${p0},${p1}: ${e.message}`);
                }
            }
        }
    }

    table.sort((left, right) => right.final - left.final);
    console.log(JSON.stringify(table, undefined, 2));
})()
