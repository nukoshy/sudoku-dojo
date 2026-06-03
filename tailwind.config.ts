import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5EFD6',
        ink: '#1C1A15',
        'ink-light': '#6B6455',
        accent: '#C0392B',
        gold: '#D4A017',
        highlight: '#E8D9B0',
        related: '#EDE5C8',
        tatami: '#8FAE6B',
        wall: '#CAA477',
      },
      fontFamily: {
        display: ['"Press Start 2P"', 'monospace'],
        body: ['"Noto Sans JP"', 'sans-serif'],
      },
      boxShadow: {
        pixel: '2px 2px 0px #1C1A15',
        'pixel-lg': '4px 4px 0px #1C1A15',
        'pixel-press': '0px 0px 0px #1C1A15',
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
} satisfies Config;
