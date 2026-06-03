import { create } from 'zustand';
import { generatePuzzle } from '@/engine/generator';
import { stringToGrid } from '@/engine/solver';
import type { Puzzle } from '@/engine/types';
import {
  HINTS_PER_PUZZLE,
  MAX_MISTAKES,
  TIME_CONTROL_BY_KEY,
  ZEN_LEVEL_BY_KEY,
  type TimeControl,
  type ZenDifficulty,
} from '@/lib/constants';
import { audio } from '@/audio/engine';

type CellValue = number | null;

interface UndoEntry {
  row: number;
  col: number;
  prevValue: CellValue;
  prevNotes: number[];
}

export type GameStatus = 'idle' | 'playing' | 'complete' | 'failed';

interface GameStore {
  puzzle: Puzzle | null;
  solution: number[][];
  givens: boolean[][];
  userGrid: CellValue[][];
  candidates: Set<number>[][];
  mode: 'rated' | 'zen';
  timeControl: TimeControl | null;
  zenDifficulty: ZenDifficulty | null;
  timeRemaining: number | null;
  elapsed: number;
  mistakes: number;
  hintsUsed: number;
  hintsRemaining: number;
  selectedCell: [number, number] | null;
  notesMode: boolean;
  isPaused: boolean;
  status: GameStatus;
  /** Increments to re-trigger the wrong-cell pulse animation. */
  wrongPulse: number;
  wrongCell: [number, number] | null;

  startGame: (
    mode: 'rated' | 'zen',
    selection: { control?: TimeControl; level?: ZenDifficulty },
  ) => void;
  selectCell: (row: number, col: number) => void;
  moveSelection: (dr: number, dc: number) => void;
  placeNumber: (n: number) => void;
  eraseCell: () => void;
  toggleNote: (n: number) => void;
  toggleNotesMode: () => void;
  useHint: () => void;
  undo: () => void;
  pause: () => void;
  resume: () => void;
  tick: () => void;
}

function emptyGrid<T>(fill: () => T): T[][] {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, fill));
}

const undoStack: UndoEntry[] = [];

