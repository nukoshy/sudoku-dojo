import type { Grid, TechniqueKey } from './types';
import { bitCount, solve, gridToString } from './solver';
import { TECHNIQUE_WEIGHT } from './techniques';

// Difficulty scorer: solve the puzzle the way a human would, applying logical
// techniques from easiest to hardest, and record which were required. The raw
// weighted score maps to an initial Elo rating.

const ALL = 0b111111111;

// Pre-built unit groups (rows, cols, boxes) as arrays of cell indices.
const ROWS: number[][] = [];
const COLS: number[][] = [];
const BOXES: number[][] = [];
for (let i = 0; i < 9; i++) {
  ROWS.push([...Array(9)].map((_, c) => i * 9 + c));
  COLS.push([...Array(9)].map((_, r) => r * 9 + i));
}
for (let br = 0; br < 3; br++)
  for (let bc = 0; bc < 3; bc++) {
    const box: number[] = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) box.push((br * 3 + r) * 9 + (bc * 3 + c));
    BOXES.push(box);
  }
const UNITS = [...ROWS, ...COLS, ...BOXES];

function peersOf(cell: number): number[] {
  const set = new Set<number>();
  for (const u of UNITS) if (u.includes(cell)) u.forEach((c) => set.add(c));
  set.delete(cell);
  return [...set];
}
const PEERS: number[][] = [...Array(81)].map((_, i) => peersOf(i));

interface State {
  /** Bitmask candidates per cell; a solved cell has exactly one bit. */
  cand: number[];
  solved: boolean[];
}

function initState(grid: Grid): State {
  const cand = new Array(81).fill(ALL);
  const solved = new Array(81).fill(false);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v !== 0) place(cand, solved, r * 9 + c, v);
    }
  return { cand, solved };
}

function place(cand: number[], solved: boolean[], cell: number, n: number): void {
  cand[cell] = 1 << (n - 1);
  solved[cell] = true;
  for (const p of PEERS[cell]) cand[p] &= ~cand[cell];
}

function digitsOf(mask: number): number[] {
  const out: number[] = [];
  for (let d = 0; d < 9; d++) if (mask & (1 << d)) out.push(d + 1);
  return out;
}

// --- Technique implementations. Each returns true if it changed state. ---

function nakedSingle(s: State): boolean {
  for (let i = 0; i < 81; i++) {
    if (!s.solved[i] && bitCount(s.cand[i]) === 1) {
      place(s.cand, s.solved, i, digitsOf(s.cand[i])[0]);
      return true;
    }
  }
  return false;
}

function hiddenSingle(s: State): boolean {
  for (const u of UNITS) {
    for (let d = 0; d < 9; d++) {
      const bit = 1 << d;
      const places = u.filter((c) => !s.solved[c] && s.cand[c] & bit);
      if (places.length === 1) {
        place(s.cand, s.solved, places[0], d + 1);
        return true;
      }
    }
  }
  return false;
}

function nakedPair(s: State): boolean {
  for (const u of UNITS) {
    const twos = u.filter((c) => !s.solved[c] && bitCount(s.cand[c]) === 2);
    for (let a = 0; a < twos.length; a++)
      for (let b = a + 1; b < twos.length; b++) {
        if (s.cand[twos[a]] === s.cand[twos[b]]) {
          const mask = s.cand[twos[a]];
          let changed = false;
          for (const c of u) {
            if (c !== twos[a] && c !== twos[b] && s.cand[c] & mask) {
              s.cand[c] &= ~mask;
              changed = true;
            }
          }
          if (changed) return true;
        }
      }
  }
  return false;
}

