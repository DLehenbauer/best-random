const assert = require("assert").strict;
const fs = require('fs');

const testExp = /^============\n([^)]+) \(\d+ bytes\)\n=======[\s\S]*?^one sided P value \(very small numbers are bad\)\nP = ([^\n]+)$/gm;
const overallExp = /^====================\ncompleted (\d+) tests\n(\d+) out of (\d+) tests ok\.\n([\s\S]*)\n\nOverall summary one sided P-value \(smaller numbers bad\)\nP = ([^ ]+) : (.*)+$/gm;
const failuresExp = /^(\d+) grade (\d+) failures \((.*)\).$/gm;
const worstExp = /^Worst test result \[(.*)\]\.$/gm;

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

        const match = (exp, callback) => {
            return matchAll(exp, (matches) => {
                assert.equal(matches.length, 1, `Expected 0 or 1 match, but got '${matches.length}'`);
                callback(matches[0]);
            });
        }

        const result = {};

        matchAll(testExp, ($) => {
            result.tests = $.map(([, name, p]) => ({ name, p: parseFloat(p) }));
            result.worst = result.tests.reduce(
                (worst, test) => test.p < worst.p
                    ? test
                    : worst,
                result.tests[0]);
        });

        match(overallExp, ($) => {
            result.completed = parseInt($[1]);
            result.passed = parseInt($[2]);
            assert.equal(parseInt($[3]), result.completed);
            result.p = parseFloat($[5]);
            result.evaluation = $[6];
        });

        matchAll(failuresExp, ($) => {
            result.failures = $.map(([, count, grade, evaluation]) => ({
                grade: parseInt(grade),
                count: parseInt(count),
                evaluation
            }));
        });

        match(worstExp, ($) => {
            assert(result.worst.name.startsWith($[1]));
        });

        for (const property of ["completed", "passed", "evaluation", "p"]) {
            assert.notEqual(result[property], undefined, `Require property '${property}' missing from '${filename}'.`)
        }

        accept(result);
    });
}

(async () => {
    console.clear();

    let table = [];
    let p0 = 0, p1 = 0;
    try {
        for (p0 = 0; p0 < 32; p0++) {
            for (p1 = 0; p1 < 32; p1++) {
                const filename = `./logs/${p0}-${p1}/report.txt`;
                if (fs.existsSync(filename)) {
                    const results = await parseFile(filename);
                    table.push({
                        p0,
                        p1,
                        ...results
                    });
                }
            }
        }
    } catch (e) {
        console.warn(`Abort at ${p0},${p1}: ${e.message}`);
    }

    table.sort((left, right) => right.p - left.p);
    fs.writeFileSync("./report.json", JSON.stringify(table, undefined, 2));
})()
