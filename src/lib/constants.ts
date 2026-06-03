import type { DifficultyTarget } from '@/engine/types';

export type TimeControl = 'bullet' | 'blitz' | 'rapid';
export type ZenDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
export type BeltKey = 'white' | 'yellow' | 'green' | 'brown' | 'black' | 'sensei';

export interface Belt {
  key: BeltKey;
  name: string;
  jp: string;
  minRating: number;
  minPuzzles: number;
  color: string;
}

export const BELTS: Belt[] = [
  { key: 'white', name: 'White', jp: '白帯', minRating: 0, minPuzzles: 0, color: '#F2ECD8' },
  { key: 'yellow', name: 'Yellow', jp: '黄帯', minRating: 1100, minPuzzles: 10, color: '#E8C84B' },
  { key: 'green', name: 'Green', jp: '緑帯', minRating: 1250, minPuzzles: 30, color: '#5C9A52' },
  { key: 'brown', name: 'Brown', jp: '茶帯', minRating: 1400, minPuzzles: 75, color: '#7A4E2D' },
  { key: 'black', name: 'Black', jp: '黒帯', minRating: 1600, minPuzzles: 150, color: '#221F1A' },
  { key: 'sensei', name: 'Sensei', jp: '師匠', minRating: 1800, minPuzzles: 300, color: '#C0392B' },
];

/** Highest belt the player qualifies for, given rating and puzzles solved. */
export function beltFor(rating: number, puzzlesSolved: number): Belt {
  let earned = BELTS[0];
  for (const b of BELTS) {
    if (rating >= b.minRating && puzzlesSolved >= b.minPuzzles) earned = b;
  }
  return earned;
}

export interface AchievementDef {
  key: string;
  jp: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_solve', jp: '初段', name: 'First Step', description: 'Solve your first puzzle.' },
  { key: 'streak_7', jp: '連続', name: 'Seven Days', description: 'Reach a 7-day streak.' },
  {
    key: 'perfect_solve',
    jp: '完璧',
    name: 'Flawless',
    description: 'Solve with 0 mistakes and 0 hints.',
  },
  { key: 'speed_solve', jp: '速度', name: 'Swift', description: 'Solve a Bullet puzzle under 90s.' },
  { key: 'century', jp: '山', name: 'Centurion', description: 'Solve 100 puzzles.' },
];

export interface TimeControlDef {
  key: TimeControl;
  name: string;
  jp: string;
  seconds: number;
  band: DifficultyTarget;
  description: string;
}

// Time controls (rated). Each maps to a blank band → puzzle difficulty.
export const TIME_CONTROLS: TimeControlDef[] = [
  {
    key: 'bullet',
    name: 'Bullet',
    jp: '弾丸',
    seconds: 180,
    band: { minBlanks: 35, maxBlanks: 40 },
    description: '3 min · quick reflexes',
  },
  {
    key: 'blitz',
    name: 'Blitz',
    jp: '電撃',
    seconds: 420,
    band: { minBlanks: 41, maxBlanks: 46 },
    description: '7 min · balanced',
  },
  {
    key: 'rapid',
    name: 'Rapid',
    jp: '迅速',
    seconds: 900,
    band: { minBlanks: 47, maxBlanks: 51 },
    description: '15 min · deep thinking',
  },
];

export interface ZenLevelDef {
  key: ZenDifficulty;
  name: string;
  jp: string;
  band: DifficultyTarget;
}

// Zen difficulty levels (no rating, no clock).
export const ZEN_LEVELS: ZenLevelDef[] = [
  { key: 'beginner', name: 'Beginner', jp: '初級', band: { minBlanks: 30, maxBlanks: 34 } },
  { key: 'easy', name: 'Easy', jp: '易しい', band: { minBlanks: 35, maxBlanks: 40 } },
  { key: 'medium', name: 'Medium', jp: '普通', band: { minBlanks: 41, maxBlanks: 46 } },
  { key: 'hard', name: 'Hard', jp: '難しい', band: { minBlanks: 47, maxBlanks: 51 } },
  { key: 'expert', name: 'Expert', jp: '達人', band: { minBlanks: 52, maxBlanks: 58 } },
];

export const TIME_CONTROL_BY_KEY = Object.fromEntries(
  TIME_CONTROLS.map((t) => [t.key, t]),
) as Record<TimeControl, TimeControlDef>;
export const ZEN_LEVEL_BY_KEY = Object.fromEntries(
  ZEN_LEVELS.map((z) => [z.key, z]),
) as Record<ZenDifficulty, ZenLevelDef>;

// Monetization
export const FREE_DAILY_RATED = 1;
export const HINTS_PER_PUZZLE = 3;
export const MAX_MISTAKES = 5;
export const FREE_TECHNIQUES = 3;

export const PRICING = {
  monthly: { id: 'monthly', label: 'Monthly', price: '$3.99', note: '' },
  yearly: { id: 'yearly', label: 'Yearly', price: '$24.99', note: 'Best value' },
} as const;
