import type { Grid } from './types';

// Solver: constraint propagation first, then backtracking for the remainder.
//
// Internally we work on a candidate model: an array of 81 bitmasks. Bit (n-1)
// set means digit n is still possible in that cell. A solved cell has exactly
// one bit set.

const ALL = 0b111111111; // bits for digits 1..9

/** Peers: for each cell, the set of 20 cells sharing its row, col, or box. */
const PEERS: number[][] = buildPeers();
/** Units: 27 groups (9 rows, 9 cols, 9 boxes), each an array of 9 cell indices. */
const UNITS: number[][] = buildUnits();
/** For each cell, the 3 units (row, col, box) it belongs to. */
const UNITS_OF: number[][][] = buildUnitsOf();

function buildUnits(): number[][] {
  const units: number[][] = [];
  for (let r = 0; r < 9; r++) units.push(range9().map((c) => r * 9 + c));
  for (let c = 0; c < 9; c++) units.push(range9().map((r) => r * 9 + c));
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const box: number[] = [];
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) box.push((br * 3 + r) * 9 + (bc * 3 + c));
      units.push(box);
    }
  }
  return units;
}

function buildUnitsOf(): number[][][] {
  const units = buildUnits();
  const out: number[][][] = [];
  for (let i = 0; i < 81; i++) {
    out.push(units.filter((u) => u.includes(i)));
  }
  return out;
}

function buildPeers(): number[][] {
  const units = buildUnits();
  const out: number[][] = [];
  for (let i = 0; i < 81; i++) {
    const set = new Set<number>();
    for (const u of units) if (u.includes(i)) u.forEach((j) => set.add(j));
    set.delete(i);
    out.push([...set]);
  }
  return out;
}

function range9(): number[] {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8];
}

function bitCount(x: number): number {
  let n = 0;
  while (x) {
    x &= x - 1;
    n++;
  }
  return n;
}

function singleDigit(mask: number): number {
  // Assumes exactly one bit set.
  return Math.log2(mask) + 1;
}

export function gridToString(grid: Grid): string {
  let s = '';
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) s += String(grid[r][c]);
  return s;
}

export function stringToGrid(s: string): Grid {
  const g: Grid = [];
  for (let r = 0; r < 9; r++) {
    const row: number[] = [];
    for (let c = 0; c < 9; c++) row.push(Number(s[r * 9 + c]));
    g.push(row);
  }
  return g;
}

function gridToCandidates(grid: Grid): number[] | null {
  const cand = new Array(81).fill(ALL);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v !== 0) {
        if (!assign(cand, r * 9 + c, 1 << (v - 1))) return null;
      }
    }
  }
  return cand;
}

/** Assign a single-bit mask to a cell, propagating constraints. */
function assign(cand: number[], cell: number, mask: number): boolean {
  const others = cand[cell] & ~mask;
  // Eliminate every other candidate from this cell one by one.
  for (let d = 0; d < 9; d++) {
    const bit = 1 << d;
    if (others & bit) {
      if (!eliminate(cand, cell, bit)) return false;
    }
  }
  return true;
}

/** Eliminate one candidate bit from a cell, propagating consequences. */
function eliminate(cand: number[], cell: number, bit: number): boolean {
  if (!(cand[cell] & bit)) return true; // already gone
  cand[cell] &= ~bit;
  const remaining = cand[cell];
  if (remaining === 0) return false; // contradiction
  // (1) If a cell is reduced to one value, remove it from peers.
  if (bitCount(remaining) === 1) {
    for (const p of PEERS[cell]) {
      if (!eliminate(cand, p, remaining)) return false;
    }
  }
  // (2) If a unit has only one place for the eliminated digit, assign it there.
  for (const u of UNITS_OF[cell]) {
    const places = u.filter((c) => cand[c] & bit);
    if (places.length === 0) return false;
    if (places.length === 1) {
      if (!assign(cand, places[0], bit)) return false;
    }
  }
  return true;
}

function candidatesToGrid(cand: number[]): Grid {
  const g: Grid = [];
  for (let r = 0; r < 9; r++) {
    const row: number[] = [];
    for (let c = 0; c < 9; c++) {
      const m = cand[r * 9 + c];
      row.push(bitCount(m) === 1 ? singleDigit(m) : 0);
    }
    g.push(row);
  }
  return g;
}

function search(cand: number[]): number[] | null {
  // Pick the unsolved cell with the fewest candidates (MRV heuristic).
  let best = -1;
  let bestCount = 10;
  for (let i = 0; i < 81; i++) {
    const n = bitCount(cand[i]);
    if (n > 1 && n < bestCount) {
      bestCount = n;
      best = i;
    }
  }
  if (best === -1) return cand; // solved

  for (let d = 0; d < 9; d++) {
    const bit = 1 << d;
    if (cand[best] & bit) {
      const copy = cand.slice();
      if (assign(copy, best, bit)) {
        const result = search(copy);
        if (result) return result;
      }
    }
  }
  return null;
}

/** Solve a grid. Returns the solved grid, or null if unsolvable. */
export function solve(grid: Grid): Grid | null {
  const cand = gridToCandidates(grid);
  if (!cand) return null;
  const result = search(cand);
  return result ? candidatesToGrid(result) : null;
}

/**
 * Count solutions up to `limit`. Used to verify uniqueness during generation.
 * Returns 0, 1, or `limit` (capped).
 */
export function countSolutions(grid: Grid, limit = 2): number {
  const cand = gridToCandidates(grid);
  if (!cand) return 0;
  let count = 0;
  const walk = (c: number[]): void => {
    if (count >= limit) return;
    let best = -1;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
      const n = bitCount(c[i]);
      if (n > 1 && n < bestCount) {
        bestCount = n;
        best = i;
      }
    }
    if (best === -1) {
      count++;
      return;
    }
    for (let d = 0; d < 9; d++) {
      if (count >= limit) return;
      const bit = 1 << d;
      if (c[best] & bit) {
        const copy = c.slice();
        if (assign(copy, best, bit)) walk(copy);
      }
    }
  };
  walk(cand);
  return count;
}

export function hasUniqueSolution(grid: Grid): boolean {
  return countSolutions(grid, 2) === 1;
}

export { UNITS, PEERS, UNITS_OF, bitCount, ALL };
