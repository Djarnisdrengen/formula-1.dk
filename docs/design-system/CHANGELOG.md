# Changelog — Frederikssund F1 Klub Design System

All notable changes to this design system, following [Semantic Versioning](https://semver.org/):
**MAJOR** for breaking changes (token removed, class renamed) · **MINOR** for additive features (new palette, new component, new handoff) · **PATCH** for fixes (color tweak, doc correction).

---

## v1.3.0 — 2026-05-18

**Feat · acceptance criteria added to the redesign handoff**

- New **section 7 · Acceptance criteria** added to the handoff doc. ~70 individually checkable pass/fail items across 13 sub-sections, each prefixed with a stable ID (`AC-SHELL-01`, `AC-RACE-04`, `AC-A11Y-06`, etc.) so the team can reference them in PRs and bug reports.
- Sub-sections: Shell · Responsive (5 breakpoints) · Theme & language · Home · Races / Race detail / Bet flow · Leaderboard / Profile · Rules / Login / Admin · Email templates · Backend changes · Accessibility · Browser & device matrix · Performance · Sign-off.
- Existing "Testing checklist" (section 6) demoted to a 5-minute **smoke** checklist; the deeper acceptance criteria sit alongside it as the gating list for sign-off.
- "What changes from v1.1.0" gets a new bullet (#7) calling out acceptance criteria as a first-class part of this release.
- Footer version string and bundle folder name bumped from v1.2.3 → v1.3.0.

No code, token, or visual changes from v1.2.3 — this release adds testable contracts only.

---

**Feat · two accent fonts wired into the production stack**

- **Kalam** added as `--font-accent` (printed handwriting, 3 weights: 300/400/700). Applied to `.hf-pageh .lede` — the editorial paragraph after page H1s on Rules, Leaderboard, Profile, Races.
- **Courier Prime** added as `--font-mono` (typewriter with italic). Replaces all `ui-monospace, Menlo, monospace` references in `hifi/`. Now used for: footer version chip, Rules inline code/kbd, bet prediction strings on Profile, race-card timestamps, Admin tab-count chips, masked password readout, login password input.
- `ui-monospace, Menlo, monospace` retained as the fallback inside the `--font-mono` declaration, so the visual character degrades gracefully if Google Fonts fails to load.
- Google Fonts `@import` URL updated to include both families with appropriate weight ranges.
- Footer version string and bundle folder name bumped from v1.2.2 → v1.2.3.

Note: Patrick Hand and Special Elite remain wireframe-only in `wireframe/style.css` and do NOT ship to production. Kalam ↔ Patrick Hand, Courier Prime ↔ Special Elite is a one-way swap at hi-fi time.

---

## v1.2.2 — 2026-05-18

**Feat · email templates listed as required scope**

- Added an "Email templates — update required" section to the handoff. Lists the 5 transactional templates that must be reskinned (invite, password-reset, race-reminder, results-posted, welcome), with mail-client-safe HTML for header lockup, type stack, primary CTA, and footer. Calls out Outlook on Windows as the testing failure case.
- "Files left untouched" updated: email *templates* are explicitly in scope; email *mailer logic* is out of scope.
- Footer version string and bundle folder name bumped from v1.2.1 → v1.2.2.

No code, token, or visual changes from v1.2.1.

---

## v1.2.1 — 2026-05-18

**Fix · handoff doc accuracy**

- **Backend changes section added.** v1.2.0 incorrectly claimed "no backend changes" and "database schema untouched". Two features in the redesign actually require backend work and are now documented with two implementation options each:
  - Leaderboard rank delta (`↑ 2 pladser siden sidste runde`) — needs either a `leaderboard_snapshots` table or a window-function query.
  - Pool size in DKK on the home stats strip — needs either a `settings.pool_size_dkk` column or a derived sum.
- **Fonts clarified.** v1.2.0 said "no new fonts" without context. Updated to make clear that Chivo + Manrope stays as the production stack, and that the Patrick Hand / Special Elite fonts visible in the wireframes are **sketch-only** (live in `wireframe/style.css`) — they do not ship to production.
- Footer version string and bundle folder name bumped from v1.2.0 → v1.2.1.

No code, token, or visual changes from v1.2.0 — this is a docs-only correction.

---

## v1.2.0 — 2026-05-18

**Feat · full website redesign · ships as additive layout system**

- **New navigation pattern** — top bar with logo + hamburger; drawer drops down from the top; persistent bottom bar holds profile (or login), theme toggle, language flag, font toggle. Same shell at every breakpoint.
- **5-breakpoint responsive system** — XS / SM / MD / LG / XL replaces the single 768px media query. Container max-widths: 760 (MD), 1080 (LG), 1280 (XL).
- **9 pages restyled at hi-fi** — Home (full-bleed race hero + live countdown), Races (filter chips + upcoming/past split), Race detail (hero + your bet + locked all-bets), Leaderboard (self-row pinned + podium at MD+), Profile (Konto card with display name + flag + password + 2 action buttons), Rules (numbered editorial sections + TOC at LG+), Login (editorial intro at LG/XL), Admin (wrapping tabs / dropdown), Bet modal (5-step flow).
- **Light theme parity** — every component reads correctly in both dark and light; tokens flip via `body.light`.
- **Language flags** replace `DA`/`EN` codes — inline SVG (Dannebrog + Union Jack).
- **Versioned footer** on every page — `Frederikssund F1 Klub · v1.2.0 · Sæson 2026`.
- **Polish** — `:focus-visible` rings on every interactive element, hover lifts on race/leaderboard rows, `:active` scale-down on buttons, smooth 150ms transitions throughout.
- **Interactive states reference** — new section 10 in the canvas shows every component in every state (default/hover/active/focus/disabled) via forced `.is-hover` classes, since pointer events go through the canvas making `:hover` hard to verify live.
- All v1.1.0 tokens preserved. Existing class names additive — no breaking changes.

---

## v1.1.0 — 2026-05-14

**Feat · mobile drawer now holds all secondary controls**

- Stage D (<560px) drawer expanded to include palette toggle, theme toggle, language toggle, and login/logout — alongside existing nav links.
- Each toggle row shows its current value on the right (e.g. "Theme · Dark", "Language · DA", "Palette · Clubhouse") so users can see state at a glance.
- Header bar at Stage D now shows only logo + hamburger — desktop `.controls` cluster is hidden via `.controls.desktop-only { display: none !important }` inside the container query.
- `.mobile-nav-extras` markup expanded in `header.php` with branch on `$currentUser` (login vs profile+logout) and three toggle rows.
- New `.nav-divider` element separates account actions from system toggles.
- Documented `toggle_palette` query-string handler matching the existing theme/lang pattern.

---

## v1.0.1 — 2026-05-14

**Fix · admin menu showed both tabs and dropdown on mobile**

- Added a viewport-media-query fallback (`@media (max-width: 720px) { .tabs { display: none; } .admin-dropdown { display: block; } }`) alongside the container query, so the swap works even if `admin.php` hasn't been wrapped in `.admin-shell` yet.
- Added explicit "Troubleshooting: I see both menus on mobile" section to the handoff, naming the three causes (old `@media` block not deleted; `.admin-shell` wrapper missing; specificity conflict from another stylesheet).
- Strengthened the "delete the old block" instruction to flag it as required.

---

## v1.0.0 — 2026-05-13

First formal release. Covers everything in the system as of today.

### Tokens & type
- `colors_and_type.css` — base palette (broadcast: F1 red + neutrals), Chivo display + Manrope body, full type & spacing scale, dark + light themes.
- **Clubhouse palette** added as an opt-in theme (`body.clubhouse.dark` / `body.clubhouse.light`). Warm paper / paddock / oxblood / brass. All token names preserved so components inherit automatically.
- Tokens mirror the `:root` block of `public/assets/css/style.css` in the F1Betting repo.

### Iconography
- Two-palette icon system: **Broadcast** (solid Font Awesome, red accent) and **Clubhouse** (warmer glyph choices, brass accent on dark / oxblood accent on cream).
- Slot→glyph mapping table for direct component use.

### Components & handoffs
- **Responsive navigation handoff** (`claude-design-system-v1.0.0.md`)
  - Top-nav: 4-stage container-query progression (full → icon-only → tight → drawer)
  - Admin menu: tabs on desktop, native `<details>` dropdown below 720px
  - No new dependencies, no JS framework

### Accessibility
- Broadcast palette + clubhouse palette both verified for WCAG AA on body text. AAA-clean for primary text on both themes; muted tones and accent reds documented with their actual ratios.

---

## How to update this changelog

When shipping a new version:

1. Decide the bump (PATCH / MINOR / MAJOR) per the rules above.
2. Copy the current handoff doc to a new filename with the new version:
   `cp claude-design-system-v1.0.0.md claude-design-system-v1.1.0.md`
3. Edit the new file with your changes; update its internal version header.
4. Update `CLAUDE.md` to point at the new file (and demote the old one to a "Previous versions" line if you want to keep history).
5. Prepend a new section to this `CHANGELOG.md` with the date and bullet list of changes.
