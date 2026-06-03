import type { Belt } from '@/lib/constants';

interface Props {
  belt: Belt;
  locked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const SIZES = {
  sm: { box: 'w-7 h-7', jp: 'text-base', wrap: 'gap-1.5' },
  md: { box: 'w-10 h-10', jp: 'text-lg', wrap: 'gap-2' },
  lg: { box: 'w-14 h-14', jp: 'text-2xl', wrap: 'gap-3' },
};

export function BeltBadge({ belt, locked = false, size = 'md', showName = true }: Props) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center ${s.wrap}`} title={`${belt.name} Belt`}>
      <div
        className={`${s.box} border-2 border-ink shadow-pixel flex items-center justify-center font-display ${s.jp}`}
        style={{
          background: locked ? '#cabfa0' : belt.color,
          color: belt.key === 'white' || belt.key === 'yellow' ? '#1C1A15' : '#F5EFD6',
        }}
      >
        {locked ? '?' : belt.jp.charAt(0)}
      </div>
      {showName && (
        <div className="leading-tight">
          <div className="font-body font-bold text-sm">
            {locked ? 'Locked' : `${belt.name} Belt`}
          </div>
          <div className="font-display text-[10px] text-ink-light">{locked ? '???' : belt.jp}</div>
        </div>
      )}
    </div>
  );
}