function hiddenPair(s: State): boolean {
  for (const u of UNITS) {
    for (let d1 = 0; d1 < 9; d1++)
      for (let d2 = d1 + 1; d2 < 9; d2++) {
        const m = (1 << d1) | (1 << d2);
        const cells = u.filter((c) => !s.solved[c] && s.cand[c] & m);
        const c1 = u.filter((c) => !s.solved[c] && s.cand[c] & (1 << d1));
        const c2 = u.filter((c) => !s.solved[c] && s.cand[c] & (1 << d2));
        if (cells.length === 2 && c1.length === 2 && c2.length === 2) {
          let changed = false;
          for (const c of cells) {
            if (s.cand[c] !== (s.cand[c] & m)) {
              s.cand[c] &= m;
              changed = true;
            }
          }
          if (changed) return true;
        }
      }
  }
  return false;
}

function pointingPairs(s: State): boolean {
  for (const box of BOXES) {
    for (let d = 0; d < 9; d++) {
      const bit = 1 << d;
      const cells = box.filter((c) => !s.solved[c] && s.cand[c] & bit);
      if (cells.length < 2) continue;
      const rows = new Set(cells.map((c) => Math.floor(c / 9)));
      const cols = new Set(cells.map((c) => c % 9));
      if (rows.size === 1) {
        const row = ROWS[[...rows][0]];
        let changed = false;
        for (const c of row)
          if (!box.includes(c) && s.cand[c] & bit) {
            s.cand[c] &= ~bit;
            changed = true;
          }
        if (changed) return true;
      }
      if (cols.size === 1) {
        const col = COLS[[...cols][0]];
        let changed = false;
        for (const c of col)
          if (!box.includes(c) && s.cand[c] & bit) {
            s.cand[c] &= ~bit;
            changed = true;
          }
        if (changed) return true;
      }
    }
  }
  return false;
}

function boxLineReduction(s: State): boolean {
  for (const line of [...ROWS, ...COLS]) {
    for (let d = 0; d < 9; d++) {
      const bit = 1 << d;
      const cells = line.filter((c) => !s.solved[c] && s.cand[c] & bit);
      if (cells.length < 2) continue;
      const boxes = new Set(
        cells.map((c) => Math.floor(Math.floor(c / 9) / 3) * 3 + Math.floor((c % 9) / 3)),
      );
      if (boxes.size === 1) {
        const box = BOXES[[...boxes][0]];
        let changed = false;
        for (const c of box)
          if (!line.includes(c) && s.cand[c] & bit) {
            s.cand[c] &= ~bit;
            changed = true;
          }
        if (changed) return true;
      }
    }
  }
  return false;
}

function fish(s: State, size: number): boolean {
  // Generalized X-Wing (size 2) / Swordfish (size 3) over rows then cols.
  for (const [lines, perp, axis] of [
    [ROWS, COLS, 'row'],
    [COLS, ROWS, 'col'],
  ] as const) {
    for (let d = 0; d < 9; d++) {
      const bit = 1 << d;
      // Candidate lines where digit appears 2..size times.
      const candLines: { idx: number; positions: number[] }[] = [];
      for (let li = 0; li < 9; li++) {
        const positions = lines[li]
          .filter((c) => !s.solved[c] && s.cand[c] & bit)
          .map((c) => (axis === 'row' ? c % 9 : Math.floor(c / 9)));
        if (positions.length >= 2 && positions.length <= size) {
          candLines.push({ idx: li, positions });
        }
      }
      const combos = choose(candLines, size);
      for (const combo of combos) {
        const colset = new Set<number>();
        combo.forEach((l) => l.positions.forEach((p) => colset.add(p)));
        if (colset.size !== size) continue;
        const lineIdxs = new Set(combo.map((l) => l.idx));
        let changed = false;
        for (const p of colset) {
          for (const c of perp[p]) {
            const lineIdx = axis === 'row' ? Math.floor(c / 9) : c % 9;
            if (lineIdxs.has(lineIdx)) continue;
            if (!s.solved[c] && s.cand[c] & bit) {
              s.cand[c] &= ~bit;
              changed = true;
            }
          }
        }
        if (changed) return true;
      }
    }
  }
  return false;
}

