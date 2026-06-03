// Shared data for all six screens: the puzzle, highlight logic, rank cards.
// Exported to window so each variant file (own Babel scope) can read it.

// Classic puzzle used as the "givens" layer.
const SUDOKU = [
  [5,3,0, 0,7,0, 0,0,0],
  [6,0,0, 1,9,5, 0,0,0],
  [0,9,8, 0,0,0, 0,6,0],
  [8,0,0, 0,6,0, 0,0,3],
  [4,0,0, 8,0,3, 0,0,1],
  [7,0,0, 0,2,0, 0,0,6],
  [0,6,0, 0,0,0, 2,8,0],
  [0,0,0, 4,1,9, 0,0,5],
  [0,0,0, 0,8,0, 0,7,9],
];

// Cells the player has filled in (originally empty) — rendered distinctly.
const USER_FILLED = { '0-2': 4, '2-0': 1, '3-1': 2, '6-2': 5, '8-0': 3 };

// Pencil-mark candidates in a few empty cells.
const NOTES = {
  '3-3': [1, 4, 9],
  '5-3': [1, 5, 9],
  '4-1': [2, 9],
  '4-2': [2, 6, 9],
  '3-7': [4, 5, 7],
};

// Currently selected (empty) cell — center of the board.
const SELECTED = { r: 4, c: 4 };

function cellMeta(r, c) {
  const key = r + '-' + c;
  let val = SUDOKU[r][c];
  let type = val ? 'given' : 'empty';
  if (!val && USER_FILLED[key] != null) { val = USER_FILLED[key]; type = 'user'; }
  const notes = (!val && NOTES[key]) ? NOTES[key] : null;
  const sel = SELECTED.r === r && SELECTED.c === c;
  const sameBox =
    Math.floor(SELECTED.r / 3) === Math.floor(r / 3) &&
    Math.floor(SELECTED.c / 3) === Math.floor(c / 3);
  const peer = !sel && (SELECTED.r === r || SELECTED.c === c || sameBox);
  // thick box separators
  const boxR = c === 2 || c === 5;
  const boxB = r === 2 || r === 5;
  return { r, c, val, type, notes, sel, peer, boxR, boxB };
}

const BOARD = [];
for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) BOARD.push(cellMeta(r, c));

const RANKS = [
  { kanji: '白帯', romaji: 'Shiro-obi', en: 'White Belt', level: 'Beginner',
    desc: 'New to the grid. Learn the forms.', elo: '800', belt: 'shiro' },
  { kanji: '緑帯', romaji: 'Midori-obi', en: 'Green Belt', level: 'Intermediate',
    desc: 'You know the basics. Ready to spar.', elo: '1200', belt: 'midori' },
  { kanji: '黒帯', romaji: 'Kuro-obi', en: 'Black Belt', level: 'Advanced',
    desc: 'Fluent in technique. Seeking the hard ones.', elo: '1600', belt: 'kuro', selected: true },
  { kanji: '師匠', romaji: 'Shishou', en: 'Master', level: 'Master',
    desc: 'X-Wings and beyond. Prove it.', elo: '2000', belt: 'shishou' },
];

Object.assign(window, { SUDOKU, USER_FILLED, NOTES, SELECTED, cellMeta, BOARD, RANKS });
