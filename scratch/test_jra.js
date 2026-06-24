const fs = require('fs');
const { detectFormat, parseJRAText } = require('./app/lib/parser');

const text = fs.readFileSync('scratch/test_jra.txt', 'utf-8');
const format = detectFormat(text);
console.log("Detected format:", format);

if (format === 'jra') {
    const res = parseJRAText(text);
    console.log("Parsed Horses:", res.horses.length);
    if (res.horses.length > 0) {
        console.log("First horse data:");
        console.log(JSON.stringify(res.horses[0], null, 2));
    }
}
