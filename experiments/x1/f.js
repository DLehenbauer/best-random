const fs = require('fs');

let table = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"))
    .filter(({ evaluation }) => !evaluation.match(/\bworrying\b/i));

table.sort((left, right) => right.p - left.p);
table.sort((left, right) => right.worst.p - left.worst.p);

for (const {p0, p1} of table) {
    console.log(`${p0} ${p1}`);
}
