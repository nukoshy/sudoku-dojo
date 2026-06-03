import { Cell } from './Cell';
import { useGame } from '@/stores/game';
import { useSettings } from '@/stores/settings';

export function Grid() {
  const { userGrid, givens, candidates, selectedCell, wrongCell, wrongPulse, selectCell } =
    useGame();
  const reducedMotion = useSettings((s) => s.reducedMotion);

  const sel = selectedCell;
  const selValue = sel ? userGrid[sel[0]][sel[1]] : null;

  const isRelated = (r: number, c: number): boolean => {
    if (!sel) return false;
    const [sr, sc] = sel;
    if (sr === r && sc === c) return false;
    const sameBox = Math.floor(sr / 3) === Math.floor(r / 3) && Math.floor(sc / 3) === Math.floor(c / 3);
    return sr === r || sc === c || sameBox;
  };

  return (
    <div
      className="grid grid-cols-9 grid-rows-9 w-full max-w-[min(92vw,520px)] aspect-square bg-paper border-2 border-ink shadow-pixel-lg mx-auto pixelated"
      role="grid"
      aria-label="Sudoku board"
    >
      {userGrid.map((rowArr, r) =>
        rowArr.map((value, c) => (
          <Cell
            key={`${r}-${c}`}
            value={value}
            given={givens[r][c]}
            selected={!!sel && sel[0] === r && sel[1] === c}
            related={isRelated(r, c)}
            sameValue={!!selValue && value === selValue}
            wrong={!!wrongCell && wrongCell[0] === r && wrongCell[1] === c}
            wrongKey={wrongPulse}
            notes={candidates[r][c]}
            row={r}
            col={c}
            reducedMotion={reducedMotion}
            onClick={() => selectCell(r, c)}
          />
        )),
      )}
    </div>
  );
}
