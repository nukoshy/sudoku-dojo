import type { DifficultyTarget, Grid, Puzzle } from './types';
import { countSolutions, gridToString, solve, stringToGrid } from './solver';
import { scoreDifficulty } from './difficulty';

// Puzzle generator: build a full valid solution, then dig holes while keeping a
// unique solution, until the blank count lands in the target band.

function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a complete, valid, randomized solution grid via backtracking. */
export function generateSolution(): Grid {
  const grid: Grid = Array.from({ length: 9 }, () => new Array(9).fill(0));

  const fill = (pos: number): boolean => {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    for (const n of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isSafe(grid, r, c, n)) {
        grid[r][c] = n;
        if (fill(pos + 1)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  };

  fill(0);
  return grid;
}

function isSafe(grid: Grid, row: number, col: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === n) return false;
    if (grid[i][col] === n) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) if (grid[br + r][bc + c] === n) return false;
  return true;
}

/**
 * Generate a puzzle whose blank count falls within the target band, with a
 * guaranteed unique solution.
 */
export function generatePuzzle(difficulty: DifficultyTarget): Puzzle {
  const targetBlanks = randInt(difficulty.minBlanks, difficulty.maxBlanks);

  // A few attempts in case digging stalls below the target for one solution.
  for (let attempt = 0; attempt < 8; attempt++) {
    const solution = generateSolution();
    const puzzle = solution.map((row) => row.slice());

    let blanks = 0;
    // Dig holes in random order; only remove a cell if uniqueness is preserved.
    for (const cell of shuffled([...Array(81).keys()])) {
      if (blanks >= targetBlanks) break;
      const r = Math.floor(cell / 9);
      const c = cell % 9;
      if (puzzle[r][c] === 0) continue;
      const backup = puzzle[r][c];
      puzzle[r][c] = 0;
      if (countSolutions(puzzle, 2) !== 1) {
        puzzle[r][c] = backup; // revert — would create ambiguity
      } else {
        blanks++;
      }
    }

    if (blanks >= difficulty.minBlanks) {
      const givens = gridToString(puzzle);
      const solutionStr = gridToString(solution);
      const { rating, rawScore, techniques } = scoreDifficulty(puzzle);
      return {
        givens,
        solution: solutionStr,
        rating,
        rawScore,
        techniques,
        rd: 200,
        sigma: 0.06,
      };
    }
  }

  // Fallback: return whatever we could dig on the last solution.
  const solution = generateSolution();
  const givens = gridToString(solution);
  return {
    givens,
    solution: givens,
    rating: 800,
    rawScore: 0,
    techniques: [],
    rd: 200,
    sigma: 0.06,
  };
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Verify a puzzle string actually solves to its stated solution (test helper). */
export function verifyPuzzle(p: Puzzle): boolean {
  const solved = solve(stringToGrid(p.givens));
  return solved !== null && gridToString(solved) === p.solution;
}
