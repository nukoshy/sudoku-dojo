# 数独道場 — Sudoku Dojo

A pixel-art Sudoku app prototype where **every puzzle is Elo-rated and matched to your skill**, like chess.com for Sudoku. Built as a single interactive HTML prototype in a retro "Pixel Dojo" visual style (cream washi paper, hard pixel shadows, hanko seals, tatami floor).

## Concept

Sit, breathe, solve. Rather than static "easy/medium/hard", Sudoku Dojo treats Sudoku like a competitive rated game: you earn a rating by playing, climb a belt rank (White → Sensei), and every puzzle is matched to where you are.

## Features

- **Two ways to play**
  - **Rated** — chess-style time controls (**Bullet** 3 min · **Blitz** 7 min · **Rapid** 15 min), each with its *own* rating and a countdown clock that fails you on timeout.
  - **Zen** — relaxed difficulty levels (Beginner → Expert), no clock, no rating, no pressure.
- **Real difficulty** — modes genuinely differ in blank count, hint budget, and time pressure.
- **Rating & belts** — start from a familiarity question, then gain/lose Elo per game (provisional swings for your first solves); earn belt ranks and **hanko-stamp achievements**.
- **Interactive grid** — keyboard + pad entry, pencil notes, hints, undo, erase, mistake tracking.
- **Teaching loop** — fail a puzzle and the dojo suggests the technique it needed, with an interactive lesson (Naked Single → X-Wing).
- **Leaderboard** — global / friends ranks with belt swatches.
- **Profile** — circular avatar, per-control rating list, rating-history sparkline, stats, and achievement stamps.
- **Monetization** — freemium with a **Dojo Pass** tier (gates shown, never hidden; no ads).
- **Sound design** — generated WebAudio SFX: felt-tip pen, pencil, eraser, page-turn hints, temple-bell win.

## Running

Open `index.html` in any modern browser. No build step, no dependencies to install — React + Babel are loaded from CDN and all logic is plain JSX.

```bash
# or serve locally
python3 -m http.server 8000
# then visit http://localhost:8000/index.html
```

## Structure

```
index.html                        App shell: screen routing, state, stage scaling
styles/dojo-app.css               All styling (Pixel Dojo design tokens)
app/
  data.jsx        Puzzle + solution, time controls, difficulty levels
  auth.jsx        Sign-in (Email / Google / Apple, mock)
  onboarding.jsx  Welcome + familiarity question
  home.jsx        Dashboard (Rated/Zen play, stats, avatar)
  game.jsx        Interactive board + completion / fail cards
  profile.jsx     Stats, per-control ratings, hanko stamps
  leaderboard.jsx Global / friends ranks
  lesson.jsx      Technique library + interactive lessons
  paywall.jsx     Dojo Pass freemium surfaces
  content.jsx     Belts, techniques, achievements, roster
  audio.jsx       WebAudio sound effects
  icons.jsx       Pixel icon set
  nav.jsx         Bottom tab bar
```

## Status

Interactive prototype. Puzzle data, Elo math, auth, and payments are illustrative placeholders — there is no backend, real rating model, or live data.
