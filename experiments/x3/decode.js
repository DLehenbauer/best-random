const process = require("process");

// Access the command line arguments
const args = process.argv.slice(2);

// Check if an argument was provided
if (args.length < 2) {
    console.log('Must provide two integer arguments.');
    process.exit(1);
}

// Parse the argument as an integer
const r0 = parseInt(args[0], 10);
const r1 = parseInt(args[1], 10);

const s = ["x", "y", "z", "w"];

function get_index(r, i) {
    i <<= 1;
    mask = 0b11 << i;
    return (r & mask) >> i;
}

function get_fn(input) {
    const a = s[get_index(input, 0)];
    const b = s[get_index(input, 1)];
    const c = s[get_index(input, 2)];
    const d = s[get_index(input, 3)];
    const e = s[get_index(input, 4)];
    const f = get_index(input, 5);
    
    switch (f) {
        case 0:  return `rot(${a} - ${b}, ${c}) - rot(${d}, ${e})`;
        case 1:  return `rot(${a} - ${b}, ${c}) + rot(${d}, ${e})`;
        case 2:  return `rot(${a} + ${b}, ${c}) - rot(${d}, ${e})`;
        default: return `rot(${a} + ${b}, ${c}) + rot(${d}, ${e})`;
    }
}

console.log(`r0=${r0} r1=${r1}`)
console.log(`uint32_t hi32() { return ${get_fn(r0)}; }`);
console.log(`uint32_t lo32() { return ${get_fn(r1)}; }`);
