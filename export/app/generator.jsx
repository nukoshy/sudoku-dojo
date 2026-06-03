// Sudoku Dojo — real puzzle generator with unique-solution guarantee.
// Runs entirely in-browser, no dependencies. Two exports:
//   generatePuzzle(emptyCount) → { givens: number[], solution: number[] }
//   buildBoardFromPuzzle(givens, solution) → cell[] for Game

(function () {
  // For every cell i (0-80), PEERS[i] is the array of indices sharing a row,
  // column, or 3×3 box with i (i itself excluded).
  const PEERS = (() => {
    const p = [];
    for (let i = 0; i < 81; i++) {
      const r = (i / 9) | 0, c = i % 9;
      const br = ((r / 3) | 0) * 3, bc = ((c / 3) | 0) * 3;
      const s = new Set();
      for (let k = 0; k < 9; k++) { s.add(r * 9 + k); s.add(k * 9 + c); }
      for (let dr = 0; dr < 3; dr++)
        for (let dc = 0; dc < 3; dc++)
          s.add((br + dr) * 9 + (bc + dc));
      s.delete(i);
      p.push(Array.from(s));
    }
    return p;
  })();

  // Return the set of numbers already placed among `peers` of cell i.
  function usedAt(grid, i) {
    const s = new Set();
    for (const j of PEERS[i]) if (grid[j]) s.add(grid[j]);
    return s;
  }

  // Count how many distinct solutions the grid has, stopping at `limit`.
  // Returns 0 (invalid), 1 (unique), or limit (ambiguous/more than one).
  function countSolutions(grid, limit) {
    let found = 0;
    const g = Uint8Array.from(grid);

    function bt() {
      if (found >= limit) return;
      // Minimum Remaining Values: pick the empty cell with fewest candidates.
      let best = -1, bestRem = 10;
      for (let i = 0; i < 81; i++) {
        if (g[i]) continue;
        const rem = 9 - usedAt(g, i).size;
        if (rem === 0) return; // dead-end
        if (rem < bestRem) { bestRem = rem; best = i; }
      }
      if (best === -1) { found++; return; } // all cells filled → solution found

      const used = usedAt(g, best);
      for (let n = 1; n <= 9; n++) {
        if (!used.has(n)) { g[best] = n; bt(); g[best] = 0; }
      }
    }

    bt();
    return found;
  }

  // Generate a completely filled, valid 9×9 grid using randomised backtracking.
  function generateFilled() {
    const g = new Uint8Array(81);

    function bt(i) {
      if (i === 81) return true;
      const used = usedAt(g, i);
      const candidates = [];
      for (let n = 1; n <= 9; n++) if (!used.has(n)) candidates.push(n);
      // Fisher-Yates shuffle for variety.
      for (let k = candidates.length - 1; k > 0; k--) {
        const j = (Math.random() * (k + 1)) | 0;
        [candidates[k], candidates[j]] = [candidates[j], candidates[k]];
      }
      for (const n of candidates) {
        g[i] = n;
        if (bt(i + 1)) return true;
      }
      g[i] = 0;
      return false;
    }

    bt(0);
    return g;
  }

  // Dig `target` holes into a filled grid while maintaining a unique solution.
  // Attempts positions in random order; if removing a cell creates ambiguity the
  // cell is kept. Returns { givens, solution } where givens has 0 for empty cells.
  function generatePuzzle(target) {
    const filled = generateFilled();
    const solution = Array.from(filled);
    const puzzle = Uint8Array.from(filled);

    // Visit positions in a random order.
    const positions = Array.from({ length: 81 }, (_, i) => i);
    for (let i = positions.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    let removed = 0;
    for (const pos of positions) {
      if (removed >= target) break;
      const backup = puzzle[pos];
      puzzle[pos] = 0;
      // Keep the cell removed only if the puzzle still has a unique solution.
      if (countSolutions(puzzle, 2) === 1) {
        removed++;
      } else {
        puzzle[pos] = backup;
      }
    }

    return { givens: Array.from(puzzle), solution };
  }

  // Build the 81-cell object array that Game renders.
  function buildBoardFromPuzzle(givens) {
    return givens.map((val, i) => {
      const r = (i / 9) | 0, c = i % 9;
      return {
        r, c,
        key: r + '-' + c,
        given: val !== 0,
        value: val,
        notes: [],
        wrong: false,
      };
    });
  }

  Object.assign(window, { generatePuzzle, buildBoardFromPuzzle });
})();
