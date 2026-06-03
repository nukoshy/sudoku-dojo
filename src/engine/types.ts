// Shared engine types for Sudoku Dojo.

/** A 9x9 grid. 0 represents a blank cell. */
export type Grid = number[][];

export type TechniqueKey =
  | 'naked_single'
  | 'hidden_single'
  | 'naked_pair'
  | 'hidden_pair'
  | 'pointing_pairs'
  | 'box_line_reduction'
  | 'x_wing'
  | 'swordfish'
  | 'y_wing'
  | 'backtrack';

export interface DifficultyTarget {
  minBlanks: number;
  maxBlanks: number;
}

export interface Puzzle {
  /** 81-char string of givens, '0' for blanks. */
  givens: string;
  /** 81-char solution string. */
  solution: string;
  /** Computed Elo rating for the puzzle. */
  rating: number;
  rd: number;
  sigma: number;
  /** Techniques required to solve, in order of first use. */
  techniques: TechniqueKey[];
  /** Raw weighted difficulty score (pre-Elo mapping). */
  rawScore: number;
}

/** Glicko-2 rated entity. */
export interface Rated {
  rating: number;
  rd: number;
  sigma: number;
}

export type Outcome = 1.0 | 0.0;
