// Sudoku Dojo — pixel-styled icon set. Crisp-edged inline SVGs, currentColor.
// Usage: <Icon name="home" size={20} />
const ICONS = {
  home: <React.Fragment><polyline points="4,12 12,5 20,12" /><polyline points="6,11 6,19 18,19 18,11" /></React.Fragment>,
  play: <path d="M8 5 L19 12 L8 19 Z" fill="currentColor" stroke="none" />,
  pause: <g fill="currentColor" stroke="none"><rect x="7" y="5" width="3.4" height="14" /><rect x="13.6" y="5" width="3.4" height="14" /></g>,
  back: <polyline points="14,5 7,12 14,19" />,
  chevron: <polyline points="9,6 15,12 9,18" />,
  undo: <React.Fragment><polyline points="8,7 4,11 8,15" /><path d="M4 11 H14 a5 5 0 0 1 0 10 H9" /></React.Fragment>,
  erase: <React.Fragment><path d="M8 5 H20 V19 H8 L3 12 Z" /><line x1="11" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="11" y2="15" /></React.Fragment>,
  pencil: <React.Fragment><path d="M5 19 L5 15 L15 5 L19 9 L9 19 Z" /><line x1="13" y1="7" x2="17" y2="11" /></React.Fragment>,
  bulb: <React.Fragment><path d="M12 4 a6 6 0 0 1 4 10 c-1 1 -1 1 -1 2 H9 c0 -1 0 -1 -1 -2 a6 6 0 0 1 4 -10 Z" /><line x1="9.5" y1="18" x2="14.5" y2="18" /><line x1="10.5" y1="21" x2="13.5" y2="21" /></React.Fragment>,
  trophy: <React.Fragment><path d="M7 4 H17 V9 a5 5 0 0 1 -10 0 Z" /><path d="M7 5 H4 V7 a3 3 0 0 0 3 3" /><path d="M17 5 H20 V7 a3 3 0 0 0 -3 3" /><line x1="12" y1="14" x2="12" y2="17" /><path d="M8 20 H16 L15 17 H9 Z" /></React.Fragment>,
  book: <React.Fragment><path d="M12 6 C10 5 7 5 4 5 V18 C7 18 10 18 12 19" /><path d="M12 6 C14 5 17 5 20 5 V18 C17 18 14 18 12 19" /></React.Fragment>,
  user: <React.Fragment><circle cx="12" cy="8" r="3.4" /><path d="M5 20 a7 7 0 0 1 14 0" /></React.Fragment>,
  flame: <path d="M13 3 c1 4 4 5 4 9 a5 5 0 0 1 -10 0 c0 -3 2 -4 3 -6 c0 2 1 3 2 3 c1 -2 -1 -3 -1 -6 Z" fill="currentColor" stroke="none" />,
  target: <React.Fragment><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" /></React.Fragment>,
  clock: <React.Fragment><circle cx="12" cy="12" r="8" /><polyline points="12,7 12,12 16,14" /></React.Fragment>,
  check: <polyline points="5,13 10,18 19,6" />,
  x: <React.Fragment><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></React.Fragment>,
  star: <path d="M12 3 L14.6 9 L21 9.4 L16 13.8 L17.6 20.4 L12 16.8 L6.4 20.4 L8 13.8 L3 9.4 L9.4 9 Z" fill="currentColor" stroke="none" />,
  lock: <React.Fragment><rect x="6" y="11" width="12" height="9" /><path d="M8.5 11 V8 a3.5 3.5 0 0 1 7 0 v3" /></React.Fragment>,
  gear: <React.Fragment><circle cx="12" cy="12" r="3.4" /><path d="M12 3 V6 M12 18 V21 M3 12 H6 M18 12 H21 M5.5 5.5 L7.6 7.6 M16.4 16.4 L18.5 18.5 M18.5 5.5 L16.4 7.6 M7.6 16.4 L5.5 18.5" /></React.Fragment>,
  grid: <React.Fragment><rect x="4" y="4" width="16" height="16" /><line x1="4" y1="9.3" x2="20" y2="9.3" /><line x1="4" y1="14.6" x2="20" y2="14.6" /><line x1="9.3" y1="4" x2="9.3" y2="20" /><line x1="14.6" y1="4" x2="14.6" y2="20" /></React.Fragment>,
  zen: <circle cx="12" cy="12" r="8" />,
  plus: <React.Fragment><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></React.Fragment>,
  bolt: <path d="M13 3 L6 13 H11 L10 21 L18 10 H13 Z" fill="currentColor" stroke="none" />,
  bullet: <g fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" /></g>,
  mail: <React.Fragment><rect x="3" y="6" width="18" height="12" /><polyline points="3,7 12,13 21,7" /></React.Fragment>,
  apple: <path d="M17.5 12.4 c0 -1.7 1.3 -2.5 1.4 -2.6 c-.8 -1.1 -2 -1.2 -2.4 -1.2 c-1 -.1 -2 .6 -2.5 .6 c-.5 0 -1.4 -.6 -2.3 -.6 c-1.2 0 -2.3 .7 -3 1.8 c-1.3 2.2 -.3 5.6 .9 7.4 c.6 .9 1.3 1.9 2.2 1.9 c.9 0 1.2 -.6 2.3 -.6 c1.1 0 1.4 .6 2.3 .6 c1 0 1.6 -.9 2.2 -1.8 c.5 -.7 .7 -1.4 .7 -1.4 c0 0 -1.4 -.5 -1.4 -2.1 Z M15.2 7 c.5 -.6 .8 -1.5 .7 -2.4 c-.8 0 -1.7 .5 -2.2 1.2 c-.5 .6 -.9 1.5 -.7 2.3 c.9 .1 1.7 -.5 2.2 -1.1 Z" fill="currentColor" stroke="none" />,
};

function Icon({ name, size, className, strokeWidth }) {
  const inner = ICONS[name];
  if (!inner) return null;
  const s = size || 20;
  return (
    <svg className={'ic' + (className ? ' ' + className : '')} width={s} height={s}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth || 2.2} strokeLinecap="square" strokeLinejoin="miter"
      shapeRendering="geometricPrecision" aria-hidden="true">
      {inner}
    </svg>
  );
}

Object.assign(window, { Icon, ICONS });
