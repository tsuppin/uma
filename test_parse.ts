import { parseNARText } from "./app/lib/parser";

const text = `
1 1 リゾートアイランド 牡3 57.0 梅田 智司
2 2 マルガイコウテイ 牡3 57.0 (株)アイテ
3 3 33F 牡4 55.0
`;

console.log(JSON.stringify(parseNARText(text).horses, null, 2));
