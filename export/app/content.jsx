// Sudoku Dojo — feature content: earned belt ranks, technique lessons,
// hanko-stamp achievements, and the leaderboard roster.

// ---- Belt rank progression (earned from rating, not difficulty chosen) ----
const BELT_RANKS = [
  { key: 'white',  en: 'White Belt',  jp: '白帯', min: 0 },
  { key: 'yellow', en: 'Yellow Belt', jp: '黄帯', min: 550 },
  { key: 'green',  en: 'Green Belt',  jp: '緑帯', min: 750 },
  { key: 'brown',  en: 'Brown Belt',  jp: '茶帯', min: 1050 },
  { key: 'black',  en: 'Black Belt',  jp: '黒帯', min: 1400 },
  { key: 'sensei', en: 'Sensei',      jp: '師範', min: 1800 },
];
function beltForRating(r) {
  let b = BELT_RANKS[0];
  for (const x of BELT_RANKS) if ((r || 0) >= x.min) b = x;
  return b;
}
function nextBelt(r) {
  for (const x of BELT_RANKS) if ((r || 0) < x.min) return x;
  return null;
}

// ---- Technique lessons (teaching loop). Each has a one-house demo. ----
// A demo is a single row of nine cells; `notes` are pencil candidates; the
// learner reveals the deduced placement at `target`.
const TECHNIQUES = [
  { key: 'naked-single', en: 'Naked Single', jp: '裸の単', rank: 'White',
    blurb: 'A cell with only one number left.',
    steps: ['Eight of the nine numbers already sit in this row.',
            'Only 4 is missing — it can go nowhere else.'],
    row: [5,3,0,7,6,1,9,2,8], notes: {}, target: 2, answer: 4 },
  { key: 'hidden-single', en: 'Hidden Single', jp: '隠れた単', rank: 'Yellow',
    blurb: 'A number that fits only one cell in a house.',
    steps: ['Where can 4 still go in this row?',
            'Every empty cell but one already sees a 4 elsewhere — 4 is hidden here.'],
    row: [5,3,0,0,6,0,9,0,8], notes: { 2:[2,4,7], 3:[1,2,7], 5:[1,7], 7:[1,2] }, target: 2, answer: 4 },
  { key: 'naked-pair', en: 'Naked Pair', jp: '裸の対', rank: 'Green',
    blurb: 'Two cells sharing two candidates lock them away.',
    steps: ['These two cells can only be 2 or 7.',
            'So 2 and 7 are spoken for — this cell drops them, leaving 5.'],
    row: [1,3,0,0,6,8,9,4,0], notes: { 2:[2,7], 3:[2,7], 8:[2,5,7] }, target: 8, answer: 5 },
  { key: 'pointing-pair', en: 'Pointing Pair', jp: '指向対', rank: 'Brown',
    blurb: 'A candidate locked to one line of a box.',
    steps: ['In this box, 6 can only appear along this row.',
            'So 6 leaves the rest of the row — making this cell a single 6.'],
    row: [1,0,4,0,9,0,0,2,0], notes: { 1:[6,8], 3:[6,7], 6:[6], 8:[3,6] }, target: 6, answer: 6 },
  { key: 'x-wing', en: 'X-Wing', jp: 'エックスウィング', rank: 'Black',
    blurb: 'A rectangle of candidates that clears a number across rows.',
    steps: ['4 sits in just two columns across two rows — an X-Wing.',
            'That clears 4 from those columns elsewhere, leaving 4 alone here.'],
    row: [5,0,2,7,0,1,9,0,8], notes: { 1:[3,4,6], 4:[3,4], 7:[4,6] }, target: 1, answer: 3 },
];
const TECH_BY_KEY = {};
TECHNIQUES.forEach((t) => { TECH_BY_KEY[t.key] = t; });
const LEVEL_TECHNIQUE = {
  beginner: 'naked-single', intermediate: 'hidden-single',
  advanced: 'naked-pair', expert: 'x-wing',
};

// ---- Hanko-stamp achievements ----
const STAMPS = [
  { key: 'shodan', jp: '初段', en: 'First Solve',   hint: 'Solve your first puzzle.',  cond: (p) => (p.solved || 0) >= 1 },
  { key: 'renzoku', jp: '連続', en: '7-Day Streak',  hint: 'Reach a 7-day streak.',     cond: (p) => (p.bestStreak || 0) >= 7 },
  { key: 'kanpeki', jp: '完璧', en: 'Perfect Solve', hint: 'Solve with no mistakes or hints.', cond: (p) => (p.perfect || 0) >= 1 },
  { key: 'sokudo',  jp: '速度', en: 'Speed Solve',   hint: 'Solve a puzzle under 1:30.', cond: (p) => p.fastest != null && p.fastest <= 90 },
  { key: 'yama',    jp: '山',   en: '100 Solved',    hint: 'Solve 100 puzzles.',        cond: (p) => (p.solved || 0) >= 100 },
];

// ---- Real Elo rating calculation (standard Elo with K-factor) ----
// puzzleElo: difficulty of the puzzle played (derived from mode).
// gamesPlayed: total rated games (used to transition out of provisional period).
const PUZZLE_ELO = {
  bullet: 900, blitz: 1100, rapid: 1300,
  beginner: 700, intermediate: 900, advanced: 1100, expert: 1400,
};

function computeEloDelta(playerRating, puzzleElo, won, mistakes, hintsUsed, gamesPlayed) {
  const expected = 1 / (1 + Math.pow(10, (puzzleElo - playerRating) / 400));
  const score = won ? 1 : 0;
  const K = (gamesPlayed || 0) < 20 ? 40 : 20;
  let delta = Math.round(K * (score - expected));
  if (won) {
    // Small quality penalty: mistakes and hints slightly reduce the gain.
    delta = Math.max(1, delta - mistakes * 2 - hintsUsed);
  } else {
    delta = Math.min(-1, delta);
  }
  return delta;
}

// ---- Dojo Pass (premium) ----
const DOJO_PASS = {
  monthly: '$3.50', yearly: '$24', yearlyPerMo: '$2/mo',
  benefits: [
    'Unlimited rated puzzles',
    'Full Technique Library',
    'Appear on the leaderboard',
    'Rating history & belt progression',
    'Puzzle Rush mode',
  ],
};
const FREE_DAILY_RATED = 1;
const FREE_TECHNIQUES = 3;
function techLockedFree(idx, premium) { return !premium && idx >= FREE_TECHNIQUES; }

Object.assign(window, {
  BELT_RANKS, beltForRating, nextBelt,
  TECHNIQUES, TECH_BY_KEY, LEVEL_TECHNIQUE,
  STAMPS, PUZZLE_ELO, computeEloDelta,
  DOJO_PASS, FREE_DAILY_RATED, FREE_TECHNIQUES, techLockedFree,
});
