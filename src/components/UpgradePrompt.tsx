import { Icon } from './Icon';
import { PixelButton } from './PixelButton';

interface Props {
  feature: string;
  message: string;
  onUpgrade: () => void;
  onDismiss?: () => void;
}

// Inline gate nudge — never a full-screen modal takeover.
export function UpgradePrompt({ feature, message, onUpgrade, onDismiss }: Props) {
  return (
    <div className="relative bg-paper border-2 border-ink shadow-pixel p-4">
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-1 right-1 p-1 text-ink-light hover:text-ink"
        >
          <Icon name="close" size={14} />
        </button>
      )}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gold">
          <Icon name="lock" size={16} />
        </span>
        <span className="font-display text-[10px] uppercase tracking-wide text-ink-light">
          {feature}
        </span>
      </div>
      <p className="font-body text-sm mb-3 pr-4">{message}</p>
      <PixelButton variant="gold" onClick={onUpgrade} className="w-full">
        Get Dojo Pass
      </PixelButton>
    </div>
  );
}
