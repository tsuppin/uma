const fs = require('fs');
const { parseRakutenKeibaText } = require('./app/lib/parser.js'); // Wait, we don't have built .js for parser.ts

const text = fs.readFileSync('test_input.txt', 'utf8');

// We need to parse it using TS. 
