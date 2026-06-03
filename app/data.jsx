// Sudoku Dojo — core flow data. One real solvable puzzle + full solution so the
// interactive grid can validate. Difficulty controls how many cells start empty
// and how many hints you get.

const SOLUTION = [
  [5,3,4, 6,7,8, 9,1,2],
  [6,7,2, 1,9,5, 3,4,8],
  [1,9,8, 3,4,2, 5,6,7],
  [8,5,9, 7,6,1, 4,2,3],
  [4,2,6, 8,5,3, 7,9,1],
  [7,1,3, 9,2,4, 8,5,6],
  [9,6,1, 5,3,7, 2,8,4],
  [2,8,7, 4,1,9, 6,3,5],
  [3,4,5, 2,8,6, 1,7,9],
];

// Original puzzle givens (permanent ink). 1 = given.
const GIVEN_MASK = [
  [1,1,0, 0,1,0, 0,0,0],
  [1,0,0, 1,1,1, 0,0,0],
  [0,1,1, 0,0,0, 0,1,0],
  [1,0,0, 0,1,0, 0,0,1],
  [1,0,0, 1,0,1, 0,0,1],
  [1,0,0, 0,1,0, 0,0,1],
  [0,1,0, 0,0,0, 1,1,0],
  [0,0,0, 1,1,1, 0,0,1],
  [0,0,0, 0,1,0, 0,1,1],
];

// Pencil-mark candidates seeded into a couple of cells (shown only if empty).
const NOTES_START = { '3-3': [1,4,7], '4-4': [2,5,8] };

const START_SELECTED = { r: 4, c: 4 };

// Ordered list of non-given cells. We empty the first N of these for difficulty.
// '3-3' and '4-4' come first so the pencil-note demo cells are always blank,
// then the rest in a deterministic scatter so emptiness spreads across the grid.
const CANDIDATE_EMPTIES = (function () {
  const priority = ['3-3', '4-4'];
  const rest = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const key = r + '-' + c;
      if (GIVEN_MASK[r][c] === 0 && priority.indexOf(key) === -1) rest.push(key);
    }
  }
  rest.sort((a, b) => {
    const [ar, ac] = a.split('-').map(Number);
    const [br, bc] = b.split('-').map(Number);
    return ((ar * 31 + ac * 17) % 53) - ((br * 31 + bc * 17) % 53);
  });
  return priority.concat(rest);
})();

// Difficulty levels. `empties` = blanks to solve, `hints` = hint tokens,
// `seed` = the Elo of the puzzles you're matched to at this level.
const LEVELS = [
  { key: 'beginner',     en: 'Beginner',     jp: '白帯', romaji: 'Shiro-obi', belt: 'shiro',
    seed: 500,  empties: 6,  hints: 5, blurb: 'More numbers to start, plenty of hints.' },
  { key: 'intermediate', en: 'Intermediate', jp: '緑帯', romaji: 'Midori-obi', belt: 'midori',
    seed: 1000, empties: 11, hints: 3, blurb: 'A balanced grid. Some help when stuck.' },
  { key: 'advanced',     en: 'Advanced',     jp: '黒帯', romaji: 'Kuro-obi', belt: 'kuro',
    seed: 1500, empties: 18, hints: 2, blurb: 'Sparser grid, fewer hints. Real work.' },
  { key: 'expert',       en: 'Expert',       jp: '師匠', romaji: 'Shishou', belt: 'shishou',
    seed: 1900, empties: 26, hints: 1, blurb: 'Bare grid, a single hint. Prove it.' },
];

const START_ELO = 400;

// Rated TIME CONTROLS (chess-style). Each is a real, different game: its own
// clock, blank count, hint budget, and separate rating.
const TIME_CONTROLS = [
  { key: 'bullet', en: 'Bullet', icon: 'bolt',  limit: 180, empties: 14, hints: 1,
    blurb: '3 min · tight clock, light grid.' },
  { key: 'blitz',  en: 'Blitz',  icon: 'bolt',  limit: 420, empties: 24, hints: 2,
    blurb: '7 min · balanced sprint.' },
  { key: 'rapid',  en: 'Rapid',  icon: 'clock', limit: 900, empties: 34, hints: 3,
    blurb: '15 min · a full, hard grid.' },
];
const CONTROL_BY_KEY = {};
TIME_CONTROLS.forEach((t) => { CONTROL_BY_KEY[t.key] = t; });

// Onboarding familiarity → seeds the starting rating for all controls.
const FAMILIARITY = [
  { key: 'new',    en: "New to Sudoku",  jp: '初心', blurb: "Never really played — we'll start gentle.", seed: 300 },
  { key: 'some',   en: 'I know the basics', jp: '中級', blurb: 'Comfortable with easy grids.', seed: 650 },
  { key: 'strong', en: "I'm experienced", jp: '上級', blurb: 'Bring on the hard puzzles.', seed: 1050 },
];

// Build the initial cell model, emptying `emptyCount` non-given cells.
function buildBoard(emptyCount) {
  const n = emptyCount || 9;
  const empty = new Set(CANDIDATE_EMPTIES.slice(0, n));
  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const key = r + '-' + c;
      const given = GIVEN_MASK[r][c] === 1;
      const isEmpty = empty.has(key);
      cells.push({
        r, c, key,
        given,
        value: isEmpty ? 0 : SOLUTION[r][c],
        notes: (isEmpty && NOTES_START[key]) ? NOTES_START[key].slice() : [],
        wrong: false,
      });
    }
  }
  return cells;
}

const SAME_BOX = (r1, c1, r2, c2) =>
  Math.floor(r1 / 3) === Math.floor(r2 / 3) &&
  Math.floor(c1 / 3) === Math.floor(c2 / 3);

// mm:ss for stats/history.
function fmtClock(s) {
  if (s == null) return '—';
  const m = Math.floor(s / 60), x = s % 60;
  return (m < 10 ? '0' + m : m) + ':' + (x < 10 ? '0' + x : x);
}

// Fresh per-key stat buckets (rated time controls + zen levels).
function makeStats() {
  const o = {};
  TIME_CONTROLS.forEach((t) => { o[t.key] = { played: 0, solved: 0, noMistake: 0, bestTime: null }; });
  LEVELS.forEach((l) => { o[l.key] = { played: 0, solved: 0, noMistake: 0, bestTime: null }; });
  return o;
}

// Per-control ratings, all seeded from familiarity.
function makeRatings(seed) {
  const s = seed || START_ELO;
  return { bullet: s, blitz: s, rapid: s };
}

Object.assign(window, {
  SOLUTION, GIVEN_MASK, NOTES_START, START_SELECTED, CANDIDATE_EMPTIES,
  buildBoard, LEVELS, TIME_CONTROLS, CONTROL_BY_KEY, FAMILIARITY,
  SAME_BOX, START_ELO, fmtClock, makeStats, makeRatings,
});
