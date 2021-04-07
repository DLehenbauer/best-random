const fs = require('fs');
const readline = require('readline');

function wc(file) {
    return new Promise(resolve => {
        const inf = readline.createInterface({
            input: fs.createReadStream(file),
            crlfDelay: Infinity,
        });
        let count = 0;
        inf.on('line', () => { count++; });
        inf.on('close', () => resolve(count));
    });
}

let table = JSON.parse(fs.readFileSync("/dev/stdin"));

function show(table) {
    if (process.argv.length > 2) {
        table = table.slice(0, process.argv[2]);
    }
    
    console.table(table, ["p0", "p1", "evaluation", "p", "passed", "worst"]);
}

async function main() {
    const total = await wc("args");

    if (table.length < 1) {
        console.log(`completed: ${table.length}/${total} (Waiting for results.)`);
        return;
    }

    const float = (v) => Math.round(v * 1000) / 1000;
    const percent = (v) => (v * 100).toFixed(2)

    const { ok, worrying, unusual, pMin, pSum, pMax } = table.reduce((stats, row) => {
        if (row.evaluation === 'ok') { stats.ok++; }
        else if (row.evaluation.match(/worrying/i)) { stats.worrying++; }
        else { stats.unusual++; }

        stats.pMin = Math.min(stats.pMin, row.p);
        stats.pMax = Math.max(stats.pMax, row.p);
        stats.pSum += row.p;

        return stats;
    }, { ok: 0, worrying: 0, unusual: 0, pMin: +Infinity, pSum: 0, pMax: -Infinity });

    console.clear();
    console.log(`completed: ${table.length}/${total} (${table[0].size})   ok: ${ok} (${percent(ok / table.length)}%)   unusual: ${unusual} (${percent(unusual / table.length)}%)   worrying: ${worrying} (${percent(worrying / table.length)}%)`);
    console.log(`  pMin: ${pMin}   pAvg: ${float(pSum / table.length)}   pMax: ${pMax}\n`);

    table.sort((left, right) => right.passed - left.passed);

    console.group("Best")
    show(table.sort((left, right) => right.p - left.p));
    console.groupEnd();
    
    console.group("Best Worst")
    show(table.sort((left, right) => right.worst.p - left.worst.p));
    console.groupEnd();
}

main();