# Sudoku Dojo — Features

## Rating System (The Core Feature)

Every puzzle has a numeric rating that adjusts dynamically based on aggregate solver performance — modeled on Glicko/Elo, the same system Chess.com uses for puzzle ratings. Players have a personal rating that adjusts after each solve.

**How it works:**
- Puzzle ratings move up when many players fail them, down when most players solve them easily
- Player rating moves up after solving puzzles at or above their level, down after failing below it
- Puzzles are matched to the player's current rating
- Rating changes are visible after every solve — gains and losses feel earned

**What to avoid (the Chess.com lesson):**
- No vanity inflation — solving a puzzle always gives at least X points is wrong
- No partial credit for abandoning
- The number must be accurate, not flattering

**Modes:**
- Rated Mode — every solve affects rating, puzzles matched to level
- Zen Mode — no timer, no rating change, no mistakes tracked. For relaxation only.

---

## Teaching Loop (Technique Dojo)

Not a standalone curriculum. Wired directly into the rating system.

**The loop:**
1. Player fails multiple puzzles that require a specific technique (e.g. X-Wing)
2. Rating data surfaces the pattern automatically
3. System offers a targeted technique lesson
4. Player works through an interactive mini-puzzle demonstrating the technique
5. System feeds rated puzzles that exercise that technique
6. Rating updates reflect the real improvement

Techniques taught: Naked Single, Hidden Single, Naked Pair, Hidden Pair, Pointing Pairs, Box-Line Reduction, X-Wing, Swordfish, Y-Wing.

Each technique has a name in English and Japanese. Lessons are short, interactive, and specific — not a wiki page.

---

## Sound Design

Every interaction has a sound. Quiet, analog, tactile. This is polish, not a pitch.

| Action | Sound |
|---|---|
| Place a number (pen mode) | Soft felt-tip marker on paper |
| Place a note (pencil mode) | Lighter HB pencil scratch |
| Erase | Gentle rubber on paper |
| Error | Soft brush tap — not a buzzer |
| Hint used | Soft page turn |
| Puzzle complete | Wind chimes + distant temple bell |
| Button click | Subtle paper tap |
| Ambient loop (optional) | Soft rain + quiet nature sounds |

---

## Rank Progression (Belt System)

Tied to rating and puzzles solved — not just time spent. Rank advances require real improvement.

White Belt → Yellow → Green → Brown → Black → Sensei

Displayed on profile and next to name on leaderboard.

---

## Achievements — Hanko Stamps

Round ink stamps (traditional Japanese hanko seals). Earned = full ink impression. Unearned = faint empty circle.

| Stamp | Condition |
|---|---|
| 初段 | First puzzle solved |
| 連続 | 7-day streak |
| 完璧 | Perfect solve — no mistakes, no hints |
| 速度 | Speed solve |
| 山 | 100 puzzles solved |

---

## Streaks

Daily streaks with a grace period (one missed day doesn't break it). Visible off-switch in settings — streaks should not feel manipulative.

---

## Social / Competitive Layer

- Daily rated puzzle with shareable result card
- Global leaderboard (weekly reset) + friends leaderboard
- Optional: Puzzle Rush mode — solve as many as possible in 3 minutes, 3 mistakes ends it

---

## Technical Stack

- React 18 + TypeScript
- React Router v6
- Zustand for state
- Framer Motion for animations
- Tailwind CSS
- Web Audio API for sound
- Sudoku generator + solver in pure TypeScript with Glicko-based difficulty scoring
- localStorage for guest mode; Supabase for auth, ratings, and leaderboard
- Full keyboard support: arrow keys, 1–9, Delete
- Respects `prefers-reduced-motion` and `prefers-color-scheme`
