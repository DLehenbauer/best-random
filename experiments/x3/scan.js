const fs = require('fs');
const path = require('path');

// Define the path to the 'pass' file
const filePath = path.join(__dirname, 'pass.bak');

// Read the file asynchronously
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    // Split the file content into lines
    const lines = data.split('\n');
    const count = new Array(16).fill(0);

    const extract = (r, i) => {
        i <<= 1;
        const mask = 0b11 << i;
        return (r & mask) >>> i;
    }

    const results = [];

    // Process each line
    lines.forEach((line, index) => {
        // Trim whitespace and skip empty lines
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
            return;
        }

        // Split the line into integers (assuming space-separated)
        const [r1, r2] = trimmedLine.split(/\s+/).map(Number);

        results.push({
            a1: extract(r1, 0),
            b1: extract(r1, 1),
            c1: extract(r1, 2),
            d1: extract(r1, 3),
            e1: extract(r1, 4),
            f1: extract(r1, 5),

            a2: extract(r2, 0),
            b2: extract(r2, 1),
            c2: extract(r2, 2),
            d2: extract(r2, 3),
            e2: extract(r2, 4),
            f2: extract(r2, 5),
        });
    });

    const key1 = 'f1';
    const key2 = 'f2';

    // Prepare table data
    const table = [];
    for (const result of results) {
        value1 = result[key1];
        value2 = result[key2];
        
        const index = value1 << 2 | value2;
        
        if (!table[index]) {
            table[index] = { count: 0 };
            table[index][key1] = value1;
            table[index][key2] = value2;
        }
        table[index].count++;
    }

    // Sort by count descending
    table.sort((x, y) => y.count - x.count);

    // Print as table
    console.log(` ${key1} | ${key2} | count | ratio`);
    console.log('----|----|-------|-------');
    table.forEach(row => {
        console.log(`  ${row[key1]} |  ${row[key2]} | ${row.count} |  ${(row.count / table[0].count).toFixed(2)}`);
    });
});
