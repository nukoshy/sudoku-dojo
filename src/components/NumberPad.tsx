import { useGame } from '@/stores/game';
import { Icon } from './Icon';
import { audio } from '@/audio/engine';

// Number pad 1–9 plus the four tool buttons (erase / notes / hint / undo).
export function NumberPad() {
  const {
    placeNumber,
    eraseCell,
    toggleNotesMode,
    useHint,
    undo,
    notesMode,
    hintsRemaining,
    userGrid,
  } = useGame();

  // Count how many of each digit are already placed, to dim completed digits.
  const counts = new Array(10).fill(0);
  for (const row of userGrid) for (const v of row) if (v) counts[v]++;

  const tap = (fn: () => void) => () => {
    audio.resume();
    fn();
  };

  return (
    <div className="w-full max-w-[min(92vw,360px)] mx-auto flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={tap(() => placeNumber(n))}
            disabled={counts[n] >= 9}
            aria-label={`Place ${n}`}
            className="pixel-btn bg-paper text-ink font-display text-xl py-3 disabled:opacity-40"
          >
            {n}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <ToolButton label="Erase" icon="erase" onClick={tap(eraseCell)} />
        <ToolButton
          label="Notes"
          icon="notes"
          active={notesMode}
          onClick={tap(toggleNotesMode)}
        />
        <ToolButton
          label="Hint"
          icon="hint"
          badge={hintsRemaining}
          disabled={hintsRemaining <= 0}
          onClick={tap(useHint)}
        />
        <ToolButton label="Undo" icon="undo" onClick={tap(undo)} />
      </div>
    </div>
  );
}

function ToolButton({
  label,
  icon,
  onClick,
  active,
  badge,
  disabled,
}: {
  label: string;
  icon: 'erase' | 'notes' | 'hint' | 'undo';
  onClick: () => void;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={`pixel-btn relative flex flex-col items-center gap-1 py-2 ${
        active ? 'bg-gold text-ink' : 'bg-paper text-ink'
      }`}
    >
      <Icon name={icon} size={20} />
      <span className="font-body text-[10px]">{label}</span>
      {badge !== undefined && (
        <span className="absolute -top-2 -right-2 bg-accent text-paper font-display text-[9px] w-5 h-5 border-2 border-ink flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}
