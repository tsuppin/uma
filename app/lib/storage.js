"use strict";
// ==========================================
// データ管理 - サーバーサイドAPI経由
// localStorage ではなくサーバーのJSONファイルに保存
// どのブラウザ・スマホモードでも確実に永続化される
// ==========================================
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultState = void 0;
exports.loadStateFromServer = loadStateFromServer;
exports.saveStateToServer = saveStateToServer;
exports.addRace = addRace;
exports.updateRace = updateRace;
exports.addResult = addResult;
exports.addLearningPatch = addLearningPatch;
exports.togglePatch = togglePatch;
exports.deleteRace = deleteRace;
exports.generateId = generateId;
exports.saveState = saveState;
var db_1 = require("./db");
var indexeddb_1 = require("./indexeddb");
exports.defaultState = {
    races: [],
    learningPatches: [],
    modelVersion: 'TsuchiyaProtocol-Omega v7.0',
    stats: {
        totalRaces: 0,
        hitCount: 0,
        hitRate: 0,
        totalInvested: 0,
        totalReturn: 0,
        roi: 0,
    },
    masterData: {
        horses: {},
        jockeys: {}
    }
};
// ==========================================
// サーバーからの状態ロード（非同期）
// ==========================================
function loadStateFromServer() {
    return __awaiter(this, void 0, void 0, function () {
        var data, oldData, parsed, res, serverState, fetchErr_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof window === 'undefined')
                        return [2 /*return*/, exports.defaultState];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, (0, indexeddb_1.loadStateFromIDB)()];
                case 2:
                    data = _a.sent();
                    if (data) {
                        return [2 /*return*/, data];
                    }
                    oldData = localStorage.getItem('keiba_app_state');
                    if (oldData) {
                        parsed = JSON.parse(oldData);
                        (0, indexeddb_1.saveStateToIDB)(parsed).catch(console.error);
                        return [2 /*return*/, parsed];
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 7, , 8]);
                    return [4 /*yield*/, fetch('/api/state')];
                case 4:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, res.json()];
                case 5:
                    serverState = _a.sent();
                    (0, indexeddb_1.saveStateToIDB)(serverState).catch(console.error);
                    return [2 /*return*/, serverState];
                case 6: return [3 /*break*/, 8];
                case 7:
                    fetchErr_1 = _a.sent();
                    console.warn('[storage] /api/state からの読み込み失敗:', fetchErr_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, exports.defaultState];
                case 9:
                    e_1 = _a.sent();
                    console.error('[storage] IndexedDBからの読み込み失敗:', e_1);
                    return [2 /*return*/, exports.defaultState];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// ==========================================
// サーバーへの状態保存（非同期・fire-and-forget）
// ==========================================
function saveStateToServer(state) {
    return __awaiter(this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof window === 'undefined')
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, indexeddb_1.saveStateToIDB)(state)];
                case 2:
                    _a.sent();
                    // サーバーJSONにも保存（バックグラウンド）
                    fetch('/api/state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(state),
                    }).catch(function (err) { return console.warn('[storage] /api/state POST 失敗:', err); });
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    console.error('[storage] IndexedDBへの保存失敗:', e_2);
                    window.dispatchEvent(new CustomEvent('storage-save-error', { detail: { reason: 'local_error' } }));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// ==========================================
// 状態変更関数（同期的にReact stateを更新し、非同期でサーバーに保存）
// ==========================================
function addRace(state, race) {
    var newState = __assign(__assign({}, state), { races: __spreadArray(__spreadArray([], state.races, true), [race], false), masterData: (0, db_1.updateMasterDataWithRace)(state.masterData, race) });
    saveStateToServer(newState); // 非同期保存
    return newState;
}
function updateRace(state, updatedRace) {
    var newState = __assign(__assign({}, state), { races: state.races.map(function (r) { return r.id === updatedRace.id ? updatedRace : r; }), masterData: (0, db_1.updateMasterDataWithRace)(state.masterData, updatedRace) });
    saveStateToServer(newState);
    return newState;
}
function addResult(state, result) {
    var race = state.races.find(function (r) { return r.id === result.raceId; });
    var updatedRaces = state.races.map(function (r) {
        if (r.id === result.raceId) {
            return __assign(__assign({}, r), { result: result });
        }
        return r;
    });
    // 統計更新
    var completedRaces = updatedRaces.filter(function (r) { return r.result; });
    var hitRaces = completedRaces.filter(function (r) {
        var res = r.result;
        if (!res)
            return false;
        var isHitViaHits = res.hits && (res.hits.trio || res.hits.trifecta || res.hits.quinella || res.hits.exacta);
        var isHitViaTickets = res.hitTickets && res.hitTickets.length > 0;
        return isHitViaHits || isHitViaTickets;
    });
    var totalReturn = completedRaces.reduce(function (sum, r) { var _a; return sum + (((_a = r.result) === null || _a === void 0 ? void 0 : _a.profit) || 0); }, 0);
    var newState = __assign(__assign({}, state), { races: updatedRaces, stats: {
            totalRaces: completedRaces.length,
            hitCount: hitRaces.length,
            hitRate: completedRaces.length > 0 ? hitRaces.length / completedRaces.length : 0,
            totalInvested: completedRaces.length * 1300, // 13点 × 100円
            totalReturn: totalReturn,
            roi: completedRaces.length > 0 ? (totalReturn - completedRaces.length * 1300) / (completedRaces.length * 1300) : 0,
        }, masterData: race ? (0, db_1.updateMasterDataWithResult)(state.masterData, result, race) : state.masterData });
    saveStateToServer(newState);
    return newState;
}
function addLearningPatch(state, patch) {
    var newState = __assign(__assign({}, state), { learningPatches: __spreadArray(__spreadArray([], state.learningPatches, true), [patch], false), modelVersion: "TsuchiyaProtocol-Omega ".concat(patch.version) });
    saveStateToServer(newState);
    return newState;
}
function togglePatch(state, patchId) {
    var newState = __assign(__assign({}, state), { learningPatches: state.learningPatches.map(function (p) {
            return p.id === patchId ? __assign(__assign({}, p), { active: !p.active }) : p;
        }) });
    saveStateToServer(newState);
    return newState;
}
function deleteRace(state, raceId) {
    var newState = __assign(__assign({}, state), { races: state.races.filter(function (r) { return r.id !== raceId; }) });
    saveStateToServer(newState);
    return newState;
}
function generateId() {
    return "".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
}
// ==========================================
// 後方互換（他コンポーネントからのimport対応）
// ==========================================
function saveState(state) {
    saveStateToServer(state);
}
