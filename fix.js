const fs = require('fs');

let patchesRaw = fs.readFileSync('patches.json', 'utf8');
if (patchesRaw.charCodeAt(0) === 0xFEFF) patchesRaw = patchesRaw.slice(1);
const patches = JSON.parse(patchesRaw);

let content = fs.readFileSync('app/lib/constants.ts', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

const replaceIndex = content.lastIndexOf('];');
let newContent = content.substring(0, replaceIndex);
const lastBrace = newContent.lastIndexOf('}');
newContent = newContent.substring(0, lastBrace + 1) + ',';

patches.forEach((p, idx) => {
  newContent += '\n  ' + JSON.stringify(p, null, 2).replace(/\n/g, '\n  ') + (idx === patches.length - 1 ? '' : ',');
});

newContent += '\n];\n';

fs.writeFileSync('app/lib/constants.ts', newContent, 'utf8');
console.log('Done!');
