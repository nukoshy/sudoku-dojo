import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import { usePlayer } from '@/stores/player';

interface Item {
  to: string;
  label: string;
  icon: IconName;
}

const ITEMS: Item[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/leaderboard', label: 'Ranks', icon: 'leaderboard' },
  { to: '/play', label: 'Play', icon: 'play' },
  { to: '/techniques', label: 'Learn', icon: 'techniques' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

// Bottom tab bar (mobile) / left rail (desktop) shown on hub screens.
export function Nav() {
  const isPremium = usePlayer((s) => s.isPremium);

  return (
    <nav
      className="fixed z-30 bg-paper border-ink
        bottom-0 left-0 right-0 border-t-4 flex
        md:top-0 md:bottom-0 md:right-auto md:w-24 md:border-t-0 md:border-r-4 md:flex-col md:justify-center md:gap-2"
      aria-label="Primary"
    >
      {ITEMS.map((item) => {
        const isPlay = item.to === '/play';
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 md:flex-none flex flex-col items-center justify-center gap-1 py-2 md:py-4 relative ${
                isActive ? 'text-accent' : 'text-ink-light'
              } ${isPlay ? 'text-ink' : ''}`
            }
          >
            {isPlay ? (
              <span className="bg-accent text-paper w-12 h-12 flex items-center justify-center border-2 border-ink shadow-pixel -mt-1">
                <Icon name="play" size={24} />
              </span>
            ) : (
              <Icon name={item.icon} size={22} />
            )}
            <span className="font-display text-[8px] uppercase">{item.label}</span>
            {item.to === '/leaderboard' && !isPremium && (
              <span className="absolute top-1 right-1/4 md:right-3 text-gold">
                <Icon name="lock" size={11} />
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

/** Spacer to keep hub content clear of the fixed nav. */
export function NavSpacer() {
  return <div className="h-20 md:h-0" aria-hidden="true" />;
}
