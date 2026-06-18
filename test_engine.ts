import { calculateTsuchiyaScore } from './app/lib/engine.ts';
import { Race, Horse, MasterData } from './app/types/index.ts';

const horse: Horse = {
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

const race: Race = {
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
