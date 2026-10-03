# Frederikssund Formel 1 Klub — Design System

A tiny, focused design system for **Frederikssund Formel 1 Klub** — a private F1 betting site for a group of ~10 friends in Denmark. The site lets each friend bet on the top-3 finishers of every Formula 1 race for the season; points accumulate into a leaderboard and a (small, symbolic) cash pool. Bragging rights are the real prize.

> **Audience:** men, 50+, Danish-speaking, hobbyist F1 fans.
> **Tone:** plain, factual, race-paddock vibe, never gimmicky.
> **Bilingual:** Danish (default) with an English toggle.

---

## Sources

This system is reverse-engineered from the live codebase:

- **GitHub repo:** [`Djarnisdrengen/F1Betting`](https://github.com/Djarnisdrengen/F1Betting) — PHP + vanilla JS, MySQL/SQLite backend, no front-end framework.
- Imported reference files (read-only, kept for diffing):
  - `public/assets/css/style.css` — full live stylesheet
  - `public/includes/header.php` — global page chrome
  - `public/index.php` — homepage (races list + leaderboard sidebar)
  - `public/login.php`, `public/leaderboard.php`, `public/races.php`, `public/bet.php`, `public/profile.php`, `public/forgot_password.php`
  - `public/lang/user.php` — bilingual copy strings (DA + EN)
  - `public/assets/logo*.png`, `favicon.*`
  - `public/assets/js/app.js`

No Figma file was provided. No formal brand guidelines exist — the look has been distilled by reading the live CSS, copy, and screenshots of the running site.

---

## Index

| Path | What's inside |
|---|---|
| `README.md` | This document. Brand context + content + visual foundations + iconography. |
| `colors_and_type.css` | Drop-in CSS variables (colors, type, spacing, radii) + base type styles. |
| `SKILL.md` | Agent-Skill manifest so this system can be used inside Claude Code. |
| `assets/` | Logos, favicons. |
| `preview/` | Card thumbnails for the Design System tab. |
| `ui_kits/website/` | React (JSX) recreation of the live F1Betting site — header, hero, race card, leaderboard, login form, etc., plus an interactive `index.html` demo. |
| `public/` | The raw imported files from the F1Betting repo, for reference. |

---

## Brand at a glance

- **Name:** Frederikssund Formel 1 Klub _(Danish town near Copenhagen → "Formula 1 Club")_
- **Logo:** silhouette of an F1 car, half red / half white (or black, depending on theme), no wordmark in the mark itself. The wordmark is set in Chivo and sits next to the mark.
- **Primary color:** Formula 1 red `#e10600` — the official F1 brand red. Used sparingly: as a brand accent, primary-button background, active nav underline, focus ring, and tinted hover shadows. Never as a body-text color.
- **Default theme:** **dark.** A light theme exists but the site loads dark.
- **Type pairing:** **Chivo** (display, all headings + buttons + position badges) + **Manrope** (body). Both Google Fonts, loaded via `fonts.googleapis.com`.
- **Icon system:** Font Awesome 6 Free (solid + brands), self-hosted in `public/assets/fontawesome/`. Solid-fill style throughout, no emoji.

---

## CONTENT FUNDAMENTALS

### Voice
Direct, dry, race-paddock practical. The site sounds like a club newsletter someone in the group volunteered to write, not a marketing site. There are zero exclamation marks in chrome copy; the only `!` is in transient feedback like `Bet placeret!` ("Bet placed!") and `Perfekt!` for a perfect prediction.

### Person
**Du-form** in Danish (informal "you"), never the formal _De_. In English, plain second-person `you`. The site never says "we" — there is no _we_, just _you_ and _everyone else_.

| Pattern | Danish | English |
|---|---|---|
| Direct address | "Din adgangskode skal være mindst 6 tegn" | "Password must be at least 6 characters" |
| Status | "Du har allerede placed et bet på dette løb." | "You have already placed a bet on this race." |
| Cheering | "Perfekt!" (gold star) | "Perfect!" |
| Self-marker on shared lists | `DIG` badge | `YOU` badge |

### Casing
- **All-caps** for badges only (`BETTING OPEN`, `BETTING CLOSED`, `YOU` / `DIG`). Set via `text-transform: uppercase` on `.badge`.
- **Title case** for page headings (`Upcoming Races`, `Betting Rules`).
- **Sentence case** for everything else — buttons, labels, helper text.
- **Mixed mid-sentence English** is acceptable in Danish copy ("Bet placeret!", "leaderboard sortering"). This is how the audience actually talks about F1.

### Numbers & data
Numbers are first-class citizens. The site is dense with scores (`25 pts`, `★3`, `48h before race`, `P1 / P2 / P3`). Display them in **Chivo, bold, tabular-feeling** so columns of points line up. Never spell out small numbers — `3 friends`, not `three friends`.

### Examples of real copy

- **Hero (default):** _"Velkommen til F1 Klubben — placér dit bet før løbet starter."_
- **Empty state:** _"Ingen kommende løb"_ / _"No upcoming races"_
- **Validation:** _"Bet kan ikke matche kvalifikationsresultatet"_ — terse, no apology.
- **Rules page intro:** Tabular. Two columns: position → points. No prose preamble.

### Things this brand never does
- No emoji. Not even the F1 🏁 flag — it uses an SVG/icon-font flag instead.
- No exclamation marks in nav, buttons, or page headings.
- No marketing fluff ("Join the excitement!"). The audience is 10 people who already know what they signed up for.
- No casual slang in chrome copy. ("Sweet!", "Oops!" are out.)
- No "we" / "our team" — it's a peer club, not a company.

---

## VISUAL FOUNDATIONS

### Color usage
The palette is **deliberately small**: one red, one neutral ramp per theme, plus three podium metals (gold / silver / bronze) and the four status colors (green / orange / red / grey). That's it.

- **Background ramp (dark):** `#0a0a0b` (page) → `#141416` (header) → `#1a1a1d` (card) → `#242428` (hover).
- **Background ramp (light):** `#f0f0f2` → `#e5e5e8` → `#f8f8fa` → `#dcdce0`.
- **Text ramp:** `--text-primary` for body, `--text-secondary` for meta / labels, `--text-muted` for timestamps + helper text.
- **F1 red** is the only color that appears in BOTH themes unchanged. It's the brand throughline.
- **Status badges** use a 135° linear gradient (`linear-gradient(135deg, light → dark)`) on green / orange / red / gold. This is the only place gradients appear.
- **Podium tints** (`.position-1/2/3`) use the same 135° gradient — gold / silver / bronze.

### Type
- **Display (Chivo):** 700–900 weight for headings, buttons, badges. Slightly geometric, condensed-feeling at heavier weights — reads as "racing".
- **Body (Manrope):** 400–500 for paragraph copy, 600 for form labels.
- Line height: `1.6` for body, `1.15` for headings.
- Hierarchy is created with **size + weight + family-switch**, almost never with color. Headings stay on `--text-primary`.

### Spacing
4-point base, expressed in rem (1rem = 16px on the body). Cards pad at `1.25rem`, hero pads at `3rem 1.5rem`, the main `.container` is `max-width: 1200px` with `0 1rem` gutters. Stack rhythm is `mb-1 = 0.5rem`, `mb-2 = 1rem`, `mb-3 = 1.5rem`. Tight, not airy — this is a data-dense product.

### Layout rules
- Single column on mobile (`≤768px`) by way of `grid-template-columns: 1fr !important` everywhere.
- Homepage desktop: `2fr 1fr` — races on the left, leaderboard sidebar on the right. Mobile: leaderboard goes **on top** (collapsed by default, tap to expand).
- Sticky header (`position: sticky; top: 0; z-index: 100`).
- The container never goes wider than 1200px — even on huge monitors. Keeps line lengths readable for 50+ eyes.

### Backgrounds
- **Solid colors only.** No imagery, no textures, no patterns.
- The hero has a 4px red **left bar** (`::before` pseudo-element) — that's the only "decoration" outside of the cards themselves.
- Top-3 leaderboard rows get a subtle `linear-gradient(90deg, rgba(225, 6, 0, 0.1), transparent)` tint, fading to nothing on the right. This is the only "background art" in the system.

### Corners
`--radius-sm: 6px` for tiny chips, `--radius-md: 8px` for buttons / inputs / quali pills, `--radius-lg: 12px` for cards, `--radius-xl: 16px` for hero + modal, `--radius-pill` (9999px) for the status badges. Avatars + circle icon-buttons use `border-radius: 50%`.

### Cards
- `background: var(--bg-card)`
- `border: 1px solid var(--border-color)`
- `border-radius: 12px`
- `transition: all 0.2s`
- On hover: border becomes `--f1-red`, `transform: translateY(-2px)`, `box-shadow: 0 8px 24px rgba(225, 6, 0, 0.15)`.
- **No drop shadow at rest.** Cards are flat until you hover them, then they lift with a red-tinted shadow.

### Shadows
There is no shadow ramp. Only three shadows exist:
1. `0 4px 12px rgba(225, 6, 0, 0.30)` — primary button hover.
2. `0 8px 24px rgba(225, 6, 0, 0.15)` — card hover.
3. `0 0 20px rgba(251, 191, 36, 0.40)` — "perfect bet" gold glow.

All shadows are **colored**, never neutral black.

### Hover & press states
- **Buttons (primary):** background lightens (`--f1-red-light`), `translateY(-1px)`, red shadow.
- **Buttons (secondary):** background → `--bg-hover`. No transform.
- **Buttons (ghost / icon):** background → `--bg-hover`, color → `--text-primary`. No transform.
- **Nav links:** color shifts `--text-secondary → --text-primary`. Active link gets a 2px red underline (`::after`).
- **Cards:** lift + red border (see above).
- **Table rows:** background → `--bg-hover`.
- There is **no explicit press / active state** in the live CSS — hover is the only interactive feedback. (See "Iteration notes" — consider adding `:active { transform: scale(0.98) }` to buttons.)

### Borders
1px, color `--border-color`. Used on cards, form inputs, table dividers, nav-bottom of the header. The only thicker border is `2px solid var(--f1-red)` on the "edit form active" admin state, which also pulses (`@keyframes pulse-border`).

### Transparency & blur
- Modal overlay: `rgba(0, 0, 0, 0.7)`. No backdrop-blur.
- Status badge gradients use full opacity.
- Top-3 leaderboard row tint: `rgba(225, 6, 0, 0.10)`.
- "Perfect bet" outer glow: `rgba(251, 191, 36, 0.40)`.
- Focus ring on inputs: `0 0 0 3px rgba(225, 6, 0, 0.20)`.
- **`backdrop-filter` is not used.** Don't introduce it.

### Animation
All transitions are short and unfussy:
- `transition: all 0.2s` on buttons + cards.
- `transition: max-height 0.3s ease` on collapsible regions (mobile leaderboard, admin forms).
- `transition: right 0.3s ease` on the mobile nav drawer (slides in from the right).
- `transition: transform 0.3s ease` on the bet modal (scale-in from `0.9`).
- Two keyframe animations only:
  - `star-pulse` — 2s ease-in-out infinite, scales `1 → 1.1 → 1`. Used on the gold ★ next to perfect-bet users.
  - `pulse-border` — 2s infinite red box-shadow ring on the active edit-form card.

Easing is browser-default `ease`. No springs, no bounces, no parallax, no scroll-tied animation. Match the audience — calm, predictable, not overstimulating.

### Imagery
Photographs are **not used.** Only the logo (an F1-car silhouette) appears as imagery. If you ever add photography (car photos for race headers, driver portraits), it should be **high-contrast, cool/neutral white-balance, no grain.** Treat like broadcast TV stills, not magazine editorial.

### Tabs
Bottom-border style: inactive tabs are `var(--text-secondary)`, hovered → primary, active → red text + 2px red bottom border. No pill-shaped tabs, no background-fill on the active tab.

---

## ICONOGRAPHY

### System
**Font Awesome 6 Free** (`fa-solid` + `fa-brands` + `fa-regular`), self-hosted in `public/assets/fontawesome/`. The repo ships the woff2 + ttf files locally; no CDN dependency. Stroke-fill style with solid weight is the default — `fa-solid` is what 95% of icons use.

| Icon | Where it's used |
|---|---|
| `fa-home` | Home nav |
| `fa-trophy` | Leaderboard / podium |
| `fa-flag` | Races / upcoming races |
| `fa-book` | Rules |
| `fa-cog` | Admin |
| `fa-user` | Profile |
| `fa-sign-in-alt` / `fa-sign-out-alt` | Login / logout |
| `fa-bars` | Mobile menu toggle |
| `fa-sun` / `fa-moon` | Theme toggle |
| `fa-globe` | Language toggle |
| `fa-map-marker-alt` | Race location |
| `fa-clock` / `fa-hourglass-half` / `fa-stopwatch` | Race time / countdowns |
| `fa-dollar-sign` | Betting pool |
| `fa-edit` | Edit bet |
| `fa-chevron-down` | Collapsible toggle |
| `fa-users` | "N bets" count |

### Rules
- **Always solid-fill.** No regular / outline / thin variants in the live UI.
- Icon **inherits color** from its parent (`color: inherit`) — they pick up `--text-secondary` or `--text-primary` from context.
- The brand-red accent icon pattern is `<i class="fas fa-X text-accent">` — explicitly classed for the few places (trophy in leaderboard heading, flag in upcoming-races heading) where the icon should be red.
- Iconography is **functional, not decorative.** Every icon labels something. No "icon as illustration" usage.
- Position chips render as **filled rounded squares** (32×32, `border-radius: 8px`) with the digit inside, gold/silver/bronze gradients. Treat these as icons in their own right.

### Emoji
**Never.** Not in product copy, not in chrome, not in placeholders. The only "emoji-like" character used is `★` (U+2605 BLACK STAR), as in `★3` next to a user with three perfect bets. This is set in the chosen font (Chivo) so it renders crisply, not as the OS emoji.

### Logos & assets shipped here
- `assets/logo.png` — full-size F1 car silhouette (red + white), transparent background.
- `assets/logo_header_dark.png` — small (≤40px) red-on-dark variant for the dark-theme header.
- `assets/logo_header_light.png` — small red-on-light variant for the light theme.
- `assets/favicon.ico`, `assets/favicon.png` — favicons.
- No SVG logos exist; only PNG. Flag this if you need to scale beyond 80px tall.

---

## Iteration notes / known gaps

- **Press states.** The live CSS has hover but no `:active`. A subtle `transform: scale(0.98)` on buttons would help touch users (which this audience is).
- **Accessible focus.** Only inputs get a visible focus ring (`box-shadow 0 0 0 3px rgba(225,6,0,0.2)`). Buttons and nav links inherit the browser default — should be made explicit for keyboard users.
- **Font hosting.** Fonts load from `fonts.googleapis.com`. For long-term Danish-GDPR comfort, consider self-hosting Chivo + Manrope as TTF/WOFF2.
- **No SVG logo.** PNG only. A vector logo would help on hi-DPI screens and printed merch.
- **No photography style yet** — the system is currently 100% layout + type + flat color. If race-header hero photos are introduced, they need a written guideline.

---

## How to use this system

For prototypes, mocks, slides, or new features, include `colors_and_type.css` and Font Awesome:

```html
<link rel="stylesheet" href="colors_and_type.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<body class="dark"> ... </body>
```

Then lean on the CSS variables (`var(--f1-red)`, `var(--bg-card)`, etc.) and the JSX components in `ui_kits/website/`. Keep the rules tight — this brand stays compelling because it's restrained.
