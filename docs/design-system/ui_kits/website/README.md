# Website UI Kit — F1 Klub

React (JSX) recreation of the live F1Betting site, distilled into small
reusable components.

- `index.html` — interactive demo of the homepage flow:
  - Hero + upcoming-races list + leaderboard sidebar
  - "Place Bet" opens the betting modal
  - "Login" opens the login modal
  - Theme toggle (sun/moon) flips dark ↔ light
  - Language toggle flips DA ↔ EN copy
- `components.jsx` — Header, Hero, RaceCard, BetItem, LeaderboardSidebar,
  StatusBadge, PositionBadge, Button, FormField, LoginModal, BetModal.
- `data.js` — fake season data (races, drivers, members, bets).

These are **cosmetic recreations**, not production code — wiring is faked
with `useState` and in-memory data. Visual fidelity is the goal.
