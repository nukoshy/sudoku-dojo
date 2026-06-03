import type { TechniqueKey } from './types';

// Static technique metadata used by the scorer, the Techniques screen, and the
// fail-loop teaching prompts.

export interface TechniqueInfo {
  key: TechniqueKey;
  name: string;
  jp: string;
  weight: number;
  description: string;
}

export const TECHNIQUES: TechniqueInfo[] = [
  {
    key: 'naked_single',
    name: 'Naked Single',
    jp: '裸単',
    weight: 1,
    description: 'A cell with only one possible candidate left. Fill it in.',
  },
  {
    key: 'hidden_single',
    name: 'Hidden Single',
    jp: '隠単',
    weight: 2,
    description: 'A digit that can only go in one cell within a row, column, or box.',
  },
  {
    key: 'naked_pair',
    name: 'Naked Pair',
    jp: '裸対',
    weight: 4,
    description: 'Two cells in a unit sharing the same two candidates — remove those digits elsewhere in the unit.',
  },
  {
    key: 'hidden_pair',
    name: 'Hidden Pair',
    jp: '隠対',
    weight: 6,
    description: 'Two digits confined to the same two cells in a unit — clear other candidates from those cells.',
  },
  {
    key: 'pointing_pairs',
    name: 'Pointing Pairs',
    jp: '指向',
    weight: 5,
    description: 'A digit in a box confined to one row or column — eliminate it from the rest of that line.',
  },
  {
    key: 'box_line_reduction',
    name: 'Box-Line Reduction',
    jp: '線箱',
    weight: 5,
    description: 'A digit in a line confined to one box — eliminate it from the rest of that box.',
  },
  {
    key: 'x_wing',
    name: 'X-Wing',
    jp: '十字',
    weight: 10,
    description: 'A digit forming a rectangle across two rows and two columns — eliminate it from those columns.',
  },
  {
    key: 'y_wing',
    name: 'Y-Wing',
    jp: 'Y翼',
    weight: 12,
    description: 'A pivot cell and two pincers forming a chain that eliminates a shared candidate.',
  },
  {
    key: 'swordfish',
    name: 'Swordfish',
    jp: '剣魚',
    weight: 15,
    description: 'A three-row, three-column extension of the X-Wing pattern.',
  },
  {
    key: 'backtrack',
    name: 'Trial & Error',
    jp: '試行',
    weight: 25,
    description: 'No logical technique applies — the puzzle requires guessing and backtracking.',
  },
];

export const TECHNIQUE_BY_KEY: Record<TechniqueKey, TechniqueInfo> = Object.fromEntries(
  TECHNIQUES.map((t) => [t.key, t]),
) as Record<TechniqueKey, TechniqueInfo>;

export const TECHNIQUE_WEIGHT: Record<TechniqueKey, number> = Object.fromEntries(
  TECHNIQUES.map((t) => [t.key, t.weight]),
) as Record<TechniqueKey, number>;
