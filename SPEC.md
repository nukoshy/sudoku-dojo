# Sudoku Dojo — Implementation Spec

This document is a Claude Code implementation spec. Follow it precisely. Do not add features not listed here. Do not invent abstractions beyond what is needed. When in doubt, do less and ask.

---

## What You Are Building

A web app where every Sudoku puzzle is dynamically Elo-rated and matched to the player's personal rating — like Chess.com's puzzle system, but for Sudoku. The rating system is the product. Everything else (theme, sound, belts) serves it.

Visual direction: **Pixel Dojo** — cream washi paper background, hard 2px pixel shadows (no blur), hanko ink stamp accents, pixel-art number style. Cozy, retro Japanese. Think Stardew Valley meets Famicom.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 + TypeScript | Strict mode on |
| Routing | React Router v6 | |
| State | Zustand | One store per domain (see below) |
| Styling | Tailwind CSS v3 | Custom design tokens in `tailwind.config.ts` |
| Animation | Framer Motion | Respect `prefers-reduced-motion` |
| Audio | Web Audio API | No external library |
| Backend | Supabase | Auth + Postgres + Realtime for leaderboard |
| Payments | Stripe | Embedded Checkout |
| Build | Vite | |

Do not add any other dependencies without explicit approval.

---

## Project Structure

```
src/
  engine/
    generator.ts      Sudoku puzzle generator
    solver.ts         Constraint-propagation + backtrack solver
    difficulty.ts     Glicko-based puzzle rating calculator
    rating.ts         Player Elo update logic
    techniques.ts     Technique detection (which techniques a puzzle requires)
  stores/
    auth.ts           Supabase auth state
    game.ts           Active puzzle state
    player.ts         Rating, belts, streaks, achievements
    settings.ts       Sound, motion prefs
    leaderboard.ts    Cached leaderboard data
  screens/
    Onboarding.tsx
    Home.tsx
    Play.tsx
    Profile.tsx
    Leaderboard.tsx
    Techniques.tsx
    Paywall.tsx
  components/
    Grid.tsx          9x9 board
    Cell.tsx          Single cell
    NumberPad.tsx     1–9 + erase/hint/undo/notes
    BeltBadge.tsx     Belt rank display
    HankoStamp.tsx    Achievement stamp
    Sparkline.tsx     Rating history graph
    UpgradePrompt.tsx Inline paywall nudge (never a modal takeover)
  audio/
    engine.ts         WebAudio context + sound generators
    sounds.ts         Individual sound definitions
  lib/
    supabase.ts       Supabase client
    stripe.ts         Stripe client
  styles/
    tokens.css        Design tokens (colors, spacing, pixel shadow util)
```

---

## Design Tokens

Define in `tailwind.config.ts` and `tokens.css`:

```
--color-paper:      #F5EFD6   (cream washi)
--color-ink:        #1C1A15   (near-black)
--color-ink-light:  #6B6455   (medium brown)
--color-accent:     #C0392B   (hanko red)
--color-gold:       #D4A017
--color-highlight:  #E8D9B0   (selected cell)
--color-related:    #EDE5C8   (same row/col/box as selected)

--shadow-pixel:     2px 2px 0px var(--color-ink)   (hard pixel shadow, no blur)
--radius-none:      0px                             (no rounded corners anywhere)
--font-display:     "Press Start 2P" (Google Fonts) (headings, numbers)
--font-body:        "Noto Sans JP" (Google Fonts)   (all body text)
```

No blur-based shadows anywhere. All shadows are hard offset using `--shadow-pixel`. No border-radius. This is the pixel-art constraint.

---

## Engine

### Puzzle Generator (`engine/generator.ts`)

Generate valid 9x9 Sudoku puzzles with a unique solution. Use a backtracking algorithm seeded with a shuffled base grid. Expose:

```ts
generatePuzzle(difficulty: DifficultyTarget): Puzzle
// DifficultyTarget = { minBlanks: number, maxBlanks: number }
```

