# Sudoku Dojo — Monetization

## Model

Freemium + subscription. $3–4/month or $20–25/year.

Two tiers: **Free** and **Dojo Pass (Premium)**.

---

## Where the Paywall Lives in the Flow

### Home / Dashboard
Free users see the daily rated puzzle as their primary CTA. Premium features (Puzzle Rush, leaderboard) are visible but locked — shown with a subtle lock icon and "Dojo Pass" label. Not hidden, just gated.

### Onboarding
No paywall during onboarding. Let the user finish setup and play their first puzzle completely free. Do not mention pricing until after the first solve.

### After the First Solve (Upgrade Prompt — First Touch)
After completing the first puzzle, show a one-time soft prompt:
- Show what their rating is and what it means
- Show what they unlock with Dojo Pass (unlimited rated puzzles, full leaderboard, technique loop)
- Two options: "Start Free" or "Get Dojo Pass"
- Dismissible — not a hard gate

### Game Screen
- Free users get: 1 daily rated puzzle + unlimited Zen Mode
- When a free user tries to start a second rated puzzle in the same day, show an inline upgrade prompt inside the game screen — not a modal takeover. Something like: "You've used your daily rated puzzle. Upgrade to Dojo Pass for unlimited rated games — or play Zen Mode now."
- Zen Mode is always accessible, never gated

### Technique Dojo (/techniques)
- First 3 techniques are free and fully interactive
- Remaining techniques show a locked state with a preview of what the lesson covers
- When a free user clicks a locked technique: small upgrade prompt appears — "Unlock the full Technique Library with Dojo Pass"

### Leaderboard (/leaderboard)
- Free users can view the global leaderboard but cannot appear on it
- A banner at the top: "Join the leaderboard — upgrade to Dojo Pass"

### Profile (/profile)
- Free users see their streak, puzzles solved, and current rating
- Rating history graph is locked (shown as a blurred/faded preview)
- Belt progression stops at White Belt — higher belts show as locked silhouettes
- Hanko stamps are fully visible and earnable for free (no paywall on achievements)

### Puzzle Rush (/puzzle-rush)
- Entire mode locked for free users
- Shown in navigation with a lock icon
- Clicking it shows a full-screen upgrade prompt with a preview of how Puzzle Rush works

---

## Upgrade Flow

When any upgrade prompt is clicked:
1. Show a simple pricing screen — Monthly vs Yearly, with Yearly highlighted as best value
2. One CTA: "Start Dojo Pass"
3. Payment via Stripe
4. On success: unlock gates immediately, no page reload needed, show a brief "Welcome to the Dojo" confirmation

---

## Rules

- Never hide premium features entirely — always show them as locked so users know what they're missing
- Never interrupt a game in progress with an upgrade prompt
- Zen Mode is always 100% free — it is the safety net that keeps free users engaged
- The daily rated puzzle must always be free — it is the hook that shows users why the Elo system matters
- Do not add ads to the free tier
