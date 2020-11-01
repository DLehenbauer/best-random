const fs = require('fs');

let table = JSON.parse(fs.readFileSync("/dev/stdin"));

{
    const maxStat = (stat) =>
        table.reduce(
            (prev, current) => current[stat] > prev[stat]
                ? current
                : prev,
            table[0]);

    const percent = (v) => (v * 100).toFixed(2)
    const ok = table.filter((row) => row.evaluation === 'ok').length;
    const worrying = table.filter((row) => row.evaluation.match(/worrying/i)).length;

    console.clear();
    console.log(`${table[0].size} - completed: ${table.length} (${maxStat("p0").p0},${maxStat("p1").p1})   ok: ${ok} (${percent(ok / table.length)}%)   worrying: ${worrying} (${percent(worrying / table.length)}%)
`);
}

function show(table) {
    if (process.argv.length > 2) {
        table = table.slice(0, process.argv[2]);
    }
    
    console.table(table, ["p0", "p1", "evaluation", "p", "passed", "worst"]);
}

table.sort((left, right) => right.passed - left.passed);

console.group("Best")
show(table.sort((left, right) => right.p - left.p));
console.groupEnd();

console.group("Best Worst")
show(table.sort((left, right) => right.worst.p - left.worst.p));
console.groupEnd();