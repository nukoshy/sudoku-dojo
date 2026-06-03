# Sudoku Dojo — Project Notes

## Visual direction: LOCKED to Variant C — Pixel Dojo
All screens going forward use the **Pixel Dojo** direction. Reference implementation:
`styles/pixel.css` + `screens/pixel.jsx`.

Key tokens (see `styles/pixel.css` `.pixel-root`):
- Palette: ink `#2c2018`, cream `#f3e4c3` / `#e7d2a6`, wall `#caa477`, tatami `#8fae6b`,
  red `#cf4b3a`, gold `#e8b24a`, blue `#3b6ea5` (user-entered numbers), yellow `#ffd34d` (selected).
- Fonts: "DotGothic16" (body/numerals), "Press Start 2P" (labels/headings, used sparingly at small px),
  "Zen Old Mincho" (kanji 道場/belt glyphs).
- Chrome: `.pixel-win` = cream window, 4px ink border, hard `6px 6px 0` shadow, inset cream-2 line.
  Buttons: 3px ink border + `3px 3px 0` shadow; pressed/active state removes shadow and
  `translate(3px,3px)`, fills red or gold.
- Scene: wall gradient → tatami floor with seam grid (`.pixel-root::before`), rising-sun disc
  (`.pixel-sun`, game screens only).
- Pixel aesthetic: `image-rendering: pixelated`, no anti-aliased gradients on UI, hard shadows only.

Shared puzzle/rank data lives in `screens/data.jsx`.

## Concept
Sudoku Dojo — every puzzle is dynamically Elo-rated and matched to the player. See `uploads/concept.md`.

## Status
- Visual exploration done (`Sudoku Dojo — Visual Directions.html`). Variants A & B retained there for reference only.
- Flow: Welcome → **Auth** (Email/Google/Apple, `app/auth.jsx`) → **Familiarity** (one question: New/Basics/
  Experienced → seeds rating) → Home → game → completion → Home. Pixel Dojo direction. (Old nickname/level/
  Personalize onboarding screens removed; sfx defaults on.)
- **Rated = chess-style time controls** (`TIME_CONTROLS`: Bullet 3min/14 blanks/1 hint, Blitz 7/24/2,
  Rapid 15/34/3), each with its OWN rating (`profile.ratings`) and a **countdown clock** that fails on timeout.
  **Zen = difficulty levels** (`LEVELS`: Beginner/Intermediate/Advanced/Expert), no clock, no rating.
  Difficulty is now genuinely different per mode (blanks/hints/time). `profile.rating` = max of the three.
- Home redesigned: RATED/禅 ZEN mode tabs → option cards (time controls vs levels) → big PLAY; circular
  **Avatar** (`app/home.jsx`); streak + stats rail + Puzzle Rush. Profile: circular avatar + chess.com-style
  per-control ratings list (expandable rows) + Puzzles/Insights + hanko stamps (`app/profile.jsx`).
  - Real solve logic: keyboard + pad entry, notes mode, hints, undo, erase, mistake counting, timer.
  - Difficulty (LEVELS): Beginner/Intermediate/Advanced/Expert set blanks (6/11/18/26), hint tokens
    (5/3/2/1) and matched puzzle Elo seed (500/1000/1500/1900). `buildBoard(emptyCount)` empties the
    first N of CANDIDATE_EMPTIES (notes cells forced first).
  - Elo model (chess.com-style): everyone starts at 400; level only sets difficulty. Solving commits a
    rating gain (provisional = bigger for first 5 solves) and increments solved/streak — Home reflects it.
    XP/Elo math still placeholder. Audio: interaction SFX only (idle ambient removed).
    Functional UI is English; Japanese is decorative only (titles, belt kanji, seals).
  - Welcome wordmark sits on a cream signboard plate for readability.
  - **Home = chess.com-style dashboard**: Today's Match card with a per-game DIFFICULTY picker
    (Beginner/Intermediate/Advanced/Expert) + PLAY, a Recent Games table (level/result/time/Elo),
    a streak card (炎), a stats rail (rating/solved/games/best streak), and nav rows
    (Profile live; Leaderboard/Techniques SOON).
  - **Profile/Stats page** (`app/profile.jsx`): rating hero + rating-history sparkline, summary cards
    (solved/streak/best/games), and Sudoku.com-style per-difficulty tabs (games started, solved, win rate,
    clean solves, best time, puzzle Elo). Difficulty is chosen per game from Home or Profile; stats commit
    per difficulty in `commitResult` (played on start, solved/cleanTime on finish). `profile.history` feeds
    Recent Games + sparkline.
  - Exit paths from game: footer MENU + pause "QUIT TO MENU" → Home. Completion card has close (✕) + MENU.
