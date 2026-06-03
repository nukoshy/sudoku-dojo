import { motion } from 'framer-motion';

interface Props {
  value: number | null;
  given: boolean;
  selected: boolean;
  related: boolean;
  sameValue: boolean;
  wrong: boolean;
  wrongKey: number;
  notes: Set<number>;
  row: number;
  col: number;
  reducedMotion: boolean;
  onClick: () => void;
}

export function Cell({
  value,
  given,
  selected,
  related,
  sameValue,
  wrong,
  wrongKey,
  notes,
  row,
  col,
  reducedMotion,
  onClick,
}: Props) {
  // Thick 3x3 box separators; thin internal lines.
  const borders = [
    'border-l',
    'border-t',
    col % 3 === 0 ? 'border-l-2 border-l-ink' : 'border-l-ink-light/30',
    row % 3 === 0 ? 'border-t-2 border-t-ink' : 'border-t-ink-light/30',
    col === 8 ? 'border-r-2 border-r-ink' : '',
    row === 8 ? 'border-b-2 border-b-ink' : '',
  ].join(' ');

  let bg = 'bg-paper';
  if (selected) bg = 'bg-highlight';
  else if (sameValue && value) bg = 'bg-highlight/60';
  else if (related) bg = 'bg-related';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Cell row ${row + 1} column ${col + 1}${value ? `, ${value}` : ', empty'}`}
      animate={
        wrong && !reducedMotion
          ? { boxShadow: ['inset 0 0 0 2px #C0392B', 'inset 0 0 0 0 #C0392B'] }
          : {}
      }
      key={wrong ? wrongKey : undefined}
      transition={{ duration: reducedMotion ? 0 : 0.2, times: [0, 1] }}
      className={`relative aspect-square w-full ${borders} ${bg} flex items-center justify-center select-none`}
    >
      {value ? (
        <span
          className={`font-display leading-none text-[clamp(14px,3.6vw,26px)] ${
            given ? 'text-ink' : 'text-[#3b6ea5]'
          }`}
        >
          {value}
        </span>
      ) : notes.size > 0 ? (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-[2px] text-ink-light">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              className="flex items-center justify-center font-body text-[clamp(6px,1.4vw,10px)] leading-none"
            >
              {notes.has(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </motion.button>
  );
}
