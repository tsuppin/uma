import { parseNARText } from "./app/lib/parser";

const text = `
1 1 繝ｪ繧ｾ繝ｼ繝医い繧､繝ｩ繝ｳ繝・迚｡3 57.0 譴・伐 譎ｺ蜿ｸ
2 2 繝槭Ν繧ｬ繧､繧ｳ繧ｦ繝・う 迚｡3 57.0 (譬ｪ)繧｢繧､繝・3 3 33F 迚｡4 55.0
`;

console.log(JSON.stringify(parseNARText(text).horses, null, 2));
