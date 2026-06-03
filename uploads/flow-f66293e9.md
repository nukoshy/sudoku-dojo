# Sudoku Dojo — UX Flow

## Pages

```
/             Home
/onboarding   First-time user setup
/play         Active game
/profile      Stats and achievements
/leaderboard  Rankings
/techniques   Technique library
```

---

## Onboarding (/onboarding)

Three screens. Unhurried, minimal.

**Screen 1 — Welcome**
App name fades in: 「数独道場」 above, "Sudoku Dojo" below.
Tagline: *"The art of mindful numbers."*
One button to begin.

**Screen 2 — Choose Your Path**
User picks their starting rank. Four cards:

| 白帯 Shiro-obi | White Belt | Beginner |
|---|---|---|
| 緑帯 Midori-obi | Green Belt | Intermediate |
| 黒帯 Kuro-obi | Black Belt | Advanced |
| 師匠 Shishou | Sensei | Expert |

Selecting a card feels like pressing a hanko ink stamp — a satisfying impression animation.

**Screen 3 — Personalize**
- Nickname input
- Toggle: sound effects
- Toggle: ambient sounds
- CTA: "Enter the Dojo" → /play

---

## Game Screen (/play)

### Layout
- Center: 9x9 grid
- Left sidebar: timer, difficulty rating, controls
- Right sidebar: number pad (1–9), erase, hint, undo, notes toggle
- Mobile: number pad below grid

### Interactions
- Click cell to select. Related cells (same row/col/box) get the subtlest possible tint.
- Click number or press 1–9 to place. Number animates in like ink settling on paper.
- Wrong number: gentle visual pulse, soft sound. Not a buzzer, not a red screen.
- Notes mode: smaller candidate numbers in cell corners. Different sound (pencil vs pen).
- Erase: rubber eraser sound.
- Hint: one cell revealed with soft glow. Costs a hint token (3 per puzzle, refills daily).
- Undo: reverts last action.
- Pause: blurs the grid.

### Completion
Grid shimmers softly. Completion card slides up from the bottom:
- Time, mistakes, hints used
- XP gained (animated count-up)
- Rating change
- CTA: New Puzzle

Sound: wind chimes + distant temple bell.

---

## Profile (/profile)

- Rating with sparkline history graph
- Puzzles solved, daily streak, best streak
- Average solve time by difficulty
- Accuracy rate
- Current rank/belt with progression bar
- Hanko achievement stamp collection

---

## Leaderboard (/leaderboard)

Tabs: Global (weekly reset) | Friends | By Difficulty
Each row: rank, name, rating, puzzles this week, streak.

---

## Technique Dojo (/techniques)

Solving technique library. Each technique is a scroll — locked or unlocked based on rank.
Each scroll contains: name (English + Japanese), explanation, interactive mini-puzzle.
Unlocking a new technique feels like progression, not just reading a wiki.
