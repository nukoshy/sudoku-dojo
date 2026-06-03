// Crisp pixel-style SVG icons. Stroke uses currentColor; no anti-aliased curves.

export type IconName =
  | 'erase'
  | 'notes'
  | 'hint'
  | 'undo'
  | 'pause'
  | 'play'
  | 'home'
  | 'leaderboard'
  | 'techniques'
  | 'profile'
  | 'flame'
  | 'lock'
  | 'check'
  | 'close'
  | 'sound'
  | 'star';

const PATHS: Record<IconName, JSX.Element> = {
  erase: (
    <path d="M4 13 L11 6 L18 13 L13 18 L7 18 Z M7 18 H18" />
  ),
  notes: (
    <>
      <path d="M5 4 H19 V20 H5 Z" />
      <path d="M8 8 H16 M8 12 H16 M8 16 H13" />
    </>
  ),
  hint: (
    <>
      <path d="M12 3 a6 6 0 0 1 4 10 v3 H8 v-3 a6 6 0 0 1 4 -10 Z" />
      <path d="M9 19 H15 M10 21 H14" />
    </>
  ),
  undo: (
    <path d="M9 7 L4 12 L9 17 M4 12 H15 a5 5 0 0 1 0 0" />
  ),
  pause: (
    <path d="M8 5 H10 V19 H8 Z M14 5 H16 V19 H14 Z" />
  ),
  play: <path d="M7 5 V19 L19 12 Z" />,
  home: <path d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z" />,
  leaderboard: <path d="M5 20 V11 H9 V20 M10 20 V5 H14 V20 M15 20 V13 H19 V20 M3 20 H21" />,
  techniques: (
    <>
      <path d="M5 4 H17 a2 2 0 0 1 2 2 V20 H7 a2 2 0 0 1 -2 -2 Z" />
      <path d="M8 8 H15 M8 12 H15" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21 a8 8 0 0 1 16 0" />
    </>
  ),
  flame: <path d="M12 3 C13 7 17 8 16 13 a4 4 0 1 1 -8 0 C7 10 11 9 12 3 Z" />,
  lock: (
    <>
      <path d="M6 11 H18 V20 H6 Z" />
      <path d="M9 11 V8 a3 3 0 0 1 6 0 V11" />
    </>
  ),
  check: <path d="M5 13 L10 18 L19 6" />,
  close: <path d="M6 6 L18 18 M18 6 L6 18" />,
  sound: <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z M16 9 a4 4 0 0 1 0 6" />,
  star: <path d="M12 3 L14.5 9 L21 9.5 L16 14 L17.5 20.5 L12 17 L6.5 20.5 L8 14 L3 9.5 L9.5 9 Z" />,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
