import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { audio } from '@/audio/engine';

type Variant = 'default' | 'accent' | 'gold' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Skip the default button-click sound. */
  silent?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  default: 'bg-paper text-ink',
  accent: 'bg-accent text-paper',
  gold: 'bg-gold text-ink',
  ghost: 'bg-transparent border-transparent shadow-none text-ink',
};

export const PixelButton = forwardRef<HTMLButtonElement, Props>(function PixelButton(
  { variant = 'default', silent, className = '', onClick, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      {...rest}
      onClick={(e) => {
        if (!silent) {
          audio.resume();
          audio.play('click');
        }
        onClick?.(e);
      }}
      className={`pixel-btn font-display text-[11px] leading-tight px-4 py-3 select-none ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
});