export const useGame = create<GameStore>((set, get) => ({
  puzzle: null,
  solution: [],
  givens: emptyGrid(() => false),
  userGrid: emptyGrid<CellValue>(() => null),
  candidates: emptyGrid(() => new Set<number>()),
  mode: 'rated',
  timeControl: null,
  zenDifficulty: null,
  timeRemaining: null,
  elapsed: 0,
  mistakes: 0,
  hintsUsed: 0,
  hintsRemaining: HINTS_PER_PUZZLE,
  selectedCell: null,
  notesMode: false,
  isPaused: false,
  status: 'idle',
  wrongPulse: 0,
  wrongCell: null,

  startGame: (mode, selection) => {
    const band =
      mode === 'rated'
        ? TIME_CONTROL_BY_KEY[selection.control!].band
        : ZEN_LEVEL_BY_KEY[selection.level!].band;
    const puzzle = generatePuzzle(band);
    const solution = stringToGrid(puzzle.solution);
    const givensGrid = stringToGrid(puzzle.givens);
    const givens = givensGrid.map((row) => row.map((v) => v !== 0));
    const userGrid: CellValue[][] = givensGrid.map((row) =>
      row.map((v) => (v !== 0 ? v : null)),
    );
    undoStack.length = 0;

    set({
      puzzle,
      solution,
      givens,
      userGrid,
      candidates: emptyGrid(() => new Set<number>()),
      mode,
      timeControl: mode === 'rated' ? selection.control! : null,
      zenDifficulty: mode === 'zen' ? selection.level! : null,
      timeRemaining: mode === 'rated' ? TIME_CONTROL_BY_KEY[selection.control!].seconds : null,
      elapsed: 0,
      mistakes: 0,
      hintsUsed: 0,
      hintsRemaining: HINTS_PER_PUZZLE,
      selectedCell: null,
      notesMode: false,
      isPaused: false,
      status: 'playing',
      wrongPulse: 0,
      wrongCell: null,
    });
  },

  selectCell: (row, col) => {
    if (get().status !== 'playing') return;
    set({ selectedCell: [row, col] });
  },

  moveSelection: (dr, dc) => {
    const { selectedCell, status } = get();
    if (status !== 'playing') return;
    const [r, c] = selectedCell ?? [0, 0];
    set({
      selectedCell: [Math.max(0, Math.min(8, r + dr)), Math.max(0, Math.min(8, c + dc))],
    });
  },

  placeNumber: (n) => {
    const s = get();
    if (s.status !== 'playing' || s.isPaused || !s.selectedCell) return;
    const [r, c] = s.selectedCell;
    if (s.givens[r][c]) return;
    if (s.notesMode) {
      get().toggleNote(n);
      return;
    }

    undoStack.push({
      row: r,
      col: c,
      prevValue: s.userGrid[r][c],
      prevNotes: [...s.candidates[r][c]],
    });

    const userGrid = s.userGrid.map((row) => row.slice());
    userGrid[r][c] = n;
    const candidates = s.candidates.map((row) => row.map((set2) => new Set(set2)));
    candidates[r][c].clear();

    const correct = s.solution[r][c] === n;
    if (!correct) {
      const mistakes = s.mistakes + 1;
      audio.play('error');
      set({
        userGrid,
        candidates,
        mistakes,
        wrongPulse: s.wrongPulse + 1,
        wrongCell: [r, c],
      });
      if (mistakes >= MAX_MISTAKES && s.mode === 'rated') {
        set({ status: 'failed' });
      }
      return;
    }

    audio.play('place');
    // Clear this digit from peers' notes for convenience.
    for (let i = 0; i < 9; i++) {
      candidates[r][i].delete(n);
      candidates[i][c].delete(n);
    }
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let dr = 0; dr < 3; dr++)
      for (let dc = 0; dc < 3; dc++) candidates[br + dr][bc + dc].delete(n);

    set({ userGrid, candidates, wrongCell: null });

    // Completion check.
    const solved = userGrid.every((row, ri) => row.every((v, ci) => v === s.solution[ri][ci]));
    if (solved) {
      audio.play('complete');
      set({ status: 'complete' });
    }
  },

  eraseCell: () => {
    const s = get();
    if (s.status !== 'playing' || !s.selectedCell) return;
    const [r, c] = s.selectedCell;
    if (s.givens[r][c]) return;
    if (s.userGrid[r][c] === null && s.candidates[r][c].size === 0) return;

    undoStack.push({
      row: r,
      col: c,
      prevValue: s.userGrid[r][c],
      prevNotes: [...s.candidates[r][c]],
    });
    const userGrid = s.userGrid.map((row) => row.slice());
    userGrid[r][c] = null;
    const candidates = s.candidates.map((row) => row.map((set2) => new Set(set2)));
    candidates[r][c].clear();
    audio.play('erase');
    set({ userGrid, candidates, wrongCell: null });
  },

  toggleNote: (n) => {
    const s = get();
    if (s.status !== 'playing' || !s.selectedCell) return;
    const [r, c] = s.selectedCell;
    if (s.givens[r][c] || s.userGrid[r][c] !== null) return;

    undoStack.push({
      row: r,
      col: c,
      prevValue: s.userGrid[r][c],
      prevNotes: [...s.candidates[r][c]],
    });
    const candidates = s.candidates.map((row) => row.map((set2) => new Set(set2)));
    if (candidates[r][c].has(n)) candidates[r][c].delete(n);
    else candidates[r][c].add(n);
    audio.play('note');
    set({ candidates });
  },

  toggleNotesMode: () => {
    audio.play('click');
    set({ notesMode: !get().notesMode });
  },

  useHint: () => {
    const s = get();
    if (s.status !== 'playing' || s.hintsRemaining <= 0) return;
    // Use the selected empty cell, else the first empty cell.
    let target = s.selectedCell;
    if (!target || s.userGrid[target[0]][target[1]] !== null || s.givens[target[0]][target[1]]) {
      target = null;
      outer: for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
          if (s.userGrid[r][c] === null) {
            target = [r, c];
            break outer;
          }
    }
    if (!target) return;
    const [r, c] = target;
    undoStack.push({
      row: r,
      col: c,
      prevValue: s.userGrid[r][c],
      prevNotes: [...s.candidates[r][c]],
    });
    const userGrid = s.userGrid.map((row) => row.slice());
    userGrid[r][c] = s.solution[r][c];
    const candidates = s.candidates.map((row) => row.map((set2) => new Set(set2)));
    candidates[r][c].clear();
    audio.play('hint');
    set({
      userGrid,
      candidates,
      hintsUsed: s.hintsUsed + 1,
      hintsRemaining: s.hintsRemaining - 1,
      selectedCell: [r, c],
    });
    const solved = userGrid.every((row, ri) => row.every((v, ci) => v === s.solution[ri][ci]));
    if (solved) {
      audio.play('complete');
      set({ status: 'complete' });
    }
  },

  undo: () => {
    const s = get();
    if (s.status !== 'playing') return;
    const entry = undoStack.pop();
    if (!entry) return;
    const userGrid = s.userGrid.map((row) => row.slice());
    const candidates = s.candidates.map((row) => row.map((set2) => new Set(set2)));
    userGrid[entry.row][entry.col] = entry.prevValue;
    candidates[entry.row][entry.col] = new Set(entry.prevNotes);
    audio.play('click');
    set({ userGrid, candidates, selectedCell: [entry.row, entry.col], wrongCell: null });
  },

  pause: () => {
    if (get().status === 'playing') set({ isPaused: true });
  },
  resume: () => set({ isPaused: false }),

  tick: () => {
    const s = get();
    if (s.status !== 'playing' || s.isPaused) return;
    if (s.mode === 'zen') {
      set({ elapsed: s.elapsed + 1 });
      return;
    }
    const remaining = (s.timeRemaining ?? 0) - 1;
    if (remaining <= 0) {
      set({ timeRemaining: 0, elapsed: s.elapsed + 1, status: 'failed' });
    } else {
      set({ timeRemaining: remaining, elapsed: s.elapsed + 1 });
    }
  },
}));
