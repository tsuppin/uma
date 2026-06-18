"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rawText = "\n1\t1\t1\t\u30B9\u30CA\u30C3\u30D4\u30FC\u30C9\u30EC\u30C3\u30B5\n\u72613\t55.0\t\u30EB\u30E1\u30FC\u30EB\t\u6728\u6751(\u7F8E\u6D66)\t480(+2)\t2.5\t1\n2\t2\t2\t\u30A2\u30B5\u30AB\n\u725D4\t54.0\t\u6B66\u8C4A\t\u53CB\u9053(\u6817\u6771)\t450(+2)\t12.5\t4\n";
var lines = rawText.split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return l !== ""; });
function parseJRAHorse(lines) {
    var frame = 1;
    var number = 0;
    var name = "";
    var idx = 1;
    var odds = 0, popularity = 0;
    var multiMatch = lines[0].match(/^(\d+)[\s\t　]+(\d+)[\s\t　]+([^\s\t　]+)/);
    if (multiMatch) {
        frame = parseInt(multiMatch[1]);
        number = parseInt(multiMatch[2]);
        name = multiMatch[3];
    }
    else {
        var parts = lines[0].split(/\t|\s+/);
        if (parts.length >= 4) {
            frame = parseInt(parts[1]);
            number = parseInt(parts[2]);
            name = parts[3];
        }
    }
    while (idx < lines.length) {
        var l = (lines[idx] || "").trim();
        if (l === "") {
            idx++;
            continue;
        }
        // Kinryo (55.0)
        if (l.match(/^\d+\.\dkg$/) || l.match(/^\d+\.\d$/)) {
            idx++;
            // Usually Jockey comes right after Kinryo in table format
            if (idx < lines.length && !lines[idx].match(/\d/)) {
                idx++; // Jockey
                if (idx < lines.length && !lines[idx].match(/\d/)) {
                    idx++; // Trainer
                }
            }
            continue;
        }
        // Odds
        if (l.match(/^[\d\.]+$/) && !l.match(/^\d+\.\d$/)) {
            odds = parseFloat(l);
            idx++;
            continue;
        }
        // Popularity
        var pm = l.match(/^(\d+)番人気$/) || l.match(/^(\d+)$/);
        if (pm && odds > 0) {
            popularity = parseInt(pm[1]);
            idx++;
            continue;
        }
        idx++;
    }
    return { number: number, name: name, odds: odds, popularity: popularity };
}
console.log(parseJRAHorse([lines[0], lines[1]]));
console.log(parseJRAHorse([lines[2], lines[3]]));