Blank counts by target difficulty band:
- 1000–1199 rating: 35–40 blanks
- 1200–1399: 41–46 blanks
- 1400–1599: 47–51 blanks
- 1600+: 52–58 blanks

### Solver (`engine/solver.ts`)

Constraint propagation first (eliminates candidates), then backtrack for the remainder. Must solve any valid puzzle. Used for:
1. Verifying a generated puzzle has exactly one solution
2. Checking user solutions

### Difficulty Scorer (`engine/difficulty.ts`)

After generating a puzzle, score it by running the solver and tracking which techniques were required, in order. Score = weighted sum of technique difficulty:

| Technique | Weight |
|---|---|
| Naked Single | 1 |
| Hidden Single | 2 |
| Naked Pair | 4 |
| Hidden Pair | 6 |
| Pointing Pairs | 5 |
| Box-Line Reduction | 5 |
| X-Wing | 10 |
| Swordfish | 15 |
| Y-Wing | 12 |
| Backtrack required | 25 |

Map raw score to initial Elo rating: 800 + (raw_score * 8), clamped to [800, 2200].

### Rating Engine (`engine/rating.ts`)

Use the Glicko-2 algorithm. Do not invent a custom system. Both players and puzzles have:
- `rating: number` (starts at 1200 for players, calculated for puzzles)
- `rd: number` (rating deviation, starts at 350 for new players)
- `sigma: number` (volatility, starts at 0.06)

Player rating updates after each rated solve. Puzzle rating updates after each rated solve (treat player as "opponent").

Outcomes:
- Win (solved): outcome = 1.0
- Loss (failed / timed out): outcome = 0.0
- No partial credit.

Do not apply rating changes in Zen Mode.

---

## Stores

### `stores/game.ts`

```ts
interface GameStore {
  puzzle: Puzzle | null
  solution: number[][]
  userGrid: (number | null)[][]
  candidates: Set<number>[][][]   // pencil marks
  mode: 'rated' | 'zen'
  timeControl: 'bullet' | 'blitz' | 'rapid' | null
  zenDifficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | null
  timeRemaining: number | null    // seconds, null in zen
  mistakes: number
  hintsUsed: number
  hintsRemaining: number          // 3 per puzzle, daily refill
  selectedCell: [number, number] | null
  notesMode: boolean
  isPaused: boolean
  status: 'idle' | 'playing' | 'complete' | 'failed'
  // actions
  startGame(mode, timeControl | zenDifficulty): void
  selectCell(row, col): void
  placeNumber(n: number): void
  eraseCell(): void
  toggleNote(n: number): void
  useHint(): void
  undo(): void
  pause(): void
  resume(): void
}
```

### `stores/player.ts`

```ts
interface PlayerStore {
  userId: string | null
  nickname: string
  rating: number
  rd: number
  sigma: number
  ratingByControl: Record<'bullet'|'blitz'|'rapid', { rating, rd, sigma }>
  belt: Belt
  puzzlesSolved: number
  dailyStreak: number
  bestStreak: number
  lastSolvedDate: string | null
  achievements: Achievement[]
  ratingHistory: { date: string, rating: number }[]
  isPremium: boolean
}
```

### `stores/settings.ts`

```ts
interface SettingsStore {
  soundEnabled: boolean
  ambientEnabled: boolean
  reducedMotion: boolean   // sync with prefers-reduced-motion on init
  streakVisible: boolean
}
```

---

## Screens

### `/onboarding`

Three screens rendered as steps inside one route, no URL change between steps.

**Step 1 — Welcome**
- 「数独道場」 in `--font-display`, centered
- "Sudoku Dojo" below in smaller display font
- Tagline: "The art of mindful numbers."
- One button: "Begin" — pixel style with hard shadow

