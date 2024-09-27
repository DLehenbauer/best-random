const fs = require('fs');

const evaluations = [
    /* 0: */ "ok",
    /* 1: */ "unusual",
    /* 2: */ "very unusual",
    /* 3: */ "Worrying and very unusual",
    /* 4: */ "EXTREMELY Worrying and very unusual"
];

function test(evaluation) {
    const i = evaluations.indexOf(evaluation);
    if (i < 0) throw new Error(`Unrecognized evalutaion ${evaluation}.`);
    return i <= 3;
}

let table = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"))
    .filter(({ evaluation }) => test(evaluation));

table.sort((left, right) => right.p - left.p);
table.sort((left, right) => right.worst.p - left.worst.p);

for (const {p0, p1} of table) {
    console.log(`${p0} ${p1}`);
}
