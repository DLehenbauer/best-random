const fs = require('fs');

console.clear();

let table = JSON.parse(fs.readFileSync("./report.json"));
table.sort((left, right) => right.p - left.p);
console.table(
    table // .filter((row) => row.passed === 13),
);
