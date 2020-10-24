const fs = require('fs');

console.clear();

let table = JSON.parse(fs.readFileSync("/dev/stdin"));

const maxStat = (stat) =>
    table.reduce(
        (prev, current) => current[stat] > prev[stat]
            ? current
            : prev,
        table[0]);

const percent = (v) => (v * 100).toFixed(2)

const passed = table.filter((row) => row.evaluation === 'ok').length;
console.log(`Completed: ${table.length}/1024   Last: ${maxStat("p0").p0}/${maxStat("p1").p1}   Passed: ${passed} (${percent(passed / table.length)}%)
`);

function show(table) {
    if (process.argv.length > 2) {
        table = table.slice(0, process.argv[2]);
    }
    
    console.table(table);
}

console.group("Best")
show(table.sort((left, right) => right.p - left.p));
console.groupEnd();

console.group("Best Worst")
show(table.sort((left, right) => right.worst.p - left.worst.p));
console.groupEnd();