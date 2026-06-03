import type { AchievementDef } from '@/lib/constants';

interface Props {
  achievement: AchievementDef;
  earned: boolean;
}

// Round hanko stamp. Earned = red ink fill; locked = faint dashed circle.
export function HankoStamp({ achievement, earned }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 w-20" title={achievement.description}>
      <div
        className={`w-16 h-16 flex items-center justify-center font-display text-xl ${
          earned
            ? 'text-paper bg-accent border-2 border-ink shadow-pixel'
            : 'text-ink-light/50 border-2 border-dashed border-ink-light/40 bg-transparent'
        }`}
        style={{ borderRadius: '50%' }}
        aria-label={`${achievement.name}: ${earned ? 'earned' : 'locked'}`}
      >
        {achievement.jp}
      </div>
      <div className="text-center leading-tight">
        <div className={`font-body text-[11px] font-bold ${earned ? 'text-ink' : 'text-ink-light/60'}`}>
          {achievement.name}
        </div>
      </div>
    </div>
  );
}
