#!/usr/bin/env node
// filepath: /home/danlehen/gh/best-random/experiments/x3/filter-symmetric-pairs.js

/**
 * Filters input lines to keep only symmetric pairs.
 * A symmetric pair (a, b) is kept only if (b, a) also exists in the input.
 * 
 * Usage: cat pairs.txt | ./filter-symmetric-pairs.js
 */

const readline = require('readline');

// Read all input lines
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Alternative approach for large files
const pairs = new Map(); // Store pairs with their line info
const symmetricPairs = [];

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  
  const parts = trimmed.split(/\s+/);
  if (parts.length === 2) {
    const [a, b] = parts;
    const key = `${a} ${b}`;
    const reverseKey = `${b} ${a}`;
    
    pairs.set(key, line);
    
    // Check if reverse exists
    if (pairs.has(reverseKey)) {
      symmetricPairs.push(line);
      symmetricPairs.push(pairs.get(reverseKey));
    }
  }
});

rl.on('close', () => {
  // Output the filtered pairs
  for (const line of symmetricPairs) {
    console.log(line);
  }
});
