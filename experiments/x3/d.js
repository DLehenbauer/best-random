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

    const percent = (v) => (v * 100).toFixed(2)
    const ok = table.filter((row) => row.evaluation === 'ok').length;
    const worrying = table.filter((row) => row.evaluation.match(/worrying/i)).length;
    const unusual = table.filter((row) => row.evaluation.match(/unusual/i)).length - worrying;

    console.clear();
    console.log(`completed: ${table.length}/${total}   ok: ${ok} (${percent(ok / table.length)}%)   unusual: ${unusual} (${percent(unusual / table.length)}%)   worrying: ${worrying} (${percent(worrying / table.length)}%)
    `);


    table.sort((left, right) => right.passed - left.passed);

    console.group("Best")
    show(table.sort((left, right) => right.p - left.p));
    console.groupEnd();
    
    console.group("Best Worst")
    show(table.sort((left, right) => right.worst.p - left.worst.p));
    console.groupEnd();
}

main();