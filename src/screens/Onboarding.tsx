import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PixelButton } from '@/components/PixelButton';
import { Icon } from '@/components/Icon';
import { usePlayer } from '@/stores/player';
import { useSettings } from '@/stores/settings';
import { useGame } from '@/stores/game';
import { audio } from '@/audio/engine';
import type { ZenDifficulty } from '@/lib/constants';

interface PathOption {
  jp: string;
  name: string;
  desc: string;
  color: string;
  seed: number;
  zen: ZenDifficulty;
}

const PATHS: PathOption[] = [
  { jp: '白', name: 'New to Sudoku', desc: 'Just starting out', color: '#F2ECD8', seed: 800, zen: 'beginner' },
  { jp: '黄', name: 'Know the Basics', desc: 'Solved a few before', color: '#E8C84B', seed: 1100, zen: 'easy' },
  { jp: '緑', name: 'Experienced', desc: 'Comfortable solver', color: '#5C9A52', seed: 1400, zen: 'medium' },
  { jp: '茶', name: 'Expert', desc: 'Naked pairs & X-Wings', color: '#7A4E2D', seed: 1700, zen: 'hard' },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [nickname, setNickname] = useState('');
  const settings = useSettings();
  const completeOnboarding = usePlayer((s) => s.completeOnboarding);
  const startGame = useGame((s) => s.startGame);
  const navigate = useNavigate();

  const enterDojo = () => {
    const path = PATHS[choice ?? 0];
    completeOnboarding(nickname.trim() || 'Deshi', path.seed);
    startGame('zen', { level: path.zen });
    navigate('/play');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="pixel-window w-full max-w-md p-6 washi">
        {step === 0 && (
          <div className="text-center py-8">
            <h1 className="font-display text-3xl mb-3" lang="ja">
              数独道場
            </h1>
            <p className="font-display text-sm mb-1">Sudoku Dojo</p>
            <p className="font-body text-ink-light mb-10">The art of mindful numbers.</p>
            <PixelButton variant="accent" className="w-full" onClick={() => setStep(1)}>
              Begin
            </PixelButton>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-lg mb-1">Choose Your Path</h2>
            <p className="font-display text-[10px] text-ink-light mb-5" lang="ja">
              道を選べ
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PATHS.map((p, i) => (
                <motion.button
                  key={p.name}
                  whileTap={settings.reducedMotion ? {} : { scale: 0.95 }}
                  onClick={() => {
                    setChoice(i);
                    audio.resume();
                    audio.play('stamp');
                  }}
                  className={`text-left p-3 border-2 border-ink shadow-pixel bg-paper ${
                    choice === i ? 'outline outline-3 outline-accent' : ''
                  }`}
                >
                  <div
                    className="w-8 h-8 border-2 border-ink mb-2 flex items-center justify-center font-display"
                    style={{ background: p.color }}
                  >
                    {p.jp}
                  </div>
                  <div className="font-body font-bold text-sm leading-tight">{p.name}</div>
                  <div className="font-body text-[11px] text-ink-light">{p.desc}</div>
                </motion.button>
              ))}
            </div>
            {choice !== null && (
              <PixelButton variant="accent" className="w-full mt-5" onClick={() => setStep(2)}>
                Continue
              </PixelButton>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-lg mb-5">Personalize</h2>
            <label className="block font-body text-sm font-bold mb-1" htmlFor="nick">
              Nickname
            </label>
            <input
              id="nick"
              value={nickname}
              maxLength={20}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Deshi"
              className="w-full border-2 border-ink bg-paper px-3 py-2 font-body mb-5 shadow-pixel focus:outline-none"
            />
            <Toggle
              label="Sound effects"
              on={settings.soundEnabled}
              onChange={(v) => {
                settings.setSound(v);
                if (v) {
                  audio.resume();
                  audio.play('click');
                }
              }}
            />
            <Toggle
              label="Ambient sounds"
              on={settings.ambientEnabled}
              onChange={(v) => settings.setAmbient(v)}
            />
            <PixelButton
              variant="accent"
              className="w-full mt-6"
              onClick={enterDojo}
              disabled={nickname.trim().length === 0}
            >
              Enter the Dojo
            </PixelButton>
          </div>
        )}

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 border border-ink ${i === step ? 'bg-accent' : 'bg-paper'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className="w-full flex items-center justify-between py-2"
    >
      <span className="font-body text-sm flex items-center gap-2">
        <Icon name="sound" size={16} /> {label}
      </span>
      <span
        className={`w-12 h-6 border-2 border-ink flex items-center px-0.5 ${
          on ? 'bg-tatami justify-end' : 'bg-paper justify-start'
        }`}
      >
        <span className="w-4 h-4 bg-ink" />
      </span>
    </button>
  );
}
