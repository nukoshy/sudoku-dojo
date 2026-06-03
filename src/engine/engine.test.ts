import { describe, it, expect } from 'vitest';
import { solve, countSolutions, hasUniqueSolution, stringToGrid, gridToString } from './solver';
import { generatePuzzle, generateSolution, verifyPuzzle } from './generator';
import { scoreDifficulty } from './difficulty';
import { updateGlicko, newRated } from './rating';

const EASY =
  '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
const EASY_SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

function isValidSolution(s: string): boolean {
  const g = stringToGrid(s);
  for (let i = 0; i < 9; i++) {
    const row = new Set<number>();
    const col = new Set<number>();
    for (let j = 0; j < 9; j++) {
      row.add(g[i][j]);
      col.add(g[j][i]);
    }
    if (row.size !== 9 || col.size !== 9) return false;
  }
  for (let br = 0; br < 3; br++)
    for (let bc = 0; bc < 3; bc++) {
      const box = new Set<number>();
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) box.add(g[br * 3 + r][bc * 3 + c]);
      if (box.size !== 9) return false;
    }
  return !s.includes('0');
}

describe('solver', () => {
  it('solves a known puzzle correctly', () => {
    const solved = solve(stringToGrid(EASY));
    expect(solved).not.toBeNull();
    expect(gridToString(solved!)).toBe(EASY_SOLUTION);
  });

  it('reports a unique solution for a proper puzzle', () => {
    expect(hasUniqueSolution(stringToGrid(EASY))).toBe(true);
    expect(countSolutions(stringToGrid(EASY), 2)).toBe(1);
  });

  it('reports multiple solutions for an empty grid', () => {
    const empty = stringToGrid('0'.repeat(81));
    expect(countSolutions(empty, 2)).toBe(2);
  });
});

describe('generator', () => {
  it('produces a complete valid solution grid', () => {
    const s = gridToString(generateSolution());
    expect(isValidSolution(s)).toBe(true);
  });

  it('generates puzzles with a unique solution in the target blank band', () => {
    for (let i = 0; i < 5; i++) {
      const p = generatePuzzle({ minBlanks: 35, maxBlanks: 40 });
      const blanks = p.givens.split('').filter((ch) => ch === '0').length;
      expect(blanks).toBeGreaterThanOrEqual(35);
      expect(hasUniqueSolution(stringToGrid(p.givens))).toBe(true);
      expect(verifyPuzzle(p)).toBe(true);
      expect(isValidSolution(p.solution)).toBe(true);
    }
  });
});

describe('difficulty', () => {
  it('scores a puzzle and yields an Elo in range', () => {
    const r = scoreDifficulty(stringToGrid(EASY));
    expect(r.rating).toBeGreaterThanOrEqual(800);
    expect(r.rating).toBeLessThanOrEqual(2200);
    expect(r.techniques.length).toBeGreaterThan(0);
  });
});

describe('rating (Glicko-2)', () => {
  it('raises rating on a win and lowers RD', () => {
    const player = newRated(1200);
    const puzzle = newRated(1400);
    const after = updateGlicko(player, puzzle, 1.0);
    expect(after.rating).toBeGreaterThan(player.rating);
    expect(after.rd).toBeLessThan(player.rd);
  });

  it('lowers rating on a loss', () => {
    const player = newRated(1500);
    const puzzle = newRated(1200);
    const after = updateGlicko(player, puzzle, 0.0);
    expect(after.rating).toBeLessThan(player.rating);
  });
});
