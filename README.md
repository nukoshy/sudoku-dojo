# 数独道場 — Sudoku Dojo

**Every puzzle is Elo-rated and matched to your skill** — like chess.com, but for Sudoku.
Pixel-art Japanese dojo aesthetic. Real auth. Real rating. Real leaderboard.

🔴 **Live → [sudoku-web-production.up.railway.app](https://sudoku-web-production.up.railway.app)**

---

## What it is

Sit, breathe, solve. Instead of static easy/medium/hard buckets, Sudoku Dojo gives every puzzle a difficulty rating and matches it to yours. Beat harder puzzles, gain Elo. Climb the belt ranks. Appear on the global leaderboard.

## Game modes

| Mode | Clock | Rating | Blanks | Hints |
|------|-------|--------|--------|-------|
| **Bullet** | 3 min ↓ | ✓ real Elo | 35 | 1 |
| **Blitz** | 7 min ↓ | ✓ real Elo | 45 | 2 |
| **Rapid** | 15 min ↓ | ✓ real Elo | 55 | 3 |
| **Zen Beginner** | — | — | 30 | 5 |
| **Zen Intermediate** | — | — | 40 | 3 |
| **Zen Advanced** | — | — | 50 | 2 |
| **Zen Expert** | — | — | 58 | 1 |

Rated modes fail on timeout or 3 mistakes and adjust your Elo in both directions. Zen is pure practice — no timer, no rating, no fail.

## Features

- **Real unique-solution puzzles** — constraint propagation + MRV backtracking generator. Every game is a fresh puzzle; never the same grid twice.
- **Standard Elo** — `K × (score − expected)` with K=40 provisional (<20 games), K=20 established. Puzzle Elo: Bullet 900 · Blitz 1100 · Rapid 1300.
- **Belt ranks** — White → Yellow → Green → Brown → Black → Sensei, earned by rating.
- **Real auth** — Supabase email OTP (magic link in email) + Google Identity Services.
- **Real leaderboard** — live Supabase query; your row appears automatically after your first rated game.
- **Real persistence** — ratings, streaks, history, achievements all saved per-user in Supabase.
- **Technique library** — 5 interactive lessons (Naked Single → X-Wing). Fail a puzzle and the dojo suggests the relevant technique.
- **Adaptive layout** — full-width mobile reflow below 760 px; fixed 1280×800 pixel-art canvas on desktop.
- **Synthesized audio** — 9 WebAudio SFX (felt-tip pen, pencil, eraser, page-turn hints, temple-bell win). No audio files.
- **Freemium** — 1 free rated game/day; Dojo Pass unlocks unlimited rated + leaderboard participation.

## Stack

The live site serves `export/` — a plain HTML + CDN-React prototype wired to real backends.

| Layer | Tech |
|-------|------|
| UI | React 18 (CDN + Babel), vanilla JS/JSX |
| Styling | Single CSS file (`dojo-app.css`) — Pixel Dojo design tokens |
| Auth | Supabase (email OTP + Google) |
| Database | Supabase Postgres (`dojo_profiles` jsonb · `leaderboard_entries`) |
| Hosting | Railway (Dockerfile, Node static server) |
| Fonts | DotGothic16 · Press Start 2P · Zen Old Mincho |

`src/` contains a full **React 18 + TypeScript + Vite** app (Zustand, Tailwind, Framer Motion, Glicko-2 engine) built to the original `SPEC.md`. It is not the deployed version but is production-complete.

## Running locally

```bash
# Serve the live prototype (export/) locally
node server.mjs          # http://localhost:3000

# Or develop the TypeScript app (src/)
npm install
npm run dev              # http://localhost:5173
npm run build            # typecheck + Vite build → dist/
npm run test             # 8 engine unit tests (solver, generator, Glicko-2)
```

## Backend setup

No setup needed to run locally — the prototype works in local-only mode with no backend.

To enable real auth and data, add these to Railway (or a `.env` file for local dev):

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
GOOGLE_CLIENT_ID=...
```

Then run the SQL files in Supabase → SQL Editor:

1. [`supabase/schema.sql`](supabase/schema.sql) — per-user profile table + RLS
2. [`supabase/leaderboard.sql`](supabase/leaderboard.sql) — public leaderboard table + RLS

In Supabase dashboard:
- **Auth → Providers → Google** → enable, paste client ID
- **Auth → URL Configuration → Site URL** → your Railway domain
- **Auth → Sign In / Providers → Email** → uncheck "Confirm email" (enables OTP flow)

## Repository structure

```
export/              Live production app (plain HTML + CDN React)
  app/
    generator.jsx    Sudoku solver + unique-solution puzzle generator
    game.jsx         Interactive board (notes, hints, undo, Elo calculation)
    auth.jsx         Email OTP + Google sign-in
    supabase.jsx     Backend layer (auth, profile persistence, leaderboard)
    leaderboard.jsx  Real Supabase leaderboard query
    content.jsx      Belts, Elo math, techniques, achievements
    home.jsx         Dashboard (Rated/Zen mode selection, stats)
    profile.jsx      Rating, belt path, hanko stamps
    ...
  styles/
    dojo-app.css     All styles + mobile adaptive rules
  index.html         App shell, screen routing, Elo commit, session restore

src/                 TypeScript app (not deployed — production-complete)
  engine/            Solver · generator · Glicko-2 · difficulty scorer
  stores/            Zustand: game · player · auth · leaderboard · settings
  screens/           Home · Play · Profile · Leaderboard · Techniques · Paywall
  components/        Grid · Cell · NumberPad · BeltBadge · Sparkline · ...

supabase/            SQL migration files
Dockerfile           Node static server (serves export/)
server.mjs           Dependency-free file server with SPA fallback + /config.js endpoint
railway.json         Railway deployment config
```
