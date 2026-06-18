"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_ts_1 = require("./app/lib/engine.ts");
var horse = {
    number: 1,
    frame: 1,
    name: 'スナッピードレッサ',
    gender: '牡',
    age: 3,
    weight: 500,
    weightChange: 0,
    jockey: 'ルメール',
    jockeyWeight: 55,
    odds: 5.5,
    popularity: 2,
    trainer: 'Test',
    style: '先行',
    pastRaces: []
};
var race = {
    id: 'test',
    date: '2026-06-18',
    venue: '東京',
    trackName: '東京',
    raceNumber: 1,
    raceName: '1R',
    distance: 1600,
    surface: '芝',
    condition: '良',
    headCount: 18,
    horses: [horse]
};
var masterData = {
    horses: {},
    jockeys: {},
    trainers: {},
    races: {}
};
try {
    console.log('Running...');
    var result = (0, engine_ts_1.calculateTsuchiyaScore)(horse, race, [], masterData);
    console.log('Success:', result);
}
catch (e) {
    console.error('Error:', e);
}
