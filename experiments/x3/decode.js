const process = require("process");

// Access the command line arguments
const args = process.argv.slice(2);

// Check if an argument was provided
if (args.length === 0) {
    console.log('Please provide an integer as a command line argument.');
    process.exit(1);
}

// Parse the argument as an integer
const input = parseInt(args, 10);

// Check if the parsed value is a valid integer
if (isNaN(input)) {
    console.log('The provided argument is not a valid integer.');
    process.exit(1);
}

const s = ["x", "y", "z", "w"];

function get_index(r, i) {
    i <<= 1;
    mask = 0b11 << i;
    return (r & mask) >> i;
}

const a = s[get_index(input, 0)];
const b = s[get_index(input, 1)];
const c = s[get_index(input, 2)];
const d = s[get_index(input, 3)];
const e = s[get_index(input, 4)];

console.log(`rot(${e} - ${d}, ${c}) + rot(${a}, ${b})`);