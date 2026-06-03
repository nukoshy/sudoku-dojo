import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavSpacer } from '@/components/Nav';
import { Icon } from '@/components/Icon';
import { PixelButton } from '@/components/PixelButton';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { usePlayer } from '@/stores/player';
import { useSettings } from '@/stores/settings';
import { TECHNIQUES, type TechniqueInfo } from '@/engine/techniques';
import { stringToGrid } from '@/engine/solver';
import { FREE_TECHNIQUES } from '@/lib/constants';
import { audio } from '@/audio/engine';

// A solved grid used to build demonstrative mini-boards.
const DEMO_SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

export function Techniques() {
  const player = usePlayer();
  const navigate = useNavigate();
  const [active, setActive] = useState<TechniqueInfo | null>(null);
  const [gateFor, setGateFor] = useState<string | null>(null);

  if (active) {
    return <Lesson technique={active} onBack={() => setActive(null)} />;
  }

  const open = (t: TechniqueInfo, locked: boolean) => {
    if (locked) {
      setGateFor(t.key);
      return;
    }
    setActive(t);
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="font-display text-lg pt-2 mb-1">Technique Dojo</h1>
      <p className="font-body text-xs text-ink-light mb-4" lang="ja">
        技の巻物 · scrolls of skill
      </p>

      <div className="flex flex-col gap-3">
        {TECHNIQUES.filter((t) => t.key !== 'backtrack').map((t, i) => {
          const locked = !player.isPremium && i >= FREE_TECHNIQUES;
          return (
            <div key={t.key}>
              <button
                onClick={() => open(t, locked)}
                className="w-full text-left pixel-window washi p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 border-2 border-ink flex items-center justify-center font-display bg-paper">
                  {t.jp.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-body font-bold text-sm">
                    {t.name}{' '}
                    <span className="text-ink-light font-normal" lang="ja">
                      {t.jp}
                    </span>
                  </div>
                  <div className="font-body text-[12px] text-ink-light">{t.description}</div>
                </div>
                {locked ? (
                  <span className="text-gold">
                    <Icon name="lock" size={18} />
                  </span>
                ) : (
                  <span className="font-display text-[9px] text-accent">PRACTICE →</span>
                )}
              </button>
              {gateFor === t.key && (
                <div className="mt-2">
                  <UpgradePrompt
                    feature="Full Technique Library"
                    message={`Unlock ${t.name} and every advanced technique with Dojo Pass.`}
                    onUpgrade={() => navigate('/paywall')}
                    onDismiss={() => setGateFor(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <NavSpacer />
    </div>
  );
}

function Lesson({ technique, onBack }: { technique: TechniqueInfo; onBack: () => void }) {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  // Build a mini-board: full solution with one target cell blanked. The learner
  // applies the technique by placing the missing digit.
  const target = (technique.weight * 7) % 81;
  const grid = stringToGrid(DEMO_SOLUTION);
  const answer = grid[Math.floor(target / 9)][target % 9];
  const [filled, setFilled] = useState(false);
  const [wrong, setWrong] = useState(false);

  const tryPlace = (n: number) => {
    audio.resume();
    if (n === answer) {
      setFilled(true);
      audio.play('complete');
    } else {
      setWrong(true);
      audio.play('error');
      window.setTimeout(() => setWrong(false), 250);
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <PixelButton variant="ghost" className="!px-1 !shadow-none mb-3" onClick={onBack}>
        <span className="flex items-center gap-1 text-paper">
          <Icon name="techniques" size={16} /> Back to scrolls
        </span>
      </PixelButton>

      <div className="pixel-window washi p-5">
        <h2 className="font-display text-base mb-1">
          {technique.name} <span lang="ja">{technique.jp}</span>
        </h2>
        <p className="font-body text-sm text-ink-light mb-4">{technique.description}</p>

        <p className="font-body text-sm mb-3">
          Find the highlighted cell below and apply the pattern — place the digit that the
          technique reveals.
        </p>

        {/* Mini demo board */}
        <div className="grid grid-cols-9 w-full max-w-[360px] mx-auto border-2 border-ink mb-4">
          {grid.map((row, r) =>
            row.map((v, c) => {
              const idx = r * 9 + c;
              const isTarget = idx === target;
              return (
                <div
                  key={idx}
                  className={`aspect-square flex items-center justify-center font-display text-[clamp(9px,2.5vw,15px)]
                    ${c % 3 === 0 ? 'border-l-2 border-l-ink' : 'border-l border-l-ink-light/30'}
                    ${r % 3 === 0 ? 'border-t-2 border-t-ink' : 'border-t border-t-ink-light/30'}
                    ${isTarget ? (wrong ? 'bg-accent text-paper' : filled ? 'bg-tatami text-paper' : 'bg-highlight') : 'bg-paper text-ink'}`}
                >
                  {isTarget ? (filled ? answer : '') : v}
                </div>
              );
            }),
          )}
        </div>

        {filled ? (
          <motion.div
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            className="bg-tatami text-paper border-2 border-ink shadow-pixel p-3 text-center font-display text-[10px]"
          >
            よくできました · Well done! Pattern applied.
          </motion.div>
        ) : (
          <div className="grid grid-cols-9 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => tryPlace(n)}
                className="pixel-btn bg-paper font-display text-sm py-2"
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      <NavSpacer />
    </div>
  );
}