**Step 2 — Choose Your Path**
- Heading: "Choose Your Path" + 「道を選べ」 subtitle
- Four rank cards in a 2x2 grid. Each card:
  - Belt color swatch (pixel style)
  - Japanese name large, English name small
  - Skill description in one line
- Selecting a card: press animation (scale down 0.95, snap back). Hanko-stamp sound.
- "Continue" button appears after selection.

**Step 3 — Personalize**
- Nickname text input (max 20 chars, no empty)
- Sound toggle
- Ambient toggle
- "Enter the Dojo" CTA → navigates to `/play`, starts first game

On submit: save to Supabase if user is logged in, otherwise localStorage.

### `/` (Home)

- Header: user belt badge + nickname + rating number
- Two main CTAs:
  - "Rated" card — shows three time control options (Bullet / Blitz / Rapid) as sub-buttons. Free users see only the daily puzzle option here; second rated game shows `<UpgradePrompt>` inline.
  - "Zen" card — shows five difficulty options (Beginner → Expert).
- Below: mini stats row (streak, puzzles solved, today's count)
- No full navigation on this screen — just the play CTAs and a minimal profile link

### `/play`

Layout (desktop): left sidebar | grid (center) | right sidebar.
Layout (mobile): grid top, number pad below.

**Left sidebar:**
- Timer (countdown for rated, elapsed for zen, hidden if paused)
- Difficulty rating badge ("1 340" or "Zen · Medium")
- Pause button

**Grid (center):**
- 9x9 cells. 3x3 box borders are 2px ink; inner cell borders are 1px lighter.
- Selected cell: `--color-highlight` background.
- Related cells (same row/col/box): `--color-related` background.
- Pre-filled numbers: `--color-ink`, slightly bolder.
- User-entered numbers: `--color-ink-light`.
- Wrong entry: brief pixel-pulse animation (cell border flashes red, 200ms). No persistent red color.
- Pencil marks: 3x3 grid of tiny numbers in each cell.

**Right sidebar:**
- Number pad 1–9, 3x3 grid. Each button has hard pixel shadow.
- Below pad: Erase | Notes toggle | Hint | Undo (row of 4 icon buttons)
- Hint button shows remaining count badge.

**On completion:**
- Grid shimmers (opacity pulse, 600ms).
- Completion card slides up from bottom (Framer Motion `y: "100%" → y: 0`):
  - Time taken / Time limit
  - Mistakes: n
  - Hints used: n
  - Rating change: +NN / −NN (animated count-up)
  - New belt notification if rank advanced
  - "New Puzzle" button

**On fail (timeout or too many mistakes — set limit at 5):**
- Red-tinted overlay (10% opacity, no full cover).
- Fail card slides up:
  - "Puzzle failed."
  - Rating change (negative).
  - If the puzzle required a technique the player hasn't learned: "This puzzle needed X-Wing. Learn it in the Technique Dojo."
  - "Try Again" | "New Puzzle"

### `/profile`

- Avatar circle (initials fallback), nickname, belt badge
- Rating number large, Glicko RD as a small ± range: "1 340 ±42"
- Sparkline graph: rating over last 30 solves (SVG line, no axis labels needed)
- Stats grid: Puzzles solved | Daily streak | Best streak | Avg time | Accuracy %
- Per-control ratings: Bullet / Blitz / Rapid / Zen, each as a small card with rating
- Hanko stamp collection: grid of round stamps, filled = earned, faint circle = locked
- Free users: rating history graph shows blurred/locked state with `<UpgradePrompt>`
- Free users: belts above White Belt shown as silhouettes

### `/leaderboard`

- Tabs: Global (weekly reset) | Friends | By Difficulty
- Each row: rank number | belt swatch | nickname | rating | puzzles this week | streak flame icon + count
- Current user's row is pinned at bottom if not in top 20
- Free users cannot appear on the leaderboard; banner at top: "Join the leaderboard — upgrade to Dojo Pass"

### `/techniques`

- Scrollable list of technique "scrolls" (pixel-art parchment card style)
- Each scroll: technique name (English + Japanese) | short description | "Practice" button
- First 3 techniques unlocked for all users. Rest: locked state with preview text
- Free users clicking locked technique: inline `<UpgradePrompt>`, no navigation away
- Active lesson view: explanation text + interactive mini-board pre-filled to demonstrate the technique. User must apply the technique to continue.

---

## Navigation

Bottom tab bar (mobile) / left sidebar nav (desktop) with 5 items:
Home | Play | Leaderboard | Techniques | Profile

Show a lock icon on Leaderboard for free users (they can still view, just can't appear).

---

## Audio

All sounds generated via Web Audio API — no audio files. Implement in `audio/engine.ts`.

| Event | Sound |
|---|---|
| Place number (pen) | Short click + soft noise burst, 80ms |
| Place note (pencil) | Lighter, higher frequency, 60ms |
| Erase | White noise sweep down, 50ms |
| Error | Low soft thud, 120ms |
| Hint used | Sine glide up, 200ms |
| Puzzle complete | Chord (C major pentatonic, 3 notes) + long sine decay |
| Button click | Short tick, 40ms |
| Belt advance | Ascending 3-note fanfare |
| Stamp earned | Soft stamp thud |

Ambient loop (optional, settings-gated): gentle pink noise + occasional sine pings at irregular intervals.

All audio calls: check `settings.soundEnabled` before playing. If `AudioContext` is locked (browser autoplay policy), resume on first user gesture.

---

## Monetization Gates

Free tier:
- 1 rated puzzle per day
- Unlimited Zen Mode
- First 3 techniques
- View leaderboard (cannot appear on it)
- All hanko stamps earnable
- White Belt only (higher belts shown locked)
- Profile stats visible; rating history graph locked

Dojo Pass (premium):
- Unlimited rated puzzles
- Full technique library
- Leaderboard participation
- Rating history graph
- All belts unlockable
- Puzzle Rush mode (post-MVP)

**Rules (non-negotiable):**
- Never hide premium features — show them locked, never remove them from the UI
- Never interrupt a puzzle in progress with an upgrade prompt
- Zen Mode is always 100% free
- Daily rated puzzle is always free

### `<UpgradePrompt>` component

Used inline wherever a free user hits a gate. Not a full-screen modal. Props:
```ts
{ feature: string, message: string, onUpgrade: () => void, onDismiss?: () => void }
```
Renders as a small card with pixel border, brief message, and "Get Dojo Pass" button.

### `/paywall`

Full pricing screen, navigated to from any "Get Dojo Pass" button:
- Monthly ($3.99) | Yearly ($24.99, highlighted as "Best value")
- One CTA: "Start Dojo Pass"
- Stripe Embedded Checkout
- On success: update `player.isPremium` in Supabase, unlock all gates immediately

---

## Supabase Schema

```sql
-- Users table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  nickname text not null,
  rating int not null default 1200,
  rd int not null default 350,
  sigma float not null default 0.06,
  belt text not null default 'white',
  puzzles_solved int not null default 0,
  daily_streak int not null default 0,
  best_streak int not null default 0,
  last_solved_date date,
  is_premium boolean not null default false,
  created_at timestamptz default now()
);

-- Per-control ratings
create table control_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  control text not null,  -- 'bullet', 'blitz', 'rapid'
  rating int not null default 1200,
  rd int not null default 350,
  sigma float not null default 0.06,
  unique(user_id, control)
);

-- Puzzle library
create table puzzles (
  id uuid primary key default gen_random_uuid(),
  givens text not null,     -- 81-char string, '0' for blanks
  solution text not null,
  rating int not null,
  rd int not null default 200,
  sigma float not null default 0.06,
  techniques text[] not null,  -- techniques required
  created_at timestamptz default now()
);

-- Solve history
create table solves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  puzzle_id uuid references puzzles not null,
  mode text not null,           -- 'rated' | 'zen'
  control text,                 -- 'bullet' | 'blitz' | 'rapid' | null
  outcome text not null,        -- 'win' | 'loss'
  time_seconds int,
  mistakes int not null default 0,
  hints_used int not null default 0,
  rating_before int,
  rating_after int,
  rating_delta int,
  solved_at timestamptz default now()
);

-- Achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  achievement_key text not null,
  earned_at timestamptz default now(),
  unique(user_id, achievement_key)
);
```

Enable Row Level Security on all tables. Users can only read/write their own rows.

---

## Belts

| Belt | Min Rating | Min Puzzles |
|---|---|---|
| White 白帯 | 0 | 0 |
| Yellow 黄帯 | 1100 | 10 |
| Green 緑帯 | 1250 | 30 |
| Brown 茶帯 | 1400 | 75 |
| Black 黒帯 | 1600 | 150 |
| Sensei 師匠 | 1800 | 300 |

Check belt advancement after every rated solve. If a user qualifies for a higher belt, advance immediately and trigger the belt-advance animation + sound.

---

## Achievements

| Key | Japanese | Condition |
|---|---|---|
| `first_solve` | 初段 | First puzzle solved |
| `streak_7` | 連続 | 7-day streak |
| `perfect_solve` | 完璧 | Solve with 0 mistakes, 0 hints |
| `speed_solve` | 速度 | Solve Bullet puzzle in under 90s |
| `century` | 山 | 100 puzzles solved |

Check all conditions after every solve. Award immediately if met, never twice.

---

## Keyboard Support

On the game screen:
- Arrow keys: move cell selection
- 1–9: place number (or note if notes mode active)
- Delete / Backspace: erase cell
- N: toggle notes mode
- Z: undo
- H: use hint
- P: pause/resume
- Escape: pause

---

## Accessibility

- All interactive elements keyboard-reachable with visible focus ring
- `aria-label` on all icon-only buttons
- `aria-live="polite"` on rating changes and error messages
- Check `prefers-reduced-motion` on init; if true, disable all Framer Motion animations (set `duration: 0`)
- Color is never the only indicator of state (wrong cell uses both color pulse and icon)
- Font sizes no smaller than 12px

---

## Implementation Order

Build in this sequence. Do not skip ahead. Each phase must be working before the next begins.

**Phase 1 — Engine**
1. `engine/generator.ts` with unit tests
2. `engine/solver.ts` with unit tests
3. `engine/difficulty.ts`
4. `engine/rating.ts` (Glicko-2)

**Phase 2 — Core Game Loop**
5. Zustand stores: `game.ts`, `player.ts`, `settings.ts`
6. Design tokens in Tailwind config
7. `Grid.tsx` + `Cell.tsx` + `NumberPad.tsx` — static, no stores wired
8. Wire game store into Grid + NumberPad
9. `/play` screen with working puzzle, completion, and fail states
10. Audio engine with all game sounds

**Phase 3 — Onboarding + Home**
11. `/onboarding` (3 steps, localStorage persistence)
12. `/` Home screen with mode selection

**Phase 4 — Backend**
13. Supabase project setup + schema
14. `lib/supabase.ts` client
15. Auth (email + Google, magic link)
16. Profile sync (reads and writes from Supabase, falls back to localStorage for guests)

**Phase 5 — Profile + Leaderboard + Techniques**
17. `/profile`
18. `/leaderboard` with Supabase Realtime
19. `/techniques` with interactive lessons

**Phase 6 — Monetization**
20. Stripe integration
21. Premium gates throughout the app
22. `/paywall` screen

---

## What This Is Not

- No social features beyond leaderboard (no comments, no follows, no sharing to social)
- No multiplayer
- No native mobile app (web only, but must work well on mobile browsers)
- No puzzle editor
- No user-generated puzzles
- No dark mode (the pixel-dojo palette is the only theme)
- Puzzle Rush is post-MVP; build the gate UI but not the mode itself
