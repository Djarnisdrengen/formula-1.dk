# Handover guide — v1.3.0

Step-by-step instructions for taking the zipped handoff bundle and turning it into a shipped redesign in the F1Betting PHP repo. Written for whoever is doing the implementation (most likely Claude Code, possibly a human developer).

**Estimated total time:** 1.5–2.5 working days for a single experienced developer. Each phase is independently shippable, so you can stop and deploy after any of them.

---

## 0 · Before you start — what you need

- [ ] **The zip:** `design_handoff_redesign_v1.3.0.zip` (download card in the chat, or the folder itself from the project).
- [ ] **The target repo:** local clone of the F1Betting PHP codebase, on a fresh branch off `main`. Suggested branch name: `redesign/v1.3.0`.
- [ ] **A staging environment** that mirrors production (same PHP version, same MySQL). The acceptance criteria in §7 of the handoff doc must pass here before you merge.
- [ ] **A browser** that can run the design canvas — Chrome, Safari, Firefox, or Edge, latest version.
- [ ] **Access to send test emails** from staging, for the email-template acceptance criteria.

---

## 1 · Unpack the zip

```bash
# Wherever you keep design references
mkdir -p ~/design-refs
cd ~/design-refs
unzip ~/Downloads/design_handoff_redesign_v1.3.0.zip
cd design_handoff_redesign_v1.3.0
ls
```

You should see:

```
README.md                ← the handoff doc (same as claude-design-system-v1.3.0.md)
HANDOVER-GUIDE.md        ← this file
redesign-hifi.html       ← live canvas; open in browser
redesign-wireframes.html ← earlier wireframe canvas (reference only)
design-canvas.jsx        ← canvas host (not for production)
tweaks-panel.jsx         ← canvas tweaks UI (not for production)
hifi/                    ← 12 JSX files + style.css — your visual spec
wireframe/               ← wireframe-only JSX + style.css (sketch fonts; DO NOT ship)
```

> **Important:** the `hifi/` folder is your **spec**, not your production code. JSX files are React component references. You'll port their markup structure into PHP — don't try to drop JSX into the PHP repo.

---

## 2 · Read the handoff doc end-to-end (30 minutes)

Open `README.md` (a copy of `claude-design-system-v1.3.0.md`). Read it once cover-to-cover before writing any code. Pay particular attention to:

- **§7 Acceptance criteria** — this is your gating checklist. Every checkbox must be green before merge. Bookmark this section; you'll come back to it after every phase.
- **§Backend changes required** — there are two non-trivial DB/query changes (leaderboard rank delta + pool size). Decide which option (A or B) you'll ship for each. Don't skip this section; the leaderboard ships broken without it.
- **§Email templates — update required** — 5 transactional emails need reskinning. Outlook on Windows is the failure case.

---

## 3 · Open the design canvas (10 minutes)

```bash
# From inside the unzipped folder:
open redesign-hifi.html       # macOS
xdg-open redesign-hifi.html   # Linux
start redesign-hifi.html      # Windows
```

The canvas is a pan/zoom grid with 51 artboards across 11 sections. Things to do here before you start coding:

1. **Toggle dark/light** via the Tweaks panel (bottom-right) — verify every artboard reads correctly in both themes.
2. **Scroll through every section** at 100% zoom — get a mental map of which artboard maps to which page.
3. **Click into "Section 10 · Interactive states"** — this shows every component in every state (default/hover/active/focus/disabled). It's the closest thing to a Storybook for this release.
4. **Open one artboard fullscreen** (click the expand icon on the card) — this is what to compare against when implementing the corresponding PHP page.

Keep the canvas open in a second monitor or browser tab while implementing — it's the source of truth for visual details.

---

## 4 · Branch, install, smoke-test the existing app (15 minutes)

In the **F1Betting repo** (not the design folder):

```bash
git checkout main
git pull
git checkout -b redesign/v1.3.0
# install deps / run migrations / start dev server per the F1Betting repo's README
```

Open the existing app in your browser, log in, click through Home → Races → Bet flow → Leaderboard → Profile → Rules → Admin. You're confirming the baseline works **before** you change anything. If anything is broken pre-redesign, fix it first or note it as out-of-scope.

---

## 5 · Implementation order (the actual work)

The handoff doc lists 5 phases. Do them in order — each one is independently shippable, so you can deploy to staging and verify before moving on.

### Phase A — CSS tokens & shell (~2 hours)

> **Goal:** append the new shell + footer CSS so it's available, without breaking anything yet.

1. Open `public/assets/css/style.css` in the F1Betting repo.
2. Open `hifi/style.css` from the unzipped handoff folder.
3. **Copy the entire contents of `hifi/style.css` and paste at the bottom of `public/assets/css/style.css`.** Every selector is namespaced under `.hf-*`, so it can't collide with existing rules.
4. Update the `@import` line at the top of `style.css` to include the 4-font stack — see the handoff doc's "Typography — production stack" section for the exact URL.
5. Add the new font-variable declarations to `:root` (also in the typography section).
6. Save, reload the existing app — **nothing should look different yet** (no markup uses `.hf-*` classes). If anything broke, the paste collided with something; revert and investigate.

