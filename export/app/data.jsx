// Sudoku Dojo — core game constants. Puzzle generation lives in generator.jsx.

const SAME_BOX = (r1, c1, r2, c2) =>
  Math.floor(r1 / 3) === Math.floor(r2 / 3) &&
  Math.floor(c1 / 3) === Math.floor(c2 / 3);

function fmtClock(s) {
  if (s == null) return '—';
  const m = Math.floor(s / 60), x = s % 60;
  return (m < 10 ? '0' + m : m) + ':' + (x < 10 ? '0' + x : x);
}

// Zen difficulty levels — each generates a real puzzle with this many blank cells.
const LEVELS = [
  { key: 'beginner',     en: 'Beginner',     jp: '白帯', belt: 'shiro',
    seed: 500,  empties: 30, hints: 5, blurb: 'More numbers to start, plenty of hints.' },
  { key: 'intermediate', en: 'Intermediate', jp: '緑帯', belt: 'midori',
    seed: 1000, empties: 40, hints: 3, blurb: 'A balanced grid. Some help when stuck.' },
  { key: 'advanced',     en: 'Advanced',     jp: '黒帯', belt: 'kuro',
    seed: 1500, empties: 50, hints: 2, blurb: 'Sparser grid, fewer hints. Real work.' },
  { key: 'expert',       en: 'Expert',       jp: '師匠', belt: 'shishou',
    seed: 1900, empties: 58, hints: 1, blurb: 'Bare grid, a single hint. Prove it.' },
];

const START_ELO = 400;

// Rated time controls — chess-style, each has its own rating + countdown clock.
const TIME_CONTROLS = [
  { key: 'bullet', en: 'Bullet', icon: 'bolt',  limit: 180, empties: 35, hints: 1,
    blurb: '3 min · tight clock, light grid.' },
  { key: 'blitz',  en: 'Blitz',  icon: 'bolt',  limit: 420, empties: 45, hints: 2,
    blurb: '7 min · balanced sprint.' },
  { key: 'rapid',  en: 'Rapid',  icon: 'clock', limit: 900, empties: 55, hints: 3,
    blurb: '15 min · a full, hard grid.' },
];
const CONTROL_BY_KEY = {};
TIME_CONTROLS.forEach((t) => { CONTROL_BY_KEY[t.key] = t; });

// Onboarding familiarity → seeds the starting rating for all controls.
const FAMILIARITY = [
  { key: 'new',    en: 'New to Sudoku',     jp: '初心', blurb: "Never really played — we'll start gentle.", seed: 300 },
  { key: 'some',   en: 'I know the basics', jp: '中級', blurb: 'Comfortable with easy grids.', seed: 650 },
  { key: 'strong', en: "I'm experienced",   jp: '上級', blurb: 'Bring on the hard puzzles.', seed: 1050 },
];

// Fresh per-key stat buckets (rated time controls + zen levels).
function makeStats() {
  const o = {};
  TIME_CONTROLS.forEach((t) => { o[t.key] = { played: 0, solved: 0, noMistake: 0, bestTime: null }; });
  LEVELS.forEach((l) => { o[l.key] = { played: 0, solved: 0, noMistake: 0, bestTime: null }; });
  return o;
}

// Per-control ratings, all seeded from familiarity answer.
function makeRatings(seed) {
  const s = seed || START_ELO;
  return { bullet: s, blitz: s, rapid: s };
}

Object.assign(window, {
  LEVELS, TIME_CONTROLS, CONTROL_BY_KEY, FAMILIARITY,
  SAME_BOX, START_ELO, fmtClock, makeStats, makeRatings,
});
