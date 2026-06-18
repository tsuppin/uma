"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectFormat = detectFormat;
exports.extractVenue = extractVenue;
exports.parseNARText = parseNARText;
exports.parseJRAText = parseJRAText;
var storage_1 = require("./storage");
// ==========================================
// フォーマット自動判別
// ==========================================
function detectFormat(text) {
    if (/枠\d[白黒赤青黄緑橙桃]/.test(text))
        return "jra";
    var venue = extractVenue(text);
    var jraTracks = ["東京", "中山", "京都", "阪神", "中京", "新潟", "福島", "小倉", "函館", "札幌"];
    if (venue && jraTracks.includes(venue))
        return "jra";
    return "nar";
}
function estimateStyle(pastRaces) {
    if (pastRaces.length === 0)
        return "中団";
    var frontCount = 0, midCount = 0, backCount = 0;
    pastRaces.forEach(function (pr) {
        if (pr.passingPositions) {
            var pos = pr.passingPositions.split('-').map(Number);
            var firstPos = pos[0];
            if (firstPos === 1)
                frontCount += 2;
            else if (firstPos <= 4)
                frontCount++;
            else if (firstPos <= 8)
                midCount++;
            else
                backCount++;
        }
    });
    if (frontCount > midCount && frontCount > backCount)
        return frontCount >= 3 ? "逃げ" : "先行";
    if (backCount > frontCount && backCount > midCount)
        return "差し";
    return "中団";
}
var ALL_TRACKS = [
    // 中央
    "東京", "中山", "京都", "阪神", "中京", "新潟", "福島", "小倉", "函館", "札幌",
    // 地方
    "大井", "川崎", "船橋", "浦和", "門別", "盛岡", "水沢", "金沢", "笠松", "名古屋", "園田", "姫路", "高知", "佐賀", "帯広"
];
function extractVenue(text) {
    // レース情報が集まっている先頭20行程度から検索する（馬名や所属による誤爆を防ぐため）
    var headLines = text.split("\n").slice(0, 20).join("\n");
    // 「大井 11R」や「東京11R」のような明確なパターンを優先
    for (var _i = 0, ALL_TRACKS_1 = ALL_TRACKS; _i < ALL_TRACKS_1.length; _i++) {
        var track = ALL_TRACKS_1[_i];
        if (new RegExp("".concat(track, "\\s*\\d+R")).test(headLines)) {
            return track;
        }
    }
    // 単純な出現確認（ヘッダー部分のみ）
    for (var _a = 0, ALL_TRACKS_2 = ALL_TRACKS; _a < ALL_TRACKS_2.length; _a++) {
        var track = ALL_TRACKS_2[_a];
        if (headLines.includes(track)) {
            return track;
        }
    }
    return null;
}
// ==========================================
// NAR出馬表パーサー（地方競馬）- フルデータ対応版
// ==========================================
function parseNARText(rawText) {
    var lines = rawText.split("\n").map(function (l) { return l.trim(); });
    var date = new Date().toISOString().slice(0, 10);
    var venue = extractVenue(rawText) || "";
    var raceNumber = 1, distance = 1200, headCount = 0, raceName = "";
    var surface = "ダート";
    var condition = "良";
    var startTime = "";
    var weather = "";
    for (var i = 0; i < Math.min(lines.length, 25); i++) {
        var l = lines[i];
        if (!l)
            continue;
        // 日付: 2026/5/12
        var dateM = l.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
        if (dateM)
            date = "".concat(dateM[1], "-").concat(String(dateM[2]).padStart(2, "0"), "-").concat(String(dateM[3]).padStart(2, "0"));
        // 開催場・R: 川崎 11R
        var venueM = l.match(/^(.+?)\s+(\d+)R$/);
        if (venueM) {
            venue = venueM[1].trim();
            raceNumber = parseInt(venueM[2]);
        }
        // 距離・頭数・発走時刻: 900m    12頭    発走20:15
        var distM = l.match(/(\d+)m/);
        if (distM)
            distance = parseInt(distM[1]);
        var hcM = l.match(/(\d+)頭/);
        if (hcM)
            headCount = parseInt(hcM[1]);
        var stM = l.match(/発走\s*(\d{2}:\d{2})/);
        if (stM)
            startTime = stM[1];
        // 天候・馬場状態: 天候：晴 馬場状態：良
        var weatherM = l.match(/天候[：:]\s*(.+?)(?:\s|$)/) || l.match(/天候[：:]\s*([^\s]+)/);
        if (weatherM)
            weather = weatherM[1].trim().split(" ")[0];
        var condM = l.match(/馬場状態[：:]\s*(.+?)(?:\s|$)/) || l.match(/馬場状態[：:]\s*([^\s]+)/);
        if (condM) {
            var c = condM[1].trim().split(" ")[0];
            if (["良", "稍重", "重", "不良"].includes(c))
                condition = c;
        }
        // レース名
        if (i === 2 && !venueM && !dateM && !distM) {
            raceName = l;
        }
    }
    if (!raceName) {
        for (var i = 0; i < Math.min(lines.length, 10); i++) {
            var l = lines[i];
            if (l.includes("特別") || l.includes("オープン") || l.includes("チャレンジ") || l.includes("重賞") || l.includes("スプリント")) {
                raceName = l;
                break;
            }
        }
    }
    var blockStarts = [];
    for (var i = 0; i < lines.length; i++) {
        var l = lines[i].trim();
        if (/^\d+[\t\s]+\d+[\t\s]+[^\t\s]+/.test(l)) {
            if (!l.includes("頭") && !l.includes("番") && !l.includes("人") && !l.includes("kg") && !l.includes("m") && !l.includes(":") && !l.match(/\d{2}\/\d{2}\/\d{2}/)) {
                blockStarts.push(i);
            }
        }
    }
    var horses = [];
    for (var bi = 0; bi < blockStarts.length; bi++) {
        var start = blockStarts[bi];
        var end = bi + 1 < blockStarts.length ? blockStarts[bi + 1] : lines.length;
        var h = parseNARHorse(lines.slice(start, end));
        if (h === null || h === void 0 ? void 0 : h.name)
            horses.push(h);
    }
    return {
        horses: horses,
        venue: venue,
        raceNumber: raceNumber,
        date: date,
        distance: distance,
        surface: surface,
        condition: condition,
        headCount: headCount || horses.length,
        raceName: raceName,
        startTime: startTime || undefined, weather: weather || undefined
    };
}
function parseNARHorse(lines) {
    var _a, _b, _c, _d, _e;
    if (!lines[0])
        return null;
    var hp = lines[0].trim().split(/[\t\s]+/);
    if (hp.length < 3)
        return null;
    // 調教情報の抽出
    var trainingTime = "";
    var trainingRating = "";
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var trimmed = line.trim();
        if (!trimmed)
            continue;
        var hasCourse = trimmed.includes("坂路") || trimmed.includes("南W") || trimmed.includes("ウッド") ||
            trimmed.includes("Ｗ") || trimmed.includes("坂") || trimmed.includes("芝") ||
            trimmed.includes("ポリ") || trimmed.includes("ダート") || trimmed.includes("ＤＰ");
        var hasTimePattern = /\d{2}\.\d[ \t\-\s]*\d{2}\.\d/g.test(trimmed) ||
            /\d{2}\.\d[ \t\-\s]*-\d{2}\.\d/g.test(trimmed) ||
            trimmed.includes("馬なり") || trimmed.includes("強め") || trimmed.includes("一杯");
        if (hasCourse && (hasTimePattern || trimmed.match(/\d{2}\.\d/))) {
            trainingTime = trimmed;
        }
        var ratingMatch = trimmed.match(/(?:調教評価|追切評価|調教|評価)[\s:：]*(S|[A-C][+-]?)/i) ||
            trimmed.match(/^[【\s]*(S|[A-C][+-]?)[】\s]*$/);
        if (ratingMatch) {
            trainingRating = ratingMatch[1].toUpperCase();
        }
    }
    var frame = parseInt(hp[0]);
    var number = parseInt(hp[1]);
    var rawName = hp[2] || "";
    var name = rawName;
    var belonging = "";
    var nameBelongingM = rawName.match(/^(.+?)\((.+?)\)$/);
    if (nameBelongingM) {
        name = nameBelongingM[1].trim();
        belonging = nameBelongingM[2].trim();
    }
    var sire = "";
    var dam = "";
    var gender = "牡";
    var age = 3;
    var coatColor = "";
    var weight = 480;
    var weightChange = 0;
    var jockey = "";
    var kinryo = 54;
    var trainer = "";
    var owner = "";
    var breeder = "";
    var transferFrom = "";
    var jraEarnings = 0;
    var stableLocation = "";
    var pastRaceStartIdx = -1;
    for (var i = 1; i < lines.length; i++) {
        var l = lines[i].trim();
        if (!l)
            continue;
        var isPastRaceHeader = /^(?:\d+|取消|除外|中止|失格)\s+\d{2}\/\d{2}\/\d{2}/.test(l) || /^(?:\d+|取消|除外|中止|失格)\t\d{2}\/\d{2}\/\d{2}/.test(l);
        if (isPastRaceHeader) {
            pastRaceStartIdx = i;
            break;
        }
    }
    var profileEndIdx = pastRaceStartIdx !== -1 ? pastRaceStartIdx : lines.length;
    var kinryoIdx = -1;
    for (var i = 1; i < profileEndIdx; i++) {
        var l = lines[i].trim();
        if (l.match(/^\(\d{2,3}(?:\.\d)?\)$/)) {
            kinryoIdx = i;
            break;
        }
    }
    for (var i = 1; i < profileEndIdx; i++) {
        var l = lines[i].trim();
        if (!l)
            continue;
        if (l.includes("父") && !sire) {
            sire = l.replace(/^.*?父\s+/, "").trim();
        }
        else if (l.includes("母") && !dam) {
            dam = l.replace(/^.*?母\s+/, "").trim();
        }
        else if (l.match(/^[牡牝セ]|せん/) && l.match(/\d+/)) {
            var gm = l.match(/([牡牝セ]|せん)(\d+)/);
            if (gm) {
                gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1];
                age = parseInt(gm[2]);
            }
        }
        else if (l.match(/^(?:栗|栃栗|鹿|黒鹿|青鹿|青|芦|白|粕)毛$/)) {
            coatColor = l;
        }
        else if (l.match(/^\d+kg$/)) {
            weight = parseInt(l);
        }
        else if (l.match(/^\(([±+-]?\d+|初出走|[\d]+|±\d+)\)$/)) {
            var wcm = l.match(/\(([±+-]?\d+|初出走|[\d]+|±\d+)\)/);
            if (wcm) {
                var val = wcm[1].replace("±", "");
                weightChange = val === "初出走" ? 0 : parseInt(val) || 0;
            }
        }
        else if (l.includes("本賞金") || l.includes("収得賞金") || l.includes("賞金")) {
            var prizeM = l.match(/(?:本賞金|収得賞金|賞金)[：:]?\s*([\d,]+)/);
            if (prizeM) {
                var rawPrize = parseInt(prizeM[1].replace(/,/g, ""));
                jraEarnings = rawPrize < 100000 ? rawPrize : Math.round(rawPrize / 10000);
            }
        }
    }
    if (kinryoIdx !== -1) {
        var kMatch = lines[kinryoIdx].trim().match(/^\((\d{2,3}(?:\.\d)?)\)$/);
        if (kMatch)
            kinryo = parseFloat(kMatch[1]);
        if (kinryoIdx - 1 >= 0)
            jockey = lines[kinryoIdx - 1].trim();
        if (kinryoIdx + 1 < profileEndIdx) {
            var rawTrainer = lines[kinryoIdx + 1].trim();
            trainer = rawTrainer;
            var trainerBelongingM = rawTrainer.match(/^(.+?)\((.+?)\)$/) || rawTrainer.match(/^(.+?)（(.+?)）$/);
            if (trainerBelongingM) {
                trainer = trainerBelongingM[1].trim();
                stableLocation = trainerBelongingM[2].trim();
            }
        }
        if (kinryoIdx + 2 < profileEndIdx)
            owner = lines[kinryoIdx + 2].trim();
        if (kinryoIdx + 3 < profileEndIdx)
            breeder = lines[kinryoIdx + 3].trim();
    }
    // ==========================================
    // 過去走データのパース
    // ==========================================
    var pastRaces = [];
    if (pastRaceStartIdx !== -1) {
        var pIdx = pastRaceStartIdx;
        var _loop_1 = function () {
            var l1 = ((_a = lines[pIdx]) === null || _a === void 0 ? void 0 : _a.trim()) || "";
            if (!l1) {
                pIdx++;
                return "continue";
            }
            var isPastRaceHeader = /^(?:\d+|取消|除外|中止|失格)\s+\d{2}\/\d{2}\/\d{2}/.test(l1) || /^(?:\d+|取消|除外|中止|失格)\t\d{2}\/\d{2}\/\d{2}/.test(l1);
            if (!isPastRaceHeader) {
                pIdx++;
                return "continue";
            }
            var p1 = l1.split(/[\t\s]+/);
            if (p1.length < 3) {
                pIdx++;
                return "continue";
            }
            var rawResult = p1[0];
            var isNumericResult = /^\d+$/.test(rawResult);
            var prResult = isNumericResult ? parseInt(rawResult) : 0;
            var dateMatch = p1[1].match(/(\d{2})\/(\d{2})\/(\d{2})/);
            var prDate = dateMatch ? "20".concat(dateMatch[1], "-").concat(dateMatch[2], "-").concat(dateMatch[3]) : "";
            var prVenue = p1[2] || "";
            var courseAttr = p1[3] || "";
            var directionM = courseAttr.match(/([右左]|直線)/);
            var prDirection = directionM ? directionM[1] : "";
            var distMatch = courseAttr.match(/(\d+)m/);
            var prDist = distMatch ? parseInt(distMatch[1]) : 0;
            var prSurf = courseAttr.includes("芝") ? "芝" : "ダート";
            var prCond = (p1[4] || "良");
            pIdx++;
            var prRaceClass = ((_b = lines[pIdx]) === null || _b === void 0 ? void 0 : _b.trim()) || "";
            pIdx++;
            var nextLine = ((_c = lines[pIdx]) === null || _c === void 0 ? void 0 : _c.trim()) || "";
            var isNextHeader = /^(?:\d+|取消|除外|中止|失格)\s+\d{2}\/\d{2}\/\d{2}/.test(nextLine) || /^(?:\d+|取消|除外|中止|失格)\t\d{2}\/\d{2}\/\d{2}/.test(nextLine);
            var prHeadCount = 0;
            var prFrameNumber = 0;
            var prPopularity = 0;
            var prJockey = "";
            var prKinryo = 0;
            var prWeight = 480;
            var passingPositions = "";
            var prTime = "";
            var last3fTime = "";
            var winnerName = "";
            var timeDiff = 0;
            if (!isNextHeader && pIdx < lines.length) {
                var l3 = ((_d = lines[pIdx]) === null || _d === void 0 ? void 0 : _d.trim()) || "";
                var p3 = l3.split(/[\t\s]+/);
                var hcMatch = l3.match(/(\d+)頭/);
                if (hcMatch)
                    prHeadCount = parseInt(hcMatch[1]);
                var fnMatch = l3.match(/(\d+)番/);
                if (fnMatch)
                    prFrameNumber = parseInt(fnMatch[1]);
                var popMatch = l3.match(/(\d+)人/);
                if (popMatch)
                    prPopularity = parseInt(popMatch[1]);
                var jockeyFound_1 = false;
                p3.forEach(function (part) {
                    if (part.includes("頭") || part.includes("番") || part.includes("人"))
                        return;
                    if (part.match(/^\d{3}kg$/)) {
                        prWeight = parseInt(part);
                    }
                    else if (part.match(/^\d{2}\.\d$/)) {
                        prKinryo = parseFloat(part);
                    }
                    else if (part.match(/^\d+(?:-\d+)+$/)) {
                        passingPositions = part;
                    }
                    else if (part.length >= 2 && part.length <= 5 && !jockeyFound_1) {
                        prJockey = part;
                        jockeyFound_1 = true;
                    }
                });
                pIdx++;
                var l4 = ((_e = lines[pIdx]) === null || _e === void 0 ? void 0 : _e.trim()) || "";
                if (l4) {
                    var timeMatch = l4.match(/^(\d+:\d+[:.]\d+)/) || l4.match(/^(\d+[:.]\d+)/);
                    if (timeMatch) {
                        prTime = timeMatch[1].replace(/:(\d+)$/, ".$1");
                    }
                    var last3fMatch = l4.match(/\((\d{2}\.\d)\)/);
                    if (last3fMatch)
                        last3fTime = last3fMatch[1];
                    var winnerMatch = l4.match(/\s+([^\s\(\)]+?)\(([-+]\d+\.\d+)\)/) || l4.match(/\s+([^\s\(\)]+?)\(([-+]\d+)\)/);
                    if (winnerMatch) {
                        winnerName = winnerMatch[1].trim();
                        timeDiff = parseFloat(winnerMatch[2]);
                    }
                }
                pIdx++;
            }
            if (prDate) {
                pastRaces.push({
                    date: prDate,
                    venue: prVenue,
                    raceName: prRaceClass,
                    raceClass: prRaceClass,
                    distance: prDist,
                    direction: prDirection || undefined,
                    surface: prSurf,
                    condition: prCond,
                    result: prResult,
                    headCount: prHeadCount || undefined,
                    frameNumber: prFrameNumber || undefined,
                    popularity: prPopularity || undefined,
                    jockeyWeight: prKinryo || undefined,
                    time: prTime,
                    corner4Position: passingPositions ? parseInt(passingPositions.split('-').pop() || "5") : 5,
                    cornerOuterCount: 1,
                    passingPositions: passingPositions || undefined,
                    last3fTime: last3fTime || undefined,
                    weight: prWeight,
                    jockey: prJockey,
                    winnerName: winnerName || undefined,
                    timeDiff: timeDiff || undefined,
                    odds: 0,
                    prize: 0
                });
            }
        };
        while (pIdx < lines.length && pastRaces.length < 5) {
            _loop_1();
        }
    }
    var calculatedStyle = estimateStyle(pastRaces);
    // JRAからの転入自動検知
    var detectedTransfer = transferFrom;
    var detectedJRAEarnings = jraEarnings;
    if (belonging === "中央" || belonging === "ＪＲＡ" || belonging === "JRA") {
        detectedTransfer = "JRA";
    }
    var jraVenues = ["東京", "中山", "京都", "阪神", "中京", "新潟", "福島", "小倉", "函館", "札幌"];
    var hasJRAPastRace = pastRaces.some(function (pr) { return jraVenues.includes(pr.venue); });
    if (hasJRAPastRace) {
        detectedTransfer = "JRA";
        if (detectedJRAEarnings === 0) {
            // 過去走の賞金からJRA収得賞金を概算 (万単位)
            var totalPrize = pastRaces.reduce(function (sum, pr) {
                if (jraVenues.includes(pr.venue)) {
                    return sum + (pr.prize || 0);
                }
                return sum;
            }, 0);
            detectedJRAEarnings = totalPrize;
        }
    }
    return {
        id: (0, storage_1.generateId)(),
        number: number,
        frame: frame,
        name: name,
        belonging: belonging || undefined,
        age: age,
        gender: gender,
        coatColor: coatColor || undefined,
        weight: weight,
        weightChange: weightChange,
        jockey: jockey,
        jockeyWeight: kinryo,
        trainer: trainer,
        owner: owner,
        breeder: breeder || undefined,
        sire: sire,
        dam: dam,
        bms: "",
        bloodline: sire || "",
        style: calculatedStyle,
        odds: 0,
        popularity: 0,
        pastRaces: pastRaces,
        stableLocation: stableLocation || belonging || "地方",
        transferFrom: detectedTransfer || undefined,
        jraEarnings: detectedJRAEarnings || undefined,
        trainingTime: trainingTime || undefined,
        trainingRating: trainingRating || undefined
    };
}
// ==========================================
// JRA出馬表パーサー（中央競馬）- フルデータ対応版
// ==========================================
function parseJRAText(rawText) {
    var _a;
    var lines = rawText.split("\n").map(function (l) { return l.trim(); });
    // ヘッダー解析: "3回京都6日 11R"
    var headerMatch = rawText.match(/(\d+)回(.+?)(\d+)日\s*(\d+)R/);
    var venue = ((_a = headerMatch === null || headerMatch === void 0 ? void 0 : headerMatch[2]) === null || _a === void 0 ? void 0 : _a.trim()) || extractVenue(rawText) || "";
    var raceNumber = headerMatch ? parseInt(headerMatch[4]) : 1;
    // レース名・距離・馬場・条件
    var raceName = "";
    var distance = 0;
    var surface = "ダート";
    var condition = "良";
    for (var i = 0; i < Math.min(lines.length, 30); i++) {
        var l = lines[i];
        var dm = l.match(/(\d{3,4})(ダ|芝)/);
        if (dm) {
            distance = parseInt(dm[1]);
            surface = dm[2] === "芝" ? "芝" : "ダート";
        }
        if (/^(良|稍重|重|不良)$/.test(l) && !condition)
            condition = l;
        if (l.match(/(S|G)[Ⅰ-Ⅲ]|リステッド|特別|勝クラス|OP|オープン/) && !raceName)
            raceName = l;
    }
    // クッション値、含水率、仮柵位置の自動抽出
    var cushionValue;
    var moistureContent;
    var temporaryFencePosition;
    var fenceM = rawText.match(/([A-D])コース/);
    if (fenceM)
        temporaryFencePosition = fenceM[1];
    var cushionM = rawText.match(/クッション値[：:\s]*(\d+\.?\d*)/);
    if (cushionM)
        cushionValue = parseFloat(cushionM[1]);
    var moistureM = rawText.match(/含水率[：:\s]*(?:芝)?(\d+\.?\d*)/) || rawText.match(/含水率[：:\s]*(\d+\.?\d*)%/);
    if (moistureM)
        moistureContent = parseFloat(moistureM[1]);
    var blockStarts = [];
    for (var i = 0; i < lines.length; i++) {
        var l = lines[i].trim();
        // 枠番の検出を大幅に強化 (行頭のスペース、枠と数値の間のスペース/タブ/全角スペースの揺れに完全対応)
        if (/^[\s\t　]*枠[\s\t　]*\d/.test(lines[i])) {
            blockStarts.push(i);
        }
        // 最新フォーマット: 1 1 スナッピードレッサ などの 枠番 馬番 馬名 のパターン
        else if (/^\d+[\t\s]+\d+[\t\s]+[^\t\s]+/.test(l)) {
            if (!l.includes("頭") && !l.includes("番") && !l.includes("人") && !l.includes("kg") && !l.includes("m") && !l.includes(":") && !l.match(/\d{2}\/\d{2}\/\d{2}/)) {
                blockStarts.push(i);
            }
        }
        // テーブル形式でのコピペ: 行1=枠, 行2=馬番
        else if (i < lines.length - 2 && /^[1-8]$/.test(l) && /^[1-9]$|^1[0-8]$/.test(lines[i + 1].trim())) {
            // make sure it's not a date like "1\n2\n..." which shouldn't happen, but just to be safe
            blockStarts.push(i);
        }
    }
    var horses = [];
    for (var bi = 0; bi < blockStarts.length; bi++) {
        var start = blockStarts[bi];
        var end = bi + 1 < blockStarts.length ? blockStarts[bi + 1] : lines.length;
        var h = parseJRAHorse(lines.slice(start, end));
        if (h === null || h === void 0 ? void 0 : h.name)
            horses.push(h);
    }
    return {
        horses: horses,
        venue: venue,
        raceNumber: raceNumber,
        raceName: raceName,
        distance: distance || undefined,
        surface: surface,
        condition: condition,
        headCount: horses.length,
        cushionValue: cushionValue,
        moistureContent: moistureContent,
        temporaryFencePosition: temporaryFencePosition
    };
}
function parseJRAHorse(lines) {
    var _a, _b;
    if (!lines[0])
        return null;
    // 調教情報の抽出
    var trainingTime = "";
    var trainingRating = "";
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var line = lines_2[_i];
        var trimmed = line.trim();
        if (!trimmed)
            continue;
        var hasCourse = trimmed.includes("坂路") || trimmed.includes("南W") || trimmed.includes("ウッド") ||
            trimmed.includes("Ｗ") || trimmed.includes("坂") || trimmed.includes("芝") ||
            trimmed.includes("ポリ") || trimmed.includes("ダート") || trimmed.includes("ＤＰ");
        var hasTimePattern = /\d{2}\.\d[ \t\-\s]*\d{2}\.\d/g.test(trimmed) ||
            /\d{2}\.\d[ \t\-\s]*-\d{2}\.\d/g.test(trimmed) ||
            trimmed.includes("馬なり") || trimmed.includes("強め") || trimmed.includes("一杯");
        if (hasCourse && (hasTimePattern || trimmed.match(/\d{2}\.\d/))) {
            trainingTime = trimmed;
        }
        var ratingMatch = trimmed.match(/(?:調教評価|追切評価|調教|評価)[\s:：]*(S|[A-C][+-]?)/i) ||
            trimmed.match(/^[【\s]*(S|[A-C][+-]?)[】\s]*$/);
        if (ratingMatch) {
            trainingRating = ratingMatch[1].toUpperCase();
        }
    }
    var frame = 1;
    var number = 0;
    var name = "";
    var idx = 1;
    var hasBlinker = false;
    var frameMatch = lines[0].match(/枠[\s\t　]*(\d)/);
    if (frameMatch) {
        frame = parseInt(frameMatch[1]);
    }
    // 1 1 スナッピードレッサ のようなパターンを抽出
    var multiMatch = lines[0].match(/^(\d+)[\s\t　]+(\d+)[\s\t　]+([^\s\t　]+)/);
    if (multiMatch) {
        frame = parseInt(multiMatch[1]);
        number = parseInt(multiMatch[2]);
        name = multiMatch[3];
    }
    else {
        var tabParts = lines[0].split(/\t/);
        if (tabParts.length > 1 && /^\d+$/.test(tabParts[1].trim())) {
            number = parseInt(tabParts[1].trim());
        }
    }
    if (!name) {
        // 馬番のパースを極限まで頑健化 (前後のスペース・タブのトリム、ブリンカーや空行の自動スキップに対応)
        if (!number) {
            while (idx < lines.length) {
                var cleanLine = (lines[idx] || "").trim();
                if (/^\d+$/.test(cleanLine)) {
                    number = parseInt(cleanLine);
                    idx++;
                    break;
                }
                if (cleanLine === "" || cleanLine.includes("勝負服") || cleanLine === "ブリンカー" || /^\[[外地抽]\]$/.test(cleanLine)) {
                    idx++;
                }
                else {
                    break;
                }
            }
        }
        // Skip any pre-name elements like "勝負服", "ブリンカー", or icons
        while (idx < lines.length) {
            var cleanLine = (lines[idx] || "").trim();
            if (cleanLine === "" || cleanLine.includes("勝負服") || cleanLine.includes("ブリンカー") || /^\[[外地抽]\]$/.test(cleanLine)) {
                if (cleanLine.includes("ブリンカー"))
                    hasBlinker = true;
                idx++;
            }
            else {
                break;
            }
        }
        // カタカナの「マルガイ」「マルチ」の誤削除を廃止し、正式な馬名そのまま登録する
        name = (lines[idx] || "").trim();
        idx++;
        while (idx < lines.length && (lines[idx] === "" || /^\d+$/.test(lines[idx].trim()) || lines[idx].includes("勝負服")))
            idx++;
    }
    else {
        while (idx < lines.length) {
            var cleanLine = (lines[idx] || "").trim();
            if (cleanLine === "" || cleanLine.includes("勝負服") || cleanLine.includes("ブリンカー") || /^\[[外地抽]\]$/.test(cleanLine)) {
                if (cleanLine.includes("ブリンカー"))
                    hasBlinker = true;
                idx++;
            }
            else {
                break;
            }
        }
    }
    var trainer = "";
    var stableLocation = "";
    var sire = "", dam = "", bms = "";
    var odds = 0, popularity = 0;
    var horseWeight = 480, horseWeightChange = 0;
    var gender = "牡";
    var age = 4;
    var coatColor = "";
    var kinryo = 55;
    var jockey = "";
    var owner = "";
    var breeder = "";
    // Extract remaining fields using heuristics to handle different copy-paste layouts (table vs list)
    while (idx < lines.length) {
        var l = (lines[idx] || "").trim();
        if (l === "" || l.includes("勝負服") || l === "B" || l === "☆" || l === "勝負服の画像" || l === "ブリンカー") {
            idx++;
            continue;
        }
        // Past races start
        if (l.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)) {
            break;
        }
        // Gender and Age
        var gm = l.match(/^([牡牝セ]|せん)(\d+)(?:\/(.*))?$/);
        if (gm) {
            gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1];
            age = parseInt(gm[2]);
            if (gm[3])
                coatColor = gm[3].trim();
            idx++;
            continue;
        }
        // Horse Weight
        var wm = l.match(/^(\d+)kg$/) || l.match(/^(\d{3})$/);
        if (wm) {
            horseWeight = parseInt(wm[1]);
            idx++;
            var nextLine = (lines[idx] || "").trim();
            var wcm = nextLine.match(/^\(([+-]?\d+|初出走)\)$/);
            if (wcm) {
                horseWeightChange = wcm[1] === "初出走" ? 0 : parseInt(wcm[1]) || 0;
                idx++;
            }
            continue;
        }
        // Kinryo (55.0)
        if (l.match(/^\d+\.\dkg$/) || l.match(/^\d+\.\d$/)) {
            kinryo = parseFloat(l.replace("kg", ""));
            idx++;
            // Usually Jockey comes right after Kinryo in table format
            if (idx < lines.length && !lines[idx].match(/\d/) && !jockey) {
                jockey = lines[idx].trim();
                idx++;
                // Usually Trainer comes after Jockey
                if (idx < lines.length && !lines[idx].match(/\d/) && !trainer) {
                    var tmLine = lines[idx].trim();
                    var tmMatch = tmLine.match(/^(.+?)\s*[\(（]([栗美][東浦])[\)）]/);
                    if (tmMatch) {
                        trainer = tmMatch[1].trim();
                        stableLocation = tmMatch[2];
                    }
                    else {
                        // Netkeiba sometimes has "栗東" then "木村" on next line
                        if (tmLine.match(/^[栗美][東浦]$/)) {
                            stableLocation = tmLine;
                            idx++;
                            if (idx < lines.length)
                                trainer = lines[idx].trim();
                        }
                        else {
                            trainer = tmLine;
                        }
                    }
                    idx++;
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
        var pm = l.match(/^(\d+)番人気$/);
        if (pm) {
            popularity = parseInt(pm[1]);
            idx++;
            continue;
        }
        // Trainer with stable
        var tm = l.match(/^(.+?)\s*[\(（]([栗美][東浦])[\)）]$/);
        if (tm && !trainer) {
            trainer = tm[1].trim();
            stableLocation = tm[2];
            idx++;
            continue;
        }
        // Pedigree
        if (l.startsWith("父：") || l.startsWith("父:")) {
            sire = l.replace(/^父[：:]/, "").trim();
            if (!sire && idx + 1 < lines.length) {
                sire = lines[idx + 1].trim();
                idx++;
            }
            idx++;
            continue;
        }
        if (l.startsWith("母：") || l.startsWith("母:")) {
            dam = l.replace(/^母[：:]/, "").trim();
            if (!dam && idx + 1 < lines.length) {
                dam = lines[idx + 1].trim();
                idx++;
            }
            idx++;
            continue;
        }
        if (l.includes("母の父")) {
            bms = l.replace(/^.*?母の父[：:]?/, "").replace(/[\(\)（）]/g, "").trim();
            idx++;
            continue;
        }
        // Unknown string without numbers is probably jockey if we haven't found it yet
        if (!l.match(/\d/)) {
            if (!jockey) {
                jockey = l;
                idx++;
                continue;
            }
            if (!trainer && !l.match(/^[栗美][東浦]$/)) {
                trainer = l;
                idx++;
                continue;
            }
        }
        idx++; // Skip unrecognized lines
    }
    var pastRaces = [];
    while (idx < lines.length && pastRaces.length < 5) {
        var dl = lines[idx] || "";
        var dm = dl.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (!dm) {
            idx++;
            continue;
        }
        var prDate = "".concat(dm[1], "-").concat(String(dm[2]).padStart(2, "0"), "-").concat(String(dm[3]).padStart(2, "0"));
        var dlParts = dl.split(/[\t\s]+/);
        var prVenue = ((_a = dlParts[dlParts.length - 1]) === null || _a === void 0 ? void 0 : _a.trim()) || "";
        idx++;
        if (prVenue === dm[0] || prVenue.match(/^\d{4}年/)) {
            prVenue = lines[idx] || "";
            idx++;
        }
        var prRaceName = lines[idx] || "";
        idx++;
        var prRaceClass = lines[idx] || "";
        idx++;
        var rl = lines[idx] || "";
        var rm = rl.match(/(\d+)着/);
        var prResult = rm ? parseInt(rm[1]) : 0;
        var prHeadCount = 0, prFrameNumber = 0;
        var hm = rl.match(/(\d+)頭\s*(\d+)番/);
        if (hm) {
            prHeadCount = parseInt(hm[1]);
            prFrameNumber = parseInt(hm[2]);
        }
        idx++;
        var prPopularity = 0;
        var popM = (lines[idx] || "").match(/(\d+)番人気/);
        if (popM) {
            prPopularity = parseInt(popM[1]);
            idx++;
        }
        var jl = lines[idx] || "";
        var prJockey = ((_b = jl.split(/[\t\s]+/)[0]) === null || _b === void 0 ? void 0 : _b.trim().replace(/^[▲△☆◇]/, "")) || "";
        var prKinryo = 0;
        var kjm = jl.match(/(\d+\.?\d*)kg/);
        if (kjm)
            prKinryo = parseFloat(kjm[1]);
        idx++;
        var distL = lines[idx] || "";
        var distM2 = distL.match(/(\d+)(ダ|芝)/);
        var prDist = distM2 ? parseInt(distM2[1]) : 0;
        var prSurf = ((distM2 === null || distM2 === void 0 ? void 0 : distM2[2]) === "芝" || distL.includes("芝")) ? "芝" : "ダート";
        idx++;
        var tl = lines[idx] || "";
        var prTime = /\d+:\d+/.test(tl) ? tl.trim() : "";
        if (prTime)
            idx++;
        while (idx < lines.length && lines[idx] === "")
            idx++;
        var condCands = ["良", "稍重", "重", "不良"];
        var prCond = "良";
        if (condCands.includes(lines[idx] || "")) {
            prCond = lines[idx];
            idx++;
        }
        if (/^\d{2,3}$/.test(lines[idx] || ""))
            idx++;
        var wl = lines[idx] || "";
        var wm2 = wl.match(/^(\d+)kg/);
        var prWeight = wm2 ? parseInt(wm2[1]) : 480;
        if (wm2)
            idx++;
        while (idx < lines.length && lines[idx] === "")
            idx++;
        var passingPositions = "";
        var posL = lines[idx] || "";
        if (/^\d+(?:[\t\-]\d+)+$/.test(posL)) {
            passingPositions = posL.replace(/\t/g, "-");
            idx++;
        }
        var last3fTime = "";
        var f3l = lines[idx] || "";
        var f3m = f3l.match(/3F\s*(\d+\.\d)/) || f3l.match(/^(\d{2}\.\d)$/);
        if (f3m) {
            last3fTime = f3m[1];
            idx++;
        }
        var winnerName = "";
        var timeDiff = void 0;
        var tempIdx = idx;
        while (tempIdx < lines.length && tempIdx < idx + 3) {
            var wn = (lines[tempIdx] || "").trim();
            if (!wn) {
                tempIdx++;
                continue;
            }
            var wnm = wn.match(/^(.+?)\(([-+]?\d+\.?\d*)\)$/) || wn.match(/^(.+?)\(([-+]?\d+)\)$/);
            if (wnm && /[\u3040-\u9FFF\u30A0-\u30FF\uFF00-\uFFEF]/.test(wnm[1])) {
                winnerName = wnm[1].trim();
                timeDiff = parseFloat(wnm[2]);
                idx = tempIdx + 1;
                break;
            }
            tempIdx++;
        }
        while (idx < lines.length && lines[idx] === "")
            idx++;
        // 出遅れフラグとペース表記の事前スキャン
        var isStumbled = false;
        var halonPace = "";
        var scanEnd = idx;
        while (scanEnd < lines.length) {
            var nextLine = lines[scanEnd] || "";
            if (scanEnd > idx && (nextLine.match(/\d{4}年\d{1,2}月\d{1,2}日/) || nextLine.startsWith("枠") || nextLine.includes("調教評価") || nextLine.includes("追切評価"))) {
                break;
            }
            scanEnd++;
        }
        for (var k = idx - 10; k < scanEnd; k++) {
            if (k < 0)
                continue;
            var scanLine = (lines[k] || "").trim();
            if (scanLine.includes("出遅") || scanLine.includes("ゲート不善")) {
                isStumbled = true;
            }
            var paceM = scanLine.match(/(\d{2}\.\d\s*-\s*\d{2}\.\d)/);
            if (paceM) {
                halonPace = paceM[1].replace(/\s+/g, "");
            }
        }
        if (prDate && prResult) {
            var corner4pos = passingPositions
                ? parseInt(passingPositions.split("-").pop() || "5")
                : 5;
            pastRaces.push({
                date: prDate, venue: prVenue, raceName: prRaceName, raceClass: prRaceClass,
                distance: prDist, surface: prSurf, condition: prCond,
                result: prResult,
                headCount: prHeadCount || undefined,
                frameNumber: prFrameNumber || undefined,
                popularity: prPopularity || undefined,
                jockeyWeight: prKinryo || undefined,
                time: prTime,
                corner4Position: corner4pos,
                cornerOuterCount: 1,
                passingPositions: passingPositions || undefined,
                last3fTime: last3fTime || undefined,
                weight: prWeight,
                jockey: prJockey,
                winnerName: winnerName || undefined,
                timeDiff: timeDiff,
                odds: 0, prize: 0,
                isStumbled: isStumbled || undefined,
                halonPace: halonPace || undefined
            });
        }
    }
    var calculatedStyle = estimateStyle(pastRaces);
    return {
        id: (0, storage_1.generateId)(),
        number: number,
        frame: frame,
        name: name,
        age: age,
        gender: gender,
        coatColor: coatColor,
        weight: horseWeight, weightChange: horseWeightChange,
        jockey: jockey.replace(/\s+/g, " "), jockeyWeight: kinryo,
        trainer: trainer,
        owner: owner,
        breeder: breeder,
        sire: sire,
        dam: dam,
        bms: bms,
        stableLocation: stableLocation,
        bloodline: [sire, bms].filter(Boolean).join(" / "),
        style: calculatedStyle,
        odds: odds,
        popularity: popularity,
        pastRaces: pastRaces,
        useBlinkers: hasBlinker,
        trainingTime: trainingTime || undefined,
        trainingRating: trainingRating || undefined,
    };
}
