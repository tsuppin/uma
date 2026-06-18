"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMasterDataWithRace = updateMasterDataWithRace;
exports.updateMasterDataWithResult = updateMasterDataWithResult;
// ==========================================
// データベース（MasterData）管理ロジック
// ==========================================
function updateMasterDataWithRace(masterData, race) {
    var newMasterData = __assign({}, masterData);
    if (!newMasterData.horses)
        newMasterData.horses = {};
    if (!newMasterData.jockeys)
        newMasterData.jockeys = {};
    race.horses.forEach(function (h) {
        // 1. 馬データの更新（基本情報）
        if (!newMasterData.horses[h.name]) {
            newMasterData.horses[h.name] = { name: h.name, results: [] };
        }
        var hm = newMasterData.horses[h.name];
        hm.lastWeight = h.weight;
        hm.lastWeightChange = h.weightChange;
        // 出馬表に含まれる過去走データを蓄積
        if (h.pastRaces && h.pastRaces.length > 0) {
            h.pastRaces.forEach(function (pr) {
                if (!pr.date || !pr.result)
                    return;
                // 1.1 馬の履歴
                var exists = hm.results.some(function (old) { return old.date === pr.date && old.venue === pr.venue; });
                if (!exists) {
                    hm.results.push({
                        date: pr.date, rank: pr.result, venue: pr.venue, distance: pr.distance, weight: pr.weight, time: pr.time
                    });
                }
                // 自己ベストタイムの更新
                if (pr.time && pr.time.includes(':')) {
                    var key = "".concat(pr.venue, "_").concat(pr.distance);
                    if (!hm.bestTime)
                        hm.bestTime = {};
                    var parseTime = function (t) {
                        var _a = t.split(':'), m = _a[0], s = _a[1];
                        return parseFloat(m) * 60 + parseFloat(s);
                    };
                    var currentSec = parseTime(pr.time);
                    if (!hm.bestTime[key] || currentSec < parseTime(hm.bestTime[key])) {
                        hm.bestTime[key] = pr.time;
                    }
                }
                // 1.2 過去走の騎手データも蓄積 (精度向上)
                if (pr.jockey) {
                    if (!newMasterData.jockeys[pr.jockey]) {
                        newMasterData.jockeys[pr.jockey] = { name: pr.jockey, totalRaces: 0, wins: 0, top3: 0, venueStats: {} };
                    }
                    var pjm = newMasterData.jockeys[pr.jockey];
                    if (!exists) { // 新規データの場合のみ加算
                        pjm.totalRaces++;
                        if (!pjm.venueStats[pr.venue])
                            pjm.venueStats[pr.venue] = { total: 0, wins: 0, top3: 0 };
                        pjm.venueStats[pr.venue].total++;
                        if (pr.result === 1) {
                            pjm.wins++;
                            pjm.venueStats[pr.venue].wins++;
                        }
                        if (pr.result <= 3) {
                            pjm.top3++;
                            pjm.venueStats[pr.venue].top3++;
                        }
                    }
                }
            });
            hm.results.sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
        }
        // 2. 騎手データの更新（出走回数など）
        if (!newMasterData.jockeys[h.jockey]) {
            newMasterData.jockeys[h.jockey] = {
                name: h.jockey, totalRaces: 0, wins: 0, top3: 0, venueStats: {}
            };
        }
        var jm = newMasterData.jockeys[h.jockey];
        jm.totalRaces++;
        if (!jm.venueStats[race.venue]) {
            jm.venueStats[race.venue] = { total: 0, wins: 0, top3: 0 };
        }
        jm.venueStats[race.venue].total++;
    });
    return newMasterData;
}
function updateMasterDataWithResult(masterData, result, race) {
    var newMasterData = __assign({}, masterData);
    if (!newMasterData.horses)
        newMasterData.horses = {};
    if (!newMasterData.jockeys)
        newMasterData.jockeys = {};
    if (!newMasterData.laps)
        newMasterData.laps = {};
    // 1. ラップタイム (ハロンタイム) の蓄積
    if (result.lapTimes && result.lapTimes.length > 0) {
        var key = "".concat(race.venue, "_").concat(race.distance, "_").concat(race.surface);
        if (!newMasterData.laps[key]) {
            newMasterData.laps[key] = [];
        }
        var alreadyExists = newMasterData.laps[key].some(function (l) { return l.date === race.date; });
        if (!alreadyExists) {
            newMasterData.laps[key].push({
                venue: race.venue,
                distance: race.distance,
                surface: race.surface,
                laps: result.lapTimes,
                date: race.date
            });
        }
    }
    // 2. 勝ち馬プロフィールの蓄積
    if (result.winnerProfile) {
        var wp = result.winnerProfile;
        if (!newMasterData.horses[wp.horseName]) {
            newMasterData.horses[wp.horseName] = { name: wp.horseName, results: [] };
        }
        var hm = newMasterData.horses[wp.horseName];
        if (wp.sire)
            hm.sire = wp.sire;
        if (wp.dam)
            hm.dam = wp.dam;
        if (wp.owner)
            hm.owner = wp.owner;
        if (wp.breeder)
            hm.breeder = wp.breeder;
    }
    // 3. 出来事 (incidents) の馬個別蓄積
    if (result.incidents) {
        var incidentText_1 = result.incidents;
        race.horses.forEach(function (h) {
            // 出来事テキストに馬名が含まれているか確認
            if (incidentText_1.includes(h.name)) {
                if (!newMasterData.horses[h.name]) {
                    newMasterData.horses[h.name] = { name: h.name, results: [] };
                }
                var hm = newMasterData.horses[h.name];
                if (!hm.incidents)
                    hm.incidents = [];
                var alreadyHas = hm.incidents.some(function (inc) { return inc.date === race.date; });
                if (!alreadyHas) {
                    hm.incidents.push({
                        date: race.date,
                        venue: race.venue,
                        note: incidentText_1
                    });
                }
            }
        });
    }
    result.result.forEach(function (r) {
        // 4. 馬の結果を蓄積
        if (!newMasterData.horses[r.horseName]) {
            newMasterData.horses[r.horseName] = { name: r.horseName, results: [] };
        }
        var hm = newMasterData.horses[r.horseName];
        // 所属の永続化
        var rWithBelonging = r;
        if (rWithBelonging.belonging) {
            hm.belonging = rWithBelonging.belonging;
        }
        // 重複チェック
        if (!hm.results.some(function (old) { return old.date === race.date && old.venue === race.venue; })) {
            hm.results.push({
                date: race.date,
                rank: r.rank,
                venue: race.venue,
                distance: race.distance,
                weight: r.weight,
                time: r.time
            });
        }
        // 自己ベストタイムの更新
        if (r.time && r.time.includes(':')) {
            var key = "".concat(race.venue, "_").concat(race.distance);
            if (!hm.bestTime)
                hm.bestTime = {};
            var parseTime = function (t) {
                var _a = t.split(':'), m = _a[0], s = _a[1];
                return parseFloat(m) * 60 + parseFloat(s);
            };
            var currentSec = parseTime(r.time);
            if (!hm.bestTime[key] || currentSec < parseTime(hm.bestTime[key])) {
                hm.bestTime[key] = r.time;
            }
        }
        // 5. 騎手の成績を更新
        var horse = race.horses.find(function (h) { return h.name === r.horseName; });
        if (horse && newMasterData.jockeys[horse.jockey]) {
            var jm = newMasterData.jockeys[horse.jockey];
            var vs = jm.venueStats[race.venue];
            if (r.rank === 1) {
                jm.wins++;
                if (vs)
                    vs.wins++;
            }
            if (r.rank <= 3) {
                jm.top3++;
                if (vs)
                    vs.top3++;
            }
        }
    });
    return newMasterData;
}
