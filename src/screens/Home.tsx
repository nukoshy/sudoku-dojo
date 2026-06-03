import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BeltBadge } from '@/components/BeltBadge';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { NavSpacer } from '@/components/Nav';
import { Icon } from '@/components/Icon';
import { usePlayer } from '@/stores/player';
import { useGame } from '@/stores/game';
import { useSettings } from '@/stores/settings';
import {
  TIME_CONTROLS,
  ZEN_LEVELS,
  type TimeControl,
  type ZenDifficulty,
} from '@/lib/constants';

export function Home() {
  const player = usePlayer();
  const startGame = useGame((s) => s.startGame);
  const startRated = usePlayer((s) => s.startRated);
  const streakVisible = useSettings((s) => s.streakVisible);
  const navigate = useNavigate();
  const [showGate, setShowGate] = useState(false);

  const belt = player.belt();
  const remaining = player.ratedRemainingToday();
  const todayCount =
    player.dailyRatedDate === new Date().toISOString().slice(0, 10) ? player.dailyRatedUsed : 0;

  const playRated = (control: TimeControl) => {
    if (!player.canPlayRated()) {
      setShowGate(true);
      return;
    }
    startRated();
    startGame('rated', { control });
    navigate('/play');
  };

  const playZen = (level: ZenDifficulty) => {
    startGame('zen', { level });
    navigate('/play');
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-5 pt-2">
        <BeltBadge belt={belt} size="md" />
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-end"
          aria-label="Open profile"
        >
          <span className="font-body font-bold">{player.nickname}</span>
          <span className="font-display text-lg text-accent">{player.rating}</span>
        </button>
      </header>

      {player.isPremium ? (
        <div className="mb-4 inline-flex items-center gap-2 bg-gold border-2 border-ink shadow-pixel px-3 py-1 font-display text-[10px]">
          <Icon name="star" size={14} /> DOJO PASS MEMBER
        </div>
      ) : (
        <button
          onClick={() => navigate('/paywall')}
          className="mb-4 inline-flex items-center gap-2 bg-paper border-2 border-ink shadow-pixel px-3 py-1 font-display text-[10px] hover:bg-gold"
        >
          <Icon name="star" size={14} /> UPGRADE TO DOJO PASS
        </button>
      )}

      {/* Rated card */}
      <section className="pixel-window washi p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-base">RATED</h2>
          <span className="font-display text-[9px]" lang="ja">
            段位
          </span>
        </div>
        <p className="font-body text-sm text-ink-light mb-4">
          Every solve moves your rating. Beat the clock.
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {TIME_CONTROLS.map((tc) => (
            <button
              key={tc.key}
              onClick={() => playRated(tc.key)}
              className="pixel-btn bg-paper p-3 text-center"
            >
              <div className="font-display text-xs mb-1">{tc.name}</div>
              <div className="font-body text-[11px] text-ink-light">{tc.description}</div>
              <div className="font-display text-[10px] text-accent mt-1">
                {player.ratingByControl[tc.key].rating}
              </div>
            </button>
          ))}
        </div>
        {!player.isPremium && (
          <p className="font-body text-[11px] text-ink-light">
            {remaining > 0
              ? `${remaining} free rated puzzle today`
              : 'Daily free rated puzzle used.'}
          </p>
        )}
        {showGate && (
          <div className="mt-3">
            <UpgradePrompt
              feature="Unlimited Rated"
              message="You've used today's free rated puzzle. Play Zen freely, or get Dojo Pass for unlimited rated puzzles."
              onUpgrade={() => navigate('/paywall')}
              onDismiss={() => setShowGate(false)}
            />
          </div>
        )}
      </section>

      {/* Zen card */}
      <section className="pixel-window washi p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-base">禅 ZEN</h2>
          <span className="font-display text-[9px] text-tatami">ALWAYS FREE</span>
        </div>
        <p className="font-body text-sm text-ink-light mb-4">
          No clock, no rating. Just you and the grid.
        </p>
        <div className="grid grid-cols-5 gap-2">
          {ZEN_LEVELS.map((z) => (
            <button
              key={z.key}
              onClick={() => playZen(z.key)}
              className="pixel-btn bg-paper py-2 px-1 text-center"
            >
              <div className="font-display text-[9px]" lang="ja">
                {z.jp}
              </div>
              <div className="font-body text-[10px] text-ink-light mt-1">{z.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Mini stats */}
      <section className="grid grid-cols-3 gap-3">
        {streakVisible && (
          <Stat icon="flame" label="Streak" value={player.dailyStreak} />
        )}
        <Stat icon="check" label="Solved" value={player.puzzlesSolved} />
        <Stat icon="star" label="Today" value={todayCount} />
      </section>

      <NavSpacer />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: 'flame' | 'check' | 'star'; label: string; value: number }) {
  return (
    <div className="bg-paper border-2 border-ink shadow-pixel p-3 text-center">
      <div className="flex items-center justify-center text-accent mb-1">
        <Icon name={icon} size={18} />
      </div>
      <div className="font-display text-lg">{value}</div>
      <div className="font-body text-[11px] text-ink-light">{label}</div>
    </div>
  );
}
