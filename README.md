# 数独道場 — Sudoku Dojo

Sudoku, but it knows your level.

Every puzzle is rated. Every game moves your score. You climb a belt rank, appear on a real leaderboard, and the dojo always puts you against a puzzle that challenges — not frustrates — you.

🔴 **[Play now → sudoku-web-production.up.railway.app](https://sudoku-web-production.up.railway.app)**

---

## The idea

Most Sudoku apps give you three buttons: Easy, Medium, Hard. You pick one, you get a puzzle, nothing changes.

Sudoku Dojo works like chess.com. You have a rating. Every puzzle has a rating. Win — you gain points. Lose — you drop a few. Over time your rating settles exactly where your skill is, and the puzzles match it.

It's the same loop that makes chess.com and Duolingo addictive — **you're always playing at the edge of your ability**.

---

## Two ways to play

**Rated** — real stakes, real clock, real Elo movement.

Pick a time control and go. Solve within the limit, gain rating. Run out of time or make three mistakes, lose rating. Your Bullet, Blitz, and Rapid ratings track separately, like chess.

| | Bullet | Blitz | Rapid |
|--|--------|-------|-------|
| Clock | 3 min | 7 min | 15 min |
| Blanks | 35 | 45 | 55 |
| Hints | 1 | 2 | 3 |

**Zen** — no clock, no rating, no pressure. Just solve.

Four difficulty levels from Beginner to Expert. Nothing at stake. Good for learning, warming up, or just unwinding.

---

## How the rating works

Your rating is standard Elo — the same math used in chess. A beginner starts around 400. Beat a puzzle rated higher than you, gain more. Lose to an easier one, drop less.

Your first 20 games are provisional, so the swings are bigger — the system is still figuring out where you belong. After that it stabilises.

---

## Belts

Your overall rating earns you a belt rank, shown everywhere in the UI.

| Belt | Rating |
|------|--------|
| White | 0 |
| Yellow | 550 |
| Green | 750 |
| Brown | 1050 |
| Black | 1400 |
| Sensei | 1800 |

---

## The dojo teaches you

Fail a puzzle and the dojo doesn't just show you the solution — it identifies the technique the puzzle required and opens an interactive lesson. Tap the cell the technique unlocks, see why it works, then try again.

Five techniques from Naked Single up to X-Wing, each with a live demo board.

---

## Everything is real

- **Sign in** with email (magic link / OTP) or Google.
- **Your rating, streak, and history** are saved to your account and sync across devices.
- **The leaderboard** shows real players sorted by rating. Play a rated game and you appear automatically.
- **Every puzzle is unique** — generated fresh each game, never repeated, guaranteed to have exactly one solution.

---

## Freemium

Free tier gets one rated game per day plus unlimited Zen. **Dojo Pass** ($3.50/mo or $24/yr) removes the daily limit, unlocks the full technique library, and lets you appear on the leaderboard.

No ads. Ever.

---

## Screenshots

![Home](screenshots/03-n-home.png)
