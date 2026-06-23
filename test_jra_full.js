require('ts-node').register();
const fs = require('fs');
const { parseJRAText } = require('./app/lib/parser.ts');

const text = fs.readFileSync('test_input2.txt', 'utf8');
const result = parseJRAText(text);
console.log('Horses count:', result.horses.length);
if (result.horses.length > 0) {
  console.log('Horse 1:', result.horses[0]);
  console.log('Horse 2:', result.horses[1]);
  console.log('Horse 6:', result.horses[5]);
}