- **Feature layer** (`app/content.jsx` = belt ranks + techniques + stamps + leaderboard roster):
  - Rating system: game screen shows a RATING BADGE (earned belt + your rating + puzzle Elo); completion
    commits a gain, and **failing (3 mistakes) commits a loss** + resets streak. No vanity floor.
  - Teaching loop: 3 mistakes → fail card suggests the difficulty's technique → `app/lesson.jsx` Lesson
    surface (interactive: tap the cell it solves, then see the steps). Techniques library lists all
    patterns, locked by belt rank; the fail-loop opens locked ones directly.
  - Sound design (`app/audio.jsx`): felt-tip pen, HB pencil, rubber erase, soft brush error, page-turn hint,
    chimes+bell win, descending lose, paper-tap on buttons. Idle ambient stays removed.
  - Profile: earned belt rank (White→Sensei by rating) + hanko-stamp achievements (初段/連続/完璧/速度/山,
    earned = red ink, unearned = faint dashed).
  - Leaderboard (`app/leaderboard.jsx`): Global/Friends, fictional roster, player slotted by rating, weekly note.
  - Zen Mode toggle on Home: no timer, no rating, no mistakes, no stat commit — practice only.
  - **Icon system** (`app/icons.jsx` = pixel/crisp SVG `Icon`): icons on game tools, buttons, stats, nav.
  - **Bottom tab bar** (`app/nav.jsx` `TabBar`): Home/Ranks/PLAY/Learn/Profile across hub screens
    (home/leaderboard/techniques/profile). Hub screens have padding-bottom to clear it. Back buttons sit
    top-left (game has a top-left MENU; sub-pages a top-left HOME/BACK).
- **Monetization** (`app/paywall.jsx`): freemium + Dojo Pass (`profile.premium`). Free = 1 daily rated puzzle
  (`dailyRatedUsed` vs `FREE_DAILY_RATED`) + unlimited Zen; gates shown, never hidden:
  - Home: Dojo Pass upgrade chip (gold) / member badge; "1 free rated today" line; Puzzle Rush rail card
    locked for free.
  - Game: 2nd rated/day → inline `rated-gate` (blurred board) offering Zen or Dojo Pass — never a takeover.
  - After first solve → one-time soft `FirstSolvePrompt` (rating reveal + unlocks, Start Free / Get Pass).
  - Techniques: first 3 free (`techLockedFree`), rest open the paywall. Leaderboard: free is view-only +
    upgrade banner, player slotted only when premium. Profile: rating-history sparkline blurred + belt-path
    locked silhouettes for free; hanko stamps always free.
  - Puzzle Rush (`PuzzleRush`): locked preview + upgrade for free, "coming soon" for premium (mode not built).
  - Paywall: Monthly $3.50 / Yearly $24 (best value), Start Dojo Pass → premium=true → WelcomeConfirm,
    gates unlock immediately. Placeholder checkout (no real Stripe). No ads anywhere.
- Not built yet: Daily Challenge, real Puzzle Rush gameplay, real Glicko math, real Stripe/social data.
