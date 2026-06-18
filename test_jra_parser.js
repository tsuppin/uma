const fs = require('fs');
const { execSync } = require('child_process');

execSync('node ./node_modules/typescript/bin/tsc app/lib/parser.ts --esModuleInterop --module commonjs');

const parser = require('./app/lib/parser.js');

const rawJRA = `
阪神11R
1
1
勝負服の画像
ブリンカー
スナッピードレッサ
牡3
480
(0)
55.0
ルメール
栗東
木村
2
2
アサカ
牝4
450
(+2)
54.0
武豊
栗東
友道
`;

const result = parser.parseJRAText(rawJRA);
console.log("Horses length:", result.horses.length);
console.log(JSON.stringify(result.horses, null, 2));
