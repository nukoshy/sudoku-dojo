import { useNavigate } from 'react-router-dom';
import { BeltBadge } from '@/components/BeltBadge';
import { HankoStamp } from '@/components/HankoStamp';
import { Sparkline } from '@/components/Sparkline';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { NavSpacer } from '@/components/Nav';
import { usePlayer } from '@/stores/player';
import { ACHIEVEMENTS, BELTS, TIME_CONTROLS } from '@/lib/constants';

export function Profile() {
  const player = usePlayer();
  const navigate = useNavigate();
  const belt = player.belt();
  const initials = player.nickname.slice(0, 2).toUpperCase();
  const avgTime = player.wins > 0 ? Math.round(player.totalSolveTime / player.wins) : 0;
  const accuracy =
    player.gamesPlayed > 0 ? Math.round((player.wins / player.gamesPlayed) * 100) : 0;
  const history = player.ratingHistory.map((h) => h.rating);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Identity */}
      <header className="flex items-center gap-4 pt-2 mb-5">
        <div
          className="w-16 h-16 border-2 border-ink shadow-pixel bg-tatami text-paper flex items-center justify-center font-display text-lg"
          style={{ borderRadius: '50%' }}
        >
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="font-body font-bold text-xl">{player.nickname}</h1>
          <BeltBadge belt={belt} size="sm" />
        </div>
      </header>

      {/* Rating hero */}
      <section className="pixel-window washi p-5 mb-4 text-center">
        <div className="font-display text-4xl text-accent">{player.rating}</div>
        <div className="font-body text-sm text-ink-light mb-4">±{player.rd} rating deviation</div>
        {player.isPremium ? (
          <Sparkline values={history} className="mx-auto" />
        ) : (
          <div className="relative">
            <div className="blur-sm pointer-events-none select-none">
              <Sparkline values={history.length > 1 ? history : [1190, 1205, 1188, 1220]} className="mx-auto" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <UpgradePrompt
                feature="Rating History"
                message="Track your rating over time with Dojo Pass."
                onUpgrade={() => navigate('/paywall')}
              />
            </div>
          </div>
        )}
      </section>

      {/* Summary stats */}
      <section className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Solved" value={player.puzzlesSolved} />
        <Stat label="Streak" value={player.dailyStreak} />
        <Stat label="Best Streak" value={player.bestStreak} />
        <Stat label="Avg Time" value={avgTime ? `${Math.floor(avgTime / 60)}:${String(avgTime % 60).padStart(2, '0')}` : '—'} />
        <Stat label="Accuracy" value={player.gamesPlayed ? `${accuracy}%` : '—'} />
        <Stat label="Games" value={player.gamesPlayed} />
      </section>

      {/* Per-control ratings */}
      <h2 className="font-display text-sm mb-2">Ratings</h2>
      <section className="grid grid-cols-4 gap-2 mb-6">
        {TIME_CONTROLS.map((tc) => (
          <div key={tc.key} className="bg-paper border-2 border-ink shadow-pixel p-2 text-center">
            <div className="font-body text-[10px] text-ink-light">{tc.name}</div>
            <div className="font-display text-base text-accent">
              {player.ratingByControl[tc.key].rating}
            </div>
          </div>
        ))}
        <div className="bg-paper border-2 border-ink shadow-pixel p-2 text-center">
          <div className="font-body text-[10px] text-ink-light">Zen</div>
          <div className="font-display text-base text-tatami">禅</div>
        </div>
      </section>

      {/* Belt path */}
      <h2 className="font-display text-sm mb-2">Belt Path</h2>
      <section className="flex flex-wrap gap-3 mb-6">
        {BELTS.map((b) => {
          const earnedIdx = BELTS.findIndex((x) => x.key === belt.key);
          const thisIdx = BELTS.findIndex((x) => x.key === b.key);
          const reached = thisIdx <= earnedIdx;
          const locked = !player.isPremium && thisIdx > earnedIdx;
          return <BeltBadge key={b.key} belt={b} size="sm" locked={locked || !reached} showName={false} />;
        })}
      </section>

      {/* Hanko stamps */}
      <h2 className="font-display text-sm mb-2">Hanko Stamps</h2>
      <section className="flex flex-wrap gap-3 justify-start">
        {ACHIEVEMENTS.map((a) => (
          <HankoStamp key={a.key} achievement={a} earned={player.achievements.includes(a.key)} />
        ))}
      </section>

      <NavSpacer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-paper border-2 border-ink shadow-pixel p-3 text-center">
      <div className="font-display text-lg">{value}</div>
      <div className="font-body text-[11px] text-ink-light">{label}</div>
    </div>
  );
}
