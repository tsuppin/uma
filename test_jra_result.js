"use strict";
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
var pasteText = "\n1\t2\t4\t\u30C6\u30B9\u30C6\u30A3\u30E2\u30FC\u30CD 4\u756A\u4EBA\u6C17\n\u72614 / 454kg(+6)\n\u677E\u5C71\u5F18\u5E73(58.0)  \u6749\u5C71\u6674\u7D00(\u6817\u6771)\n2:01.3 / 36.1\n2\t3\t5\t\u30E9\u30B1\u30DE\u30FC\u30C0 2\u756A\u4EBA\u6C17\n\u72614 / 522kg(+6)\n\u5DDD\u7530\u5C06\u96C5(58.0)  \u5927\u4E45\u4FDD\u9F8D(\u6817\u6771)\n2:01.4 (\u30AF\u30D3) / 36.1\n3\t5\t10\t\u30EB\u30AF\u30B9\u30D3\u30C3\u30B0\u30B9\u30BF\u30FC 1\u756A\u4EBA\u6C17\n\u72614 / 510kg(+4)\n\u6B66\u8C4A(58.0)  \u6E05\u6C34\u4E45\u8A5E(\u6817\u6771)\n2:01.5 (\u30AF\u30D3) / 35.8\n";
var lines = pasteText.split("\n").map(function (l) { return l.trim(); });
var parsedMap = new Map();
// Mock race
var race = { horses: [] };
var i = 0;
while (i < lines.length) {
    var line = (_a = lines[i]) === null || _a === void 0 ? void 0 : _a.trim();
    if (!line) {
        i++;
        continue;
    }
    var isMatch = false;
    var rank = 0, num = 0, name_1 = "", pop = 0;
    var linesConsumed = 1;
    // 1. 完全行のキャプチャ (例: "1\t3\t5\tコンジェスタス6番人気" またはスペース混在)
    var fullMatch = line.match(/^(\d+)[\t\s]+(\d+)[\t\s]+(\d+)[\t\s]+(.+)/);
    // 2. 改行分割行のキャプチャ (例: "1\t8\t16")
    var splitMatch = line.match(/^(\d+)[\t\s]+(\d+)[\t\s]+(\d+)$/);
    if (fullMatch) {
        rank = parseInt(fullMatch[1]);
        num = parseInt(fullMatch[3]);
        var namePart = fullMatch[4].trim();
        var popM = namePart.match(/(.+?)(\d+)番人気/);
        name_1 = popM ? popM[1].trim() : namePart;
        pop = popM ? parseInt(popM[2]) : 0;
        isMatch = true;
    }
    else if (splitMatch) {
        rank = parseInt(splitMatch[1]);
        num = parseInt(splitMatch[3]);
        var nextIdx = i + 1;
        var nextLine = ((_b = lines[nextIdx]) === null || _b === void 0 ? void 0 : _b.trim()) || "";
        var cleanNext = nextLine.replace(/^(ブリンカー)[\t\s]*/, "").trim();
        var popM = cleanNext.match(/(.+?)(\d+)番人気/);
        name_1 = popM ? popM[1].trim() : cleanNext;
        pop = popM ? parseInt(popM[2]) : 0;
        isMatch = true;
        linesConsumed = 2;
    }
    if (isMatch && rank >= 1 && rank <= 20) {
        var baseIdx = i + linesConsumed;
        var line2 = ((_c = lines[baseIdx]) === null || _c === void 0 ? void 0 : _c.trim()) || "";
        var weight = 480, weightChange = 0;
        if (line2.includes("/")) {
            var lp = line2.split("/");
            var wPart = ((_d = lp[1]) === null || _d === void 0 ? void 0 : _d.trim()) || "";
            var wm = wPart.match(/(\d+)kg/);
            if (wm)
                weight = parseInt(wm[1]);
            var wcm = wPart.match(/\(([+-]?\d+)\)/) || wPart.match(/\((初出走)\)/) || wPart.match(/\(±?(\d+)\)/);
            if (wcm) {
                weightChange = wcm[1] === "初出走" ? 0 : parseInt(wcm[1]) || 0;
            }
            baseIdx++;
        }
        var line3 = ((_e = lines[baseIdx]) === null || _e === void 0 ? void 0 : _e.trim()) || "";
        var jockey = "", jockeyWeight = 54, trainer = "";
        if (line3.includes("(")) {
            var jm = line3.match(/^([^\(]+?)\((\d+\.?\d*)\)/);
            if (jm) {
                jockey = jm[1].trim().replace(/^[▲△☆◇]/, "");
                jockeyWeight = parseFloat(jm[2]);
            }
            var trM = line3.match(/\)\s+([^\s\(]+?[\(（][栗美][東浦][\)）])/);
            if (trM)
                trainer = trM[1].trim();
            else {
                var parts = line3.split(/\s+/);
                trainer = parts[parts.length - 1] || "";
            }
            baseIdx++;
        }
        var line4 = ((_f = lines[baseIdx]) === null || _f === void 0 ? void 0 : _f.trim()) || "";
        var time = "", margin = "", last3f = "";
        if (line4.includes("/")) {
            var lp4 = line4.split("/");
            var timePart = lp4[0].trim();
            var lastPart = ((_g = lp4[1]) === null || _g === void 0 ? void 0 : _g.trim()) || "";
            var tm = timePart.match(/(\d+:\d+\.\d+|\d+\.\d+)/);
            if (tm)
                time = tm[1];
            var mm = timePart.match(/\((.+?)\)/);
            if (mm)
                margin = mm[1];
            var lm = lastPart.match(/(\d{2}\.\d)/);
            if (lm)
                last3f = lm[1];
            baseIdx++;
        }
        var cleanName = name_1.replace(/^ブリンカー\s*/, "").trim();
        parsedMap.set(rank, {
            rank: rank,
            horseNumber: num,
            horseName: cleanName,
            time: time,
            popularity: pop,
            weight: weight,
            weightChange: weightChange,
            jockey: jockey,
            jockeyWeight: jockeyWeight,
            trainer: trainer,
            last3f: last3f,
            margin: margin
        });
        i = baseIdx - 1;
    }
    i++;
}
console.log(Array.from(parsedMap.values()));