✅ Verify §7.1 AC-SHELL-01 setup is possible (no CSS errors in devtools console).

### Phase B — Header + drawer (~2 hours)

> **Goal:** new top bar + hamburger drawer replaces the old inline nav, on every page.

1. Open `public/includes/header.php`.
2. Replace the `<nav class="nav">` block with the new `<header class="hf-top">` + `<nav class="hf-drawer">` markup from the handoff doc's "§2 Header.php rewrite".
3. Wire up the drawer toggle JS — either inline at the bottom of `header.php` or in your shared JS bundle. The exact snippet is in the same section.
4. **Delete** the old `.controls.desktop-only`, `.mobile-nav-extras`, `.mobile-controls`, `.nav-overlay`, and the second `@media (max-width: 768px)` block in `style.css` (per the "Drop everything else" note in §2).
5. Reload every page and confirm the new top bar appears, hamburger opens the drawer, drawer closes on outside click + Esc + clicking a row.

✅ Verify acceptance criteria **AC-SHELL-01 through AC-SHELL-05** pass.

### Phase C — Bottom bar partial (~1 hour)

> **Goal:** new persistent bottom bar with Profile / Theme / Language / Font cells, on every page.

1. Create `public/includes/bottom_bar.php` with the markup from the handoff doc's "§3 Bottom bar partial".
2. Add `<?php include 'includes/bottom_bar.php'; ?>` to the bottom of every page template **outside** the `<main>` block (so it sticks).
3. Mirror the existing `toggle_theme` / `toggle_lang` query-param handlers for the new `toggle_font` param — stub it as a no-op for now per **AC-FONT-01**.
4. Reload each page; confirm the bottom bar is sticky, the 4 cells render, and theme + language toggles still work.

✅ Verify **AC-SHELL-06 through AC-SHELL-08**, **AC-THEME-01/02**, **AC-LANG-01/02**, **AC-FONT-01**.

### Phase D — Per-page templates (~6–8 hours)

> **Goal:** port the visual structure of each page from its JSX reference to its PHP template.

For each of the 8 pages, in this suggested order:

| Order | Page | PHP file | JSX reference |
|---|---|---|---|
| 1 | Home | `index.php` | `hifi/home.jsx` |
| 2 | Races | `races.php` | `hifi/races.jsx` |
| 3 | Race detail | `race.php` (or similar) | `hifi/race-detail.jsx` |
| 4 | Bet modal | (likely inside `race.php`) | `hifi/bet-flow.jsx` + `hifi/bet-modal.jsx` |
| 5 | Leaderboard | `leaderboard.php` | `hifi/leaderboard.jsx` |
| 6 | Profile | `profile.php` | `hifi/profile.jsx` |
| 7 | Rules | `rules.php` | `hifi/rules.jsx` |
| 8 | Login | `login.php` | `hifi/login.jsx` |

**The porting recipe for each page:**

1. Open the JSX file side-by-side with the PHP file.
2. Read the JSX top-to-bottom — note the structural elements (`<HomeHero>`, `<StatsStrip>`, etc.) and the classes they use.
3. In the PHP template, wrap content in `<main class="hf-body">` and add the `<footer class="hf-footer">` (template in handoff §4).
4. Translate each JSX block into PHP, swapping:
   - `className=` → `class=`
   - `{variable}` → `<?= escape($variable) ?>`
   - `.map(...)` → `<?php foreach (...) { ?>` loops
   - Stateful pieces (e.g. countdown, bet picker) → vanilla JS at the bottom of the file or in a shared script
5. Reload the page, compare side-by-side with the canvas (use the corresponding artboard in fullscreen).
6. **Tick the acceptance criteria for that page** before moving to the next one. E.g. for Home you've got AC-HOME-01 through AC-HOME-06.

### Phase E — Admin + Bet modal (~2 hours)

> **Goal:** admin tabs respond to width, bet modal becomes the 5-step flow.

1. **Admin:** wrap the admin tabs in `<div class="admin-shell">` if not already; verify the `<details class="admin-dropdown">` shows at XS/SM and tabs show at MD+. Update the race admin table to use the 6-col grid at LG+ — column widths in `hifi/admin.jsx`.
2. **Bet modal:** open `hifi/bet-flow.jsx` and replicate the 5 states (empty → P1 picker → P1 filled + P2 picker → all 3 filled + Confirm → success). Lock out already-picked drivers (`opacity: 0.4; cursor: not-allowed; pointer-events: none`). On XS/SM the modal is fullscreen; on MD+ it's a centered 560px card.

✅ Verify **AC-ADMIN-01 through AC-ADMIN-04** and **AC-RACE-04 through AC-RACE-08**.

### Phase F — Backend changes (~3–4 hours)

> **Goal:** the leaderboard delta and pool-size DKK ship working, not stubbed.