function yWing(s: State): boolean {
  // Pivot with two candidates {a,b}; pincers {a,c} and {b,c} each see pivot;
  // any cell seeing both pincers cannot be c.
  const bivalue = [...Array(81).keys()].filter(
    (i) => !s.solved[i] && bitCount(s.cand[i]) === 2,
  );
  for (const pivot of bivalue) {
    const [a, b] = digitsOf(s.cand[pivot]);
    const seen = PEERS[pivot].filter((c) => !s.solved[c] && bitCount(s.cand[c]) === 2);
    for (const p1 of seen)
      for (const p2 of seen) {
        if (p1 === p2) continue;
        const d1 = digitsOf(s.cand[p1]);
        const d2 = digitsOf(s.cand[p2]);
        // p1 must hold a + c; p2 must hold b + c.
        if (!d1.includes(a) || d1.includes(b)) continue;
        if (!d2.includes(b) || d2.includes(a)) continue;
        const c1 = d1.find((x) => x !== a);
        const c2 = d2.find((x) => x !== b);
        if (c1 === undefined || c1 !== c2) continue;
        const bit = 1 << (c1 - 1);
        const common = PEERS[p1].filter((c) => PEERS[p2].includes(c) && c !== pivot);
        let changed = false;
        for (const c of common)
          if (!s.solved[c] && s.cand[c] & bit) {
            s.cand[c] &= ~bit;
            changed = true;
          }
        if (changed) return true;
      }
  }
  return false;
}

function choose<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [head, ...rest] = arr;
  return [...choose(rest, k - 1).map((c) => [head, ...c]), ...choose(rest, k)];
}

const STEPS: { key: TechniqueKey; fn: (s: State) => boolean }[] = [
  { key: 'naked_single', fn: nakedSingle },
  { key: 'hidden_single', fn: hiddenSingle },
  { key: 'naked_pair', fn: nakedPair },
  { key: 'hidden_pair', fn: hiddenPair },
  { key: 'pointing_pairs', fn: pointingPairs },
  { key: 'box_line_reduction', fn: boxLineReduction },
  { key: 'x_wing', fn: (s) => fish(s, 2) },
  { key: 'y_wing', fn: yWing },
  { key: 'swordfish', fn: (s) => fish(s, 3) },
];

function isComplete(s: State): boolean {
  return s.solved.every(Boolean);
}

export interface DifficultyResult {
  rating: number;
  rawScore: number;
  techniques: TechniqueKey[];
}

/**
 * Score a puzzle by logically solving it and tallying techniques used.
 * raw_score = sum over each technique application of its weight.
 * rating = clamp(800 + raw_score * 8, 800, 2200).
 */
export function scoreDifficulty(grid: Grid): DifficultyResult {
  const s = initState(grid);
  let rawScore = 0;
  const used = new Set<TechniqueKey>();

  // Apply techniques in order; always restart from the easiest after progress.
  outer: while (!isComplete(s)) {
    for (const step of STEPS) {
      if (step.fn(s)) {
        rawScore += TECHNIQUE_WEIGHT[step.key];
        used.add(step.key);
        continue outer;
      }
    }
    // No logical step worked. If the puzzle is still solvable, it needs guessing.
    used.add('backtrack');
    rawScore += TECHNIQUE_WEIGHT.backtrack;
    const full = solve(grid);
    if (full) {
      // Accept the full solution and stop scoring further.
      const str = gridToString(full);
      for (let i = 0; i < 81; i++) {
        if (!s.solved[i]) place(s.cand, s.solved, i, Number(str[i]));
      }
    }
    break;
  }

  const rating = Math.max(800, Math.min(2200, Math.round(800 + rawScore * 8)));
  // Order techniques by their canonical difficulty for display.
  const ordered = STEPS.map((st) => st.key).filter((k) => used.has(k));
  if (used.has('backtrack')) ordered.push('backtrack');
  return { rating, rawScore, techniques: ordered };
}
