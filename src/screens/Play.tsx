import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Grid } from '@/components/Grid';
import { NumberPad } from '@/components/NumberPad';
import { PixelButton } from '@/components/PixelButton';
import { BeltBadge } from '@/components/BeltBadge';
import { Icon } from '@/components/Icon';
import { useGame } from '@/stores/game';
import { usePlayer, type SolveOutcome } from '@/stores/player';
import { useSettings } from '@/stores/settings';
import { TECHNIQUE_BY_KEY } from '@/engine/techniques';
import { beltFor, TIME_CONTROL_BY_KEY, ZEN_LEVEL_BY_KEY } from '@/lib/constants';
import { audio } from '@/audio/engine';

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Play() {
  const game = useGame();
  const player = usePlayer();
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState<SolveOutcome | null>(null);
  const committed = useRef(false);

  // Redirect out if no active puzzle (e.g. hard refresh on /play).
  useEffect(() => {
    if (game.status === 'idle' && !game.puzzle) navigate('/', { replace: true });
  }, [game.status, game.puzzle, navigate]);

  // Timer tick.
  useEffect(() => {
    if (game.status !== 'playing') return;
    const id = window.setInterval(() => useGame.getState().tick(), 1000);
    return () => window.clearInterval(id);
  }, [game.status]);

  // Commit result once on completion / failure.
  useEffect(() => {
    if ((game.status === 'complete' || game.status === 'failed') && !committed.current && game.puzzle) {
      committed.current = true;
      const result = player.commitResult({
        mode: game.mode,
        control: game.timeControl,
        won: game.status === 'complete',
        puzzle: { rating: game.puzzle.rating, rd: game.puzzle.rd, sigma: game.puzzle.sigma },
        timeSeconds: game.elapsed,
        mistakes: game.mistakes,
        hintsUsed: game.hintsUsed,
      });
      setOutcome(result);
    }
    if (game.status === 'playing') committed.current = false;
  }, [game.status, game.puzzle, game.mode, game.timeControl, game.elapsed, game.mistakes, game.hintsUsed, player]);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (game.status !== 'playing') return;
      const g = useGame.getState();
      if (e.key >= '1' && e.key <= '9') {
        g.placeNumber(Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        g.eraseCell();
      } else if (e.key === 'ArrowUp') g.moveSelection(-1, 0);
      else if (e.key === 'ArrowDown') g.moveSelection(1, 0);
      else if (e.key === 'ArrowLeft') g.moveSelection(0, -1);
      else if (e.key === 'ArrowRight') g.moveSelection(0, 1);
      else if (e.key.toLowerCase() === 'n') g.toggleNotesMode();
      else if (e.key.toLowerCase() === 'z') g.undo();
      else if (e.key.toLowerCase() === 'h') g.useHint();
      else if (e.key.toLowerCase() === 'p') (g.isPaused ? g.resume() : g.pause());
      else if (e.key === 'Escape') g.pause();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game.status]);

  if (!game.puzzle) return null;

  const difficultyLabel =
    game.mode === 'rated'
      ? String(game.puzzle.rating)
      : `Zen · ${ZEN_LEVEL_BY_KEY[game.zenDifficulty!].name}`;
  const timeLabel =
    game.mode === 'rated' ? fmt(game.timeRemaining ?? 0) : fmt(game.elapsed);
  const earnedBelt = beltFor(player.rating, player.puzzlesSolved);

  return (
    <div className="min-h-screen p-3 md:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto mb-4">
        <PixelButton variant="ghost" className="!px-2 !shadow-none" onClick={() => navigate('/')}>
          <span className="flex items-center gap-1">
            <Icon name="home" size={18} /> MENU
          </span>
        </PixelButton>
        <div className="font-display text-[10px] text-paper">数独道場</div>
        <button
          onClick={() => useGame.getState().pause()}
          aria-label="Pause"
          className="pixel-btn bg-paper p-2"
        >
          <Icon name="pause" size={18} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-[200px_1fr_220px] gap-4 items-start">
        {/* Left sidebar */}
        <aside className="order-2 md:order-1 grid grid-cols-3 md:grid-cols-1 gap-3">
          <InfoBox label={game.mode === 'rated' ? 'Time Left' : 'Elapsed'}>
            <span
              className={`font-display text-xl ${
                game.mode === 'rated' && (game.timeRemaining ?? 99) <= 15 ? 'text-accent' : ''
              }`}
            >
              {timeLabel}
            </span>
          </InfoBox>
          <InfoBox label="Difficulty">
            <span className="font-display text-base">{difficultyLabel}</span>
          </InfoBox>
          <InfoBox label="Mistakes">
            <span className="font-display text-base">
              {game.mode === 'rated' ? `${game.mistakes}/5` : game.mistakes}
            </span>
          </InfoBox>
        </aside>

        {/* Grid */}
        <main className="order-1 md:order-2">
          <motion.div
            animate={
              game.status === 'complete' && !reducedMotion ? { opacity: [1, 0.6, 1] } : {}
            }
            transition={{ duration: 0.6 }}
          >
            <Grid />
          </motion.div>
          {/* Rating badge */}
          <div className="mt-4 flex items-center justify-center gap-3 bg-paper border-2 border-ink shadow-pixel px-3 py-2 max-w-[min(92vw,520px)] mx-auto">
            <BeltBadge belt={earnedBelt} size="sm" showName={false} />
            <span className="font-body text-xs text-ink-light">
              You <b className="text-ink">{player.rating}</b>
            </span>
            {game.mode === 'rated' && (
              <span className="font-body text-xs text-ink-light">
                Puzzle <b className="text-accent">{game.puzzle.rating}</b>
              </span>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="order-3 md:order-3">
          <NumberPad />
        </aside>
      </div>

      {/* Pause overlay */}
      <AnimatePresence>
        {game.isPaused && game.status === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/70 flex items-center justify-center z-40 p-4"
          >
            <div className="pixel-window washi p-6 text-center w-full max-w-xs">
              <h2 className="font-display text-lg mb-5">Paused</h2>
              <PixelButton
                variant="accent"
                className="w-full mb-3"
                onClick={() => useGame.getState().resume()}
              >
                Resume
              </PixelButton>
              <PixelButton className="w-full" onClick={() => navigate('/')}>
                Quit to Menu
              </PixelButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion / Fail cards */}
      <AnimatePresence>
        {game.status === 'complete' && outcome && (
          <ResultCard
            title="Puzzle solved!"
            success
            outcome={outcome}
            game={game}
            reducedMotion={reducedMotion}
            onMenu={() => navigate('/')}
          />
        )}
        {game.status === 'failed' && outcome && (
          <ResultCard
            title="Puzzle failed."
            success={false}
            outcome={outcome}
            game={game}
            reducedMotion={reducedMotion}
            onMenu={() => navigate('/')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-paper border-2 border-ink shadow-pixel p-3 text-center">
      <div className="font-body text-[10px] uppercase text-ink-light mb-1">{label}</div>
      {children}
    </div>
  );
}

function ResultCard({
  title,
  success,
  outcome,
  game,
  reducedMotion,
  onMenu,
}: {
  title: string;
  success: boolean;
  outcome: SolveOutcome;
  game: ReturnType<typeof useGame.getState>;
  reducedMotion: boolean;
  onMenu: () => void;
}) {
  const navigate = useNavigate();
  const replay = (rematch: boolean) => {
    audio.resume();
    if (game.mode === 'rated') {
      if (rematch || usePlayer.getState().canPlayRated()) {
        usePlayer.getState().startRated();
        useGame.getState().startGame('rated', { control: game.timeControl! });
      } else {
        navigate('/');
        return;
      }
    } else {
      useGame.getState().startGame('zen', { level: game.zenDifficulty! });
    }
  };

  // A required technique the player likely hasn't mastered (highest-weight one).
  const hardTech =
    !success && game.puzzle
      ? game.puzzle.techniques
          .map((k) => TECHNIQUE_BY_KEY[k])
          .filter((t) => t.weight >= 10)
          .sort((a, b) => b.weight - a.weight)[0]
      : undefined;

  return (
    <motion.div
      initial={{ y: reducedMotion ? 0 : '100%' }}
      animate={{ y: 0 }}
      exit={{ y: reducedMotion ? 0 : '100%' }}
      transition={{ type: 'tween', duration: reducedMotion ? 0 : 0.35 }}
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center"
    >
      <div
        className={`pixel-window washi w-full max-w-md m-3 p-5 ${
          success ? '' : 'border-accent'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base">{title}</h2>
          <button onClick={onMenu} aria-label="Close to menu" className="p-1">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 font-body text-sm">
          <Line
            label={game.mode === 'rated' ? 'Time / Limit' : 'Time'}
            value={
              game.mode === 'rated'
                ? `${mmss(game.elapsed)} / ${mmss(TIME_CONTROL_BY_KEY[game.timeControl!].seconds)}`
                : mmss(game.elapsed)
            }
          />
          <Line label="Mistakes" value={String(game.mistakes)} />
          <Line label="Hints used" value={String(game.hintsUsed)} />
          {game.mode === 'rated' && (
            <Line
              label="Rating"
              value={
                outcome.ratingDelta >= 0 ? `+${outcome.ratingDelta}` : String(outcome.ratingDelta)
              }
              accent={outcome.ratingDelta >= 0 ? 'pos' : 'neg'}
            />
          )}
        </div>

        {game.mode === 'rated' && (
          <p className="font-body text-sm mb-3" aria-live="polite">
            New rating: <b className="text-accent">{outcome.ratingAfter}</b>
          </p>
        )}

        {outcome.beltAdvanced && (
          <div className="bg-gold border-2 border-ink shadow-pixel p-2 mb-3 text-center font-display text-[10px]">
            NEW BELT · {outcome.beltAdvanced.name} {outcome.beltAdvanced.jp}
          </div>
        )}

        {outcome.newAchievements.map((a) => (
          <div
            key={a.key}
            className="bg-paper border-2 border-ink shadow-pixel p-2 mb-2 text-center font-body text-xs"
          >
            🏯 {a.name} ({a.jp}) earned
          </div>
        ))}

        {hardTech && (
          <p className="font-body text-sm mb-3 border-l-4 border-accent pl-2">
            This puzzle needed <b>{hardTech.name}</b>. Learn it in the{' '}
            <button onClick={() => navigate('/techniques')} className="underline text-accent">
              Technique Dojo
            </button>
            .
          </p>
        )}

        <div className="flex gap-2">
          {!success && (
            <PixelButton className="flex-1" onClick={() => replay(true)}>
              Try Again
            </PixelButton>
          )}
          <PixelButton variant="accent" className="flex-1" onClick={() => replay(false)}>
            New Puzzle
          </PixelButton>
        </div>
      </div>
    </motion.div>
  );
}

function mmss(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function Line({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'pos' | 'neg';
}) {
  return (
    <div className="flex justify-between border-b border-ink-light/30 py-1">
      <span className="text-ink-light">{label}</span>
      <span
        className={`font-bold ${
          accent === 'pos' ? 'text-tatami' : accent === 'neg' ? 'text-accent' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}