1. **Pick** Option A (snapshot table) or Option B (window function) for the rank delta — handoff §Backend changes. Option A is recommended for performance.
2. Write the migration **with both `up()` and `down()`** per **AC-BE-04**.
3. Run the migration on staging, backfill from existing data if you went with Option A.
4. Update the leaderboard query in the PHP page to read the delta; wire it into the "Din position" sidebar.
5. Add `settings.pool_size_dkk` (or derive it) and render on the home stats strip with Danish formatting (`1.240 kr`).

✅ Verify **AC-BE-01 through AC-BE-04** and **AC-LB-03**, **AC-HOME-05**.

### Phase G — Email templates (~2–3 hours)

> **Goal:** all 5 transactional emails match the redesigned brand and pass Outlook-on-Windows.

For each of `invite.html`, `password-reset.html`, `race-reminder.html`, `results-posted.html`, `welcome.html`:

1. Replace the header lockup with the new 32px-square red mark + display name, using inline-styled `<table>` markup (no flexbox, no `<link>` to Google Fonts).
2. Apply the system-font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif`.
3. Reskin the primary CTA with the exact inline-style block in the handoff doc's "Email templates" section.
4. Update the footer to `Frederikssund F1 Klub · v1.3.0 · Sæson 2026`.
5. Sentence-case all copy (subject lines too).
6. **Send a test of each template to a Gmail, Outlook, and Apple Mail inbox** before signing off. Litmus or Email on Acid if you have a license.

✅ Verify **AC-EMAIL-01 through AC-EMAIL-06**.

---

## 6 · Acceptance run (the gate)

Once all 5 phases are deployed to staging, go through **every checkbox in §7 of the handoff doc** — all ~70 of them. The doc is designed so each item is verifiable by one person in ≤2 minutes. Mark each one pass/fail in your PR description.

Order to run them:

1. **§7.1 Shell** — fastest to verify; if these fail, stop and fix.
2. **§7.2 Responsive** — resize a desktop browser 320 → 1920, check each breakpoint boundary.
3. **§7.3 Theme & language** — toggle each on every page.
4. **§7.4–7.7 Per-page** — Home → Races/Bet → Leaderboard/Profile → Rules/Login/Admin.
5. **§7.8 Email** — send live test emails.
6. **§7.9 Backend** — verify the delta math against a fixture user.
7. **§7.10 Accessibility** — keyboard-tab through every page, check focus rings, verify Esc closes modals.
8. **§7.11 Browser matrix** — Safari + Chrome + Firefox + Edge, iOS + Android + macOS + Windows. This is the slowest step; budget half a day.
9. **§7.12 Performance** — Lighthouse run on home page, mobile preset, throttled "Fast 3G".
10. **§7.13 Sign-off** — attach screenshots (9 pages × 2 themes × 3 widths = 54 screenshots, or pick the 18-screenshot minimum from AC-SIGNOFF-01), record the bet-flow Loom, update the F1Betting `CHANGELOG.md`, ping a club member for a real-phone sign-off.

---

## 7 · If something goes wrong

| Symptom | Most likely cause | Fix |
|---|---|---|
| New CSS not applying | Browser cached old `style.css` | Hard reload (Cmd+Shift+R), check the file actually saved with new bytes |
| Drawer + old mobile nav both visible | Old `@media (max-width: 768px)` block not deleted | Find and delete it per Phase B step 4 |
| Hamburger doesn't open drawer | Drawer toggle JS not loaded, or `data-link="toggleDrawer"` attribute missing | Verify the snippet in handoff §2 is in your shared JS bundle |
| Bottom bar overlaps content | `<main>` missing `min-height: calc(100vh - 56px - 64px)` | See handoff §4 template |
| Theme/lang toggle navigates but doesn't toggle | Query-param handler in `header.php` not running before the include of `bottom_bar.php` | Reorder so handlers run before any output |
| Email looks fine in Gmail, broken in Outlook | Used flexbox/grid instead of `<table>` | Per AC-EMAIL-02, only `<table>` markup is supported across all clients |
| Leaderboard delta shows `NaN` or `null` for everyone | First-ever round; no previous snapshot to compare to | Per AC-BE-01, `null` is the correct value for first-ever round; render as `—` in the UI |

For anything else, re-read the relevant section of the handoff doc — most edge cases are documented there.

---

## 8 · Merge checklist

Before opening the PR against `main`:

- [ ] All §7.1–§7.12 boxes ticked in the PR description.
- [ ] 18+ screenshots attached (9 pages × XS + MD + LG, both themes).
- [ ] Bet-flow Loom recording attached.
- [ ] `CHANGELOG.md` entry written in F1Betting repo with date + bullet list of changes.
- [ ] Migrations tested with both `up()` and `down()` on a fresh DB.
- [ ] Email templates tested live in Gmail, Outlook on Windows, Apple Mail.
- [ ] One real club member has clicked through staging on their phone and approved.
- [ ] No new console errors on any page in any of the 4 target browsers.

Merge to `main`, tag the release `v1.3.0`, deploy.

---

## 9 · What to do with this folder afterwards

Keep the unzipped folder somewhere accessible — bug reports and follow-up tweaks will reference the same JSX files and acceptance criteria IDs. When v1.4.0 ships, a new bundle will arrive and you can archive this one.
