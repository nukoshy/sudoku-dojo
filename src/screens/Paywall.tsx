import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelButton } from '@/components/PixelButton';
import { Icon } from '@/components/Icon';
import { usePlayer } from '@/stores/player';
import { PRICING } from '@/lib/constants';
import { startCheckout, isStripeEnabled } from '@/lib/stripe';
import { audio } from '@/audio/engine';

const PERKS = [
  'Unlimited rated puzzles',
  'Full technique library',
  'Leaderboard participation',
  'Rating history graph',
  'All belts unlockable',
  'Puzzle Rush (coming soon)',
];

export function Paywall() {
  const navigate = useNavigate();
  const setPremium = usePlayer((s) => s.setPremium);
  const isPremium = usePlayer((s) => s.isPremium);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const start = async () => {
    setProcessing(true);
    const result = await startCheckout(plan);
    setProcessing(false);
    if (result.success) {
      setPremium(true);
      audio.play('belt');
      setDone(true);
    }
  };

  if (done || isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="pixel-window washi p-6 text-center max-w-sm">
          <div className="text-gold flex justify-center mb-3">
            <Icon name="star" size={40} />
          </div>
          <h1 className="font-display text-lg mb-2">Welcome to Dojo Pass</h1>
          <p className="font-body text-sm text-ink-light mb-5">
            Every gate is open. Train without limits.
          </p>
          <PixelButton variant="accent" className="w-full" onClick={() => navigate('/')}>
            Enter the Dojo
          </PixelButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="pixel-window washi p-6 w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          aria-label="Close"
          className="float-right p-1 text-ink-light hover:text-ink"
        >
          <Icon name="close" size={20} />
        </button>
        <h1 className="font-display text-xl mb-1">Dojo Pass</h1>
        <p className="font-body text-sm text-ink-light mb-5">Ad-free. Unlimited. Yours.</p>

        <ul className="mb-6 flex flex-col gap-2">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2 font-body text-sm">
              <span className="text-tatami">
                <Icon name="check" size={16} />
              </span>
              {p}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <PlanCard
            label={PRICING.monthly.label}
            price={PRICING.monthly.price}
            per="/mo"
            selected={plan === 'monthly'}
            onClick={() => setPlan('monthly')}
          />
          <PlanCard
            label={PRICING.yearly.label}
            price={PRICING.yearly.price}
            per="/yr"
            badge={PRICING.yearly.note}
            selected={plan === 'yearly'}
            onClick={() => setPlan('yearly')}
          />
        </div>

        <PixelButton
          variant="accent"
          className="w-full"
          onClick={start}
          disabled={processing}
        >
          {processing ? 'Processing…' : 'Start Dojo Pass'}
        </PixelButton>
        {!isStripeEnabled && (
          <p className="font-body text-[11px] text-ink-light mt-3 text-center">
            Demo checkout — no real payment is taken.
          </p>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  label,
  price,
  per,
  badge,
  selected,
  onClick,
}: {
  label: string;
  price: string;
  per: string;
  badge?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 border-2 border-ink shadow-pixel text-left ${
        selected ? 'bg-gold' : 'bg-paper'
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-2 bg-accent text-paper font-display text-[8px] px-2 py-1 border-2 border-ink">
          {badge}
        </span>
      )}
      <div className="font-body text-sm font-bold">{label}</div>
      <div className="font-display text-lg mt-1">
        {price}
        <span className="font-body text-xs text-ink-light">{per}</span>
      </div>
    </button>
  );
}
