import { useNavigate } from 'react-router-dom';
import { NavSpacer } from '@/components/Nav';
import { Icon } from '@/components/Icon';
import { usePlayer } from '@/stores/player';
import { useLeaderboard, type LeaderRow, type LeaderTab } from '@/stores/leaderboard';
import { BELTS } from '@/lib/constants';

const TABS: { key: LeaderTab; label: string }[] = [
  { key: 'global', label: 'Global' },
  { key: 'friends', label: 'Friends' },
  { key: 'difficulty', label: 'By Difficulty' },
];

export function Leaderboard() {
  const player = usePlayer();
  const navigate = useNavigate();
  const { tab, setTab, rows } = useLeaderboard();
  const todayCount =
    player.dailyRatedDate === new Date().toISOString().slice(0, 10) ? player.dailyRatedUsed : 0;

  const { rows: list, playerRow } = rows({
    playerNickname: player.nickname,
    playerRating: player.rating,
    playerWeekly: todayCount,
    playerStreak: player.dailyStreak,
    playerPuzzles: player.puzzlesSolved,
    isPremium: player.isPremium,
  });

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="font-display text-lg pt-2 mb-1">Leaderboard</h1>
      <p className="font-body text-xs text-ink-light mb-4">Resets weekly · Sunday 00:00</p>

      {!player.isPremium && (
        <div className="bg-gold border-2 border-ink shadow-pixel p-3 mb-4 flex items-center justify-between gap-3">
          <span className="font-body text-sm">
            Join the leaderboard — upgrade to Dojo Pass.
          </span>
          <button
            onClick={() => navigate('/paywall')}
            className="pixel-btn bg-paper font-display text-[9px] px-3 py-2 whitespace-nowrap"
          >
            Get Pass
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pixel-btn px-3 py-2 font-display text-[9px] ${
              tab === t.key ? 'bg-accent text-paper' : 'bg-paper'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'difficulty' ? (
        <div className="pixel-window washi p-6 text-center font-body text-sm text-ink-light">
          Per-difficulty boards open as you climb. Coming soon.
        </div>
      ) : (
        <div className="bg-paper border-2 border-ink shadow-pixel">
          <div className="grid grid-cols-[2rem_1fr_4rem_3rem] gap-2 px-3 py-2 border-b-2 border-ink font-display text-[9px] text-ink-light">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">Rating</span>
            <span className="text-right">Wk</span>
          </div>
          {list.map((r) => (
            <Row key={`${r.rank}-${r.nickname}`} row={r} />
          ))}
          {!player.isPremium && (
            <div className="px-3 py-3 border-t-2 border-dashed border-ink-light text-center font-body text-xs text-ink-light">
              You appear here once you join with Dojo Pass.
            </div>
          )}
          {playerRow && playerRow.rank > 20 && (
            <div className="border-t-2 border-ink">
              <Row row={playerRow} />
            </div>
          )}
        </div>
      )}

      <NavSpacer />
    </div>
  );
}

function Row({ row }: { row: LeaderRow }) {
  const belt = BELTS.find((b) => b.key === row.beltKey) ?? BELTS[0];
  return (
    <div
      className={`grid grid-cols-[2rem_1fr_4rem_3rem] gap-2 px-3 py-2 items-center border-b border-ink-light/20 ${
        row.isPlayer ? 'bg-highlight' : ''
      }`}
    >
      <span className="font-display text-xs">{row.rank}</span>
      <span className="flex items-center gap-2 min-w-0">
        <span
          className="w-4 h-4 border border-ink shrink-0"
          style={{ background: belt.color }}
          title={`${belt.name} Belt`}
        />
        <span className="font-body text-sm truncate">{row.nickname}</span>
      </span>
      <span className="font-display text-xs text-right text-accent">{row.rating}</span>
      <span className="font-body text-xs text-right flex items-center justify-end gap-0.5">
        <span className="text-accent">
          <Icon name="flame" size={12} />
        </span>
        {row.weekly}
      </span>
    </div>
  );
}
