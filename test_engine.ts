import { calculateTsuchiyaScore } from './app/lib/engine';
import { Race, Horse, MasterData } from './app/types/index';

const horse: Horse = {
  number: 1,
  frame: 1,
  name: '繧ｹ繝翫ャ繝斐・繝峨Ξ繝・し',
  gender: '迚｡',
  age: 3,
  weight: 500,
  weightChange: 0,
  jockey: '繝ｫ繝｡繝ｼ繝ｫ',
  jockeyWeight: 55,
  odds: 5.5,
  popularity: 2,
  trainer: 'Test',
  style: '蜈郁｡・,
  pastRaces: []
};

const race: Race = {
  id: 'test',
  date: '2026-06-18',
  venue: '譚ｱ莠ｬ',
  trackName: '譚ｱ莠ｬ',
  raceNumber: 1,
  raceName: '1R',
  distance: 1600,
  surface: '闃・,
  condition: '濶ｯ',
  headCount: 18,
  horses: [horse]
};

const masterData: MasterData = {
  horses: {},
  jockeys: {},
  trainers: {},
  races: {}
};

try {
  console.log('Running...');
  const result = calculateTsuchiyaScore(horse, race, [], masterData);
  console.log('Success:', result);
} catch (e) {
  console.error('Error:', e);
}
