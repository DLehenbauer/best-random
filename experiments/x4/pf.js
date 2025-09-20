const assert = require("assert").strict;
const fs = require('fs');
const path = require('path');

async function parseAll(data, filename) {
    const configExp = /^\*{5} MCP version ([^ ]+) ([^ ]+) \*{5}$/gm;

    const bytesToSize = {
        10485760: "tiny",
        104857600: "small",
        1073741824: "standard",
        10737418240: "big",
        107374182400: "huge",
        1099511627776: "tera",
        10995116277760: "ten-tera",
    };

    const friendlySize = (size) => {
        const maybeFriendly = bytesToSize[size];
        return maybeFriendly !== undefined
            ? maybeFriendly
            : size;
    }
    
    return new Promise((accept) => {
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

        if (match(configExp, ($) => {
            result.version = $[1];
            result.size = friendlySize($[2]);
        })) {
            const testExp = /^============\n([^)]+) \(\d+ bytes\)\n=======[\s\S]*?^one sided P value \(very small numbers are bad\)\nP = ([^\n]+)$/gm;
            const overallExp = /^====================\ncompleted (\d+) tests\n(\d+) out of (\d+) tests ok\.\n([\s\S]*)\n\nOverall summary one sided P-value \(smaller numbers bad\)\nP = ([^ ]+) : (.*)+$/gm;
            const failuresExp = /^(\d+) grade (\d+) failures \((.*)\).$/gm;
            const worstExp = /^Worst test result \[(.*)\]\.$/gm;
        
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
    
            for (const property of ["version", "size", "tests", "worst", "completed", "passed", "p", "evaluation"]) {
                assert.notEqual(result[property], undefined, `Require property '${property}' missing from '${filename}'.`);
            }
        } else {
            const resultExp = /^P = (.*)$/gm;

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
        }

        accept(result);
    });
}

(async () => {
    const logsDir = "./logs";
    const dirs1 = fs.readdirSync(logsDir);
    for (const dir1 of dirs1) {
        const dirPath1 = path.join(logsDir, dir1);
        const match = dir1.match(/^(\d+)$/);
        if (match) {
            const p0 = parseInt(match[1], 10);

            const dirs2 = fs.readdirSync(dirPath1);
            for (const dir2 of dirs2) {
                const dirPath2 = path.join(dirPath1, dir2);
                const match = dir2.match(/^(\d+)$/);
                if (match) {
                    const p1 = parseInt(match[1], 10);
                    const filename = path.join(dirPath2, 'report.txt');
                    if (fs.existsSync(filename)) {
                        try {
                            const data = fs.readFileSync(filename, 'utf8');
                            const results = await parseAll(data, filename);

                            if (results.evaluation !== "EXTREMELY Worrying and very unusual") {
                                console.log(`${p0} ${p1}`);
                            }
                        } catch (e) {
                            console.warn(`Abort at ${p0},${p1}: ${e.message}`);
                        }
                    }
                }
            }
        }
    }
})()
