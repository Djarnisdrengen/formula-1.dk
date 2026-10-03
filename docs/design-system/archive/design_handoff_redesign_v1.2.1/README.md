# Handoff: Full website redesign · v1.2.1

> **Design System version:** `v1.2.1` · 2026-05-18 · see [CHANGELOG.md](./CHANGELOG.md)

Full visual + structural redesign of the F1Betting site. New navigation pattern, 5-breakpoint responsive system, broadcast palette polished to a "clubhouse newsletter" feel, light/dark theme parity, hi-fi designs for all 9 user-facing pages.

## About the design files

The files under `hifi/` and the canvas at `redesign-hifi.html` are **design references** (React + JSX, rendered in browser for review). Your task is to port the visual + behavioural design into the existing **F1Betting PHP codebase** — primarily `public/assets/css/style.css` plus the page templates under `public/`. Keep every existing CSS class name; this release is additive on top of the v1.1.0 base.

## Fidelity

**Hi-fi.** Exact colors, type, spacing, hover/active/focus states, and transitions are specified. Tokens are pulled directly from the existing `style.css` `:root` block — no new color tokens introducedced. The redesign re-arranges existing pieces; it does not require any new font upload or color picker.

## What changes from v1.1.0

1. **Navigation pattern flipped** — header is now logo + hamburger (no inline nav). Persistent **bottom bar** holds Profile (or "Log ind"), Theme toggle, Language flag, Font toggle.
2. **5-breakpoint responsive system** replaces the single 768px media query — XS / SM / MD / LG / XL.
3. **All 9 pages restyled** — Home (full-bleed race hero + countdown), Races, Race detail, Bet modal flow, Leaderboard (self-row pinned), Profile (with Konto/account card), Rules (numbered editorial sections + TOC at LG+), Login (with editorial intro at LG+), Admin (wrapping tabs at MD+, dropdown at XS/SM).
4. **Light theme** is now a peer of dark, not an afterthought. Every component renders correctly in both.
5. **Language flags** replace the `DA`/`EN` text code. SVG-based, no image deps.
6. **Versioned footer** on every page — `Frederikssund F1 Klub · v1.2.1 · Sæson 2026`.

## Files in this bundle

```
design_handoff_redesign_v1.2.1/
├── README.md                  ← this doc
├── redesign-hifi.html         ← live canvas with 11 sections, 51 artboards
├── hifi/
│   ├── style.css              ← drop-in patches for public/assets/css/style.css
│   ├── shell.jsx              ← top bar + bottom bar + drawer markup reference
│   ├── home.jsx               ← Home page reference
│   ├── races.jsx              ← Races list
│   ├── race-detail.jsx        ← single race
│   ├── bet-modal.jsx          ← bet placement modal (single state)
│   ├── bet-flow.jsx           ← bet placement modal (5-step flow)
│   ├── leaderboard.jsx        ← leaderboard
│   ├── profile.jsx            ← profile + Konto card
│   ├── rules.jsx              ← rules with TOC
│   ├── login.jsx              ← auth with editorial intro
│   ├── admin.jsx              ← admin tabs/dropdown
│   └── states.jsx             ← interactive states reference
└── design-canvas.jsx          ← canvas host (not for production)
```

## Implementation order

Recommended sequence (each step is independently shippable):

1. **CSS tokens & base** — append new shell + footer rules to `style.css`.
2. **Header rewrite** — replace inline nav with hamburger + drawer in `public/includes/header.php`.
3. **Bottom bar** — new `public/includes/bottom_bar.php` partial, included on every page.
4. **Per-page templates** — update `index.php`, `races.php`, `leaderboard.php`, `rules.php`, `profile.php`, `login.php`, `admin.php` one at a time.
5. **Light theme parity** — already in tokens; just verify each page.

The design canvas is your reference for every detail. Open it in a browser, toggle dark/light via the Tweaks panel, scroll through the 11 sections.

## Patches by file

See individual sections below for the diff-style patches per source file. Each section is keyed by the F1Betting repo path so you can apply them in order.

## 1 · Tokens & shell CSS

**File:** `public/assets/css/style.css` — append at end (do not modify existing v1.1.0 rules).

The redesign reuses every existing token (`--f1-red`, `--bg-*`, `--text-*`, `--border-color`, etc.). Only new patterns are added.

```css
/* ============================================================
   v1.2.1 — New navigation shell + page footer
   ============================================================ */

/* Top bar: logo + hamburger (replaces the old inline nav) */
.hf-top {
    position: sticky; top: 0; z-index: 20;
    height: 56px; padding: 0 16px;
    background: rgba(28, 28, 32, 0.92);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border-color);
    display: flex; align-items: center; justify-content: space-between;
}
.hf-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
.hf-logo-mark {
    width: 32px; height: 32px; border-radius: 7px;
    background: var(--f1-red); color: white;
    display: inline-flex; align-items: center; justify-content: center;
    font-family: 'Chivo', sans-serif; font-weight: 900; font-size: 13px;
}
.hf-logo-text {
    font-family: 'Chivo', sans-serif; font-weight: 800; font-size: 14px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.hf-logo-text .yr { color: var(--text-muted); font-weight: 500; margin-left: 6px; font-size: 12px; }
.hf-hamburger {
    width: 40px; height: 40px; border-radius: 10px;
    border: 1px solid var(--border-color); background: transparent;
    color: var(--text-primary); cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    transition: background 0.15s, transform 0.1s, border-color 0.15s;
}
.hf-hamburger:hover { background: var(--bg-hover); border-color: var(--text-muted); }
.hf-hamburger:active { transform: scale(0.96); }
.hf-hamburger .bars { width: 16px; height: 12px; display: flex; flex-direction: column; justify-content: space-between; }
.hf-hamburger .bars span { height: 2px; background: currentColor; border-radius: 1px; }

/* Drawer — drops from top bar */
.hf-drawer {
    position: absolute; top: 56px; right: 12px; z-index: 30;
    width: min(340px, calc(100% - 24px));
    background: var(--bg-card);
    border: 1px solid var(--border-color); border-radius: 14px;
    padding: 8px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.55);
    display: flex; flex-direction: column;
    animation: hf-drop 200ms cubic-bezier(.2,.7,.3,1.1);
}
@keyframes hf-drop { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.hf-drawer-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 10px;
    color: var(--text-secondary); text-decoration: none;
    font-family: 'Chivo', sans-serif; font-weight: 600; font-size: 14px;
    position: relative;
}
.hf-drawer-row:hover { background: var(--bg-hover); color: var(--text-primary); }
.hf-drawer-row.active { color: var(--text-primary); background: var(--bg-hover); }
.hf-drawer-row.active::after {
    content: ""; position: absolute; right: 12px; top: 12px; bottom: 12px;
    width: 3px; background: var(--f1-red); border-radius: 2px;
}
.hf-drawer-row i { width: 18px; text-align: center; color: var(--text-muted); font-size: 14px; }
.hf-drawer-row.active i { color: var(--f1-red); }

/* Bottom bar — persistent at every width */
.hf-bottom {
    position: sticky; bottom: 0; z-index: 20;
    height: 64px; padding: 8px 16px;
    background: rgba(28, 28, 32, 0.95);
    backdrop-filter: blur(14px);
    border-top: 1px solid var(--border-color);
    display: grid; grid-template-columns: repeat(4, 1fr);
    align-items: center;
}
.hf-bb-item {
    background: transparent; border: none; cursor: pointer;
    padding: 4px 0;
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    color: var(--text-muted);
    font-family: 'Chivo', sans-serif; font-size: 10px; font-weight: 600;
    letter-spacing: 0.04em;
    transition: color 0.15s, transform 0.1s;
}
.hf-bb-item:hover { color: var(--text-primary); }
.hf-bb-item:active { transform: scale(0.95); }
.hf-bb-item.active { color: var(--f1-red); }
.hf-bb-icon { width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; }

/* Page footer with version */
.hf-footer {
    padding: 28px 16px 20px; margin-top: auto;
    border-top: 1px solid var(--border-color);
    text-align: center; color: var(--text-muted);
    font-family: 'Chivo', sans-serif; font-size: 11px; line-height: 1.5;
}
.hf-footer .name { font-weight: 700; color: var(--text-secondary); }
.hf-footer .v {
    font-family: ui-monospace, Menlo, monospace; font-size: 10px;
    padding: 1px 6px; border-radius: 3px;
    background: var(--bg-secondary); color: var(--text-secondary);
    margin: 0 4px;
}

/* Hero — full-bleed next race */
.hf-hero {
    position: relative; padding: 32px 16px 28px;
    background:
        radial-gradient(circle at 80% 0%, rgba(225,6,0,0.18), transparent 60%),
        radial-gradient(circle at 10% 100%, rgba(225,6,0,0.10), transparent 50%),
        var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    overflow: hidden;
}
.hf-hero::before {
    content: ""; position: absolute; inset: 0;
    background-image: repeating-linear-gradient(135deg,
        transparent 0, transparent 80px,
        rgba(225,6,0,0.04) 80px, rgba(225,6,0,0.04) 82px);
    pointer-events: none;
}
.hf-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 4px 10px 4px 8px;
    border-radius: 999px;
    background: rgba(225,6,0,0.12);
    border: 1px solid rgba(225,6,0,0.4);
    font-family: 'Chivo', sans-serif; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--f1-red-light);
    white-space: nowrap;
}
.hf-hero-eyebrow::before {
    content: ""; width: 6px; height: 6px; border-radius: 50%;
    background: var(--f1-red-light);
    box-shadow: 0 0 8px var(--f1-red-light);
    animation: hf-pulse 1.5s ease-in-out infinite;
}
@keyframes hf-pulse { 50% { opacity: 0.5; transform: scale(0.85); } }
.hf-hero-title { font-family: 'Chivo', sans-serif; font-weight: 900; letter-spacing: -0.02em; line-height: 1; margin-top: 12px; }
.hf-hero-meta { display: flex; align-items: center; gap: 12px; margin-top: 10px; color: var(--text-secondary); font-size: 14px; flex-wrap: wrap; }
.hf-hero-meta .dot { width: 4px; height: 4px; border-radius: 50%; background: var(--text-muted); }

/* Countdown */
.hf-countdown { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 24px; max-width: 480px; }
.hf-cd-cell {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border-color); border-radius: 10px;
    padding: 12px 8px 10px; text-align: center;
}
.hf-cd-num { font-family: 'Chivo', sans-serif; font-weight: 900; font-variant-numeric: tabular-nums; line-height: 1; color: var(--text-primary); }
.hf-cd-label { font-family: 'Chivo', sans-serif; font-size: 10px; color: var(--text-muted); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 6px; font-weight: 600; }

/* Primary CTA */
.hf-cta-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    height: 48px; padding: 0 22px;
    border-radius: 10px; border: none;
    background: var(--f1-red); color: white;
    font-family: 'Chivo', sans-serif; font-weight: 700; font-size: 15px;
    cursor: pointer; margin-top: 22px;
    transition: background 0.15s, transform 0.1s;
    box-shadow: 0 4px 14px rgba(225,6,0,0.35);
}
.hf-cta-primary:hover { background: var(--f1-red-light); }
.hf-cta-primary:active { transform: translateY(1px); }

/* Container — per-breakpoint max-widths */
.hf-container { width: 100%; margin: 0 auto; padding-left: 16px; padding-right: 16px; }
@media (min-width: 768px)  { .hf-container { padding-left: 24px; padding-right: 24px; max-width: 760px; } }
@media (min-width: 1024px) { .hf-container { padding-left: 32px; padding-right: 32px; max-width: 1080px; } }
@media (min-width: 1440px) { .hf-container { padding-left: 48px; padding-right: 48px; max-width: 1280px; } }

/* Per-breakpoint type ramp on hero + page titles */
@media (min-width: 480px)  { .hf-hero-title { font-size: 44px; } .hf-cd-num { font-size: 34px; } }
@media (min-width: 768px)  { .hf-hero-title { font-size: 56px; } .hf-cd-num { font-size: 40px; } .hf-hero { padding: 44px 24px 36px; } }
@media (min-width: 1024px) { .hf-hero-title { font-size: 72px; } .hf-cd-num { font-size: 48px; } .hf-hero { padding: 64px 32px 56px; } }
@media (min-width: 1440px) { .hf-hero-title { font-size: 84px; } .hf-cd-num { font-size: 56px; } .hf-hero { padding: 80px 48px 72px; } }
```

See `hifi/style.css` in the bundle for the complete CSS (rows/cards, badges, stat tiles, profile head, rules layout, login card, admin tables, states reference). It's drop-in safe; every selector is namespaced under `.hf-*`.

## 2 · Header.php rewrite

**File:** `public/includes/header.php`

Replace the current `<nav class="nav">` block with the top bar + drawer pattern. Logic stays the same; only markup + classes change.

```php
<header class="hf-top">
    <a href="/" class="hf-logo">
        <span class="hf-logo-mark">F1</span>
        <span class="hf-logo-text">
            <?= escape($settings['app_title']) ?>
            <span class="yr"><?= escape($settings['app_year']) ?></span>
        </span>
    </a>
    <button class="hf-hamburger" data-link="toggleDrawer" aria-label="Menu">
        <span class="bars"><span></span><span></span><span></span></span>
    </button>
</header>

<nav class="hf-drawer" id="main-drawer" hidden>
    <a href="/" class="hf-drawer-row <?= $currentPage === 'index' ? 'active' : '' ?>">
        <i>⌂</i><span><?= t('home') ?></span>
    </a>
    <a href="races.php" class="hf-drawer-row <?= $currentPage === 'races' ? 'active' : '' ?>">
        <i>▶</i><span><?= t('races') ?></span>
    </a>
    <a href="leaderboard.php" class="hf-drawer-row <?= $currentPage === 'leaderboard' ? 'active' : '' ?>">
        <i>♔</i><span><?= t('leaderboard') ?></span>
    </a>
    <?php if ($currentUser): ?>
    <a href="rules.php" class="hf-drawer-row <?= $currentPage === 'rules' ? 'active' : '' ?>">
        <i>§</i><span><?= t('rules') ?></span>
    </a>
    <?php endif; ?>
    <?php if ($currentUser && $currentUser['role'] === 'admin'): ?>
    <a href="admin.php" class="hf-drawer-row <?= $currentPage === 'admin' ? 'active' : '' ?>">
        <i>⚙</i><span><?= t('admin') ?></span>
    </a>
    <?php endif; ?>
</nav>
```

**JS** to toggle the drawer (add to your existing scripts or wherever you handle `data-link` clicks):

```js
document.querySelectorAll('[data-link="toggleDrawer"]').forEach(btn => {
    btn.addEventListener('click', () => {
        const drawer = document.getElementById('main-drawer');
        drawer.hidden = !drawer.hidden;
    });
});
// Close drawer on outside click
document.addEventListener('click', (e) => {
    const drawer = document.getElementById('main-drawer');
    if (!drawer || drawer.hidden) return;
    if (!drawer.contains(e.target) && !e.target.closest('[data-link="toggleDrawer"]')) {
        drawer.hidden = true;
    }
});
```

**Drop everything else** — the inline `.nav`, `.controls.desktop-only`, `.mobile-nav-extras`, `.mobile-controls`, `.nav-overlay`, the second `@media (max-width: 768px)` block in `style.css` that handled the old drawer. The new pattern is one drawer at all widths; no media-query branching.




## 3 · Bottom bar partial

**New file:** `public/includes/bottom_bar.php` — include on every page that uses the new shell. Lives outside any `<main>` so it stays sticky.

```php
<nav class="hf-bottom">
    <?php if ($currentUser): ?>
        <a href="profile.php" class="hf-bb-item <?= $currentPage === 'profile' ? 'active' : '' ?>">
            <div class="hf-bb-icon" style="width:28px;height:28px;border-radius:50%;background:var(--bg-card);border:1.5px solid var(--f1-red);font-size:12px;">
                <?= strtoupper(substr($currentUser['display_name'] ?: $currentUser['email'], 0, 1)) ?>
            </div>
            <span><?= strtoupper(substr($currentUser['display_name'] ?: 'YOU', 0, 4)) ?></span>
        </a>
    <?php else: ?>
        <a href="login.php" class="hf-bb-item">
            <div class="hf-bb-icon" style="color: var(--f1-red);">→</div>
            <span><?= strtoupper(t('login')) ?></span>
        </a>
    <?php endif; ?>

    <a href="?toggle_theme=1" class="hf-bb-item">
        <div class="hf-bb-icon"><?= $theme === 'dark' ? '☀' : '☾' ?></div>
        <span>THEME</span>
    </a>

    <a href="?toggle_lang=1" class="hf-bb-item">
        <div class="hf-bb-icon">
            <?php if ($lang === 'da'): ?>
                <svg viewBox="0 0 60 45" width="22" height="16" style="border-radius:2px;box-shadow:0 0 0 1px rgba(255,255,255,0.12);"><rect width="60" height="45" fill="#C60C30"/><rect y="19" width="60" height="7" fill="#fff"/><rect x="19" width="7" height="45" fill="#fff"/></svg>
            <?php else: ?>
                <svg viewBox="0 0 60 45" width="22" height="16" style="border-radius:2px;box-shadow:0 0 0 1px rgba(255,255,255,0.12);"><rect width="60" height="45" fill="#012169"/><path d="M0,0 L60,45 M60,0 L0,45" stroke="#fff" stroke-width="9"/><path d="M0,0 L60,45 M60,0 L0,45" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v45 M0,22.5 h60" stroke="#fff" stroke-width="13"/><path d="M30,0 v45 M0,22.5 h60" stroke="#C8102E" stroke-width="7"/></svg>
            <?php endif; ?>
        </div>
        <span><?= $lang === 'da' ? 'DANSK' : 'ENGLISH' ?></span>
    </a>

    <a href="?toggle_font=1" class="hf-bb-item">
        <div class="hf-bb-icon" style="font-family: var(--display);">Aa</div>
        <span>FONT</span>
    </a>
</nav>
```

Mirror the existing `toggle_theme` / `toggle_lang` handlers in `header.php` for the new `toggle_font` query param. The font tweak is wireframe-only at the design-system level; you can stub it as a no-op or wire it to a user-pref column later.

## 4 · Per-page templates

Each page now wraps its content in this shape:

```php
<?php include 'includes/header.php'; ?>   <!-- top bar + drawer -->

<main class="hf-body" style="display:flex;flex-direction:column;min-height:calc(100vh - 56px - 64px);">
    <!-- hero or page header (varies) -->
    <!-- page content -->

    <footer class="hf-footer">
        <div class="hf-container">
            <span class="name"><?= escape($settings['app_title']) ?></span>
            <span class="v">v1.2.1</span>
            <span>· <?= t('season') ?> <?= escape($settings['app_year']) ?></span>
        </div>
    </footer>
</main>

<?php include 'includes/bottom_bar.php'; ?>
```

For **specific page layouts** (Home hero, Races filter chips, Leaderboard self-row, Profile Konto card, Rules TOC, Login intro panel, Race detail bet display), the JSX files under `hifi/` are your spec — they're the most precise reference. Read `hifi/home.jsx` next to your `index.php`, port the markup structure, swap React-isms for PHP/Twig, use the new `.hf-*` classes.

Key page layouts to port:

| Page | JSX reference | Notes |
|---|---|---|
| Home | `hifi/home.jsx` | `<HomeHero>` + `<StatsStrip>` + `<LeaderboardPreview count=5>` + `<RecentResults>`. At LG+, switch to 2-col grid. |
| Races | `hifi/races.jsx` | Filter chips (`.hf-seg`) + upcoming/past sections. 2-col grid at LG+. |
| Race detail | `hifi/race-detail.jsx` | Hero + "Dit bud" panel + "Alle bud (locked)" list. Same hero pattern as Home. |
| Leaderboard | `hifi/leaderboard.jsx` | Podium top-3 at MD+, self-row pinned, full list. Sidebar with "Din position" at LG+. |
| Profile | `hifi/profile.jsx` | Profile head + 4 stat tiles + Konto card (display name + flag + password) + bet history. 2-col at LG+. |
| Rules | `hifi/rules.jsx` | Numbered sections (`.hf-rule`). TOC sidebar at LG+, chip-row at MD, none at XS/SM. |
| Login | `hifi/login.jsx` | Card-only at XS/SM/MD. At LG/XL, splits with editorial intro left + card right. |

## 5 · Admin & Bet modal

**Admin** (`public/admin.php`):
- Wrap tabs in `<div class="admin-shell">` (already from v1.0.1).
- At MD+, tabs wrap to a second row; at XS/SM, native `<details class="admin-dropdown">` replaces them.
- Race admin table uses a 6-col grid at LG+: `#` / Navn / Dato / Status / Bud / actions. At XS/SM, falls back to `.hf-racecard` rows with edit icon.
- See `hifi/admin.jsx` for the exact column widths and badge mappings.

**Bet modal** (likely a `<dialog>` or overlay in your stack):
- Full-screen on XS/SM (no border-radius, fills viewport).
- Centered card (`max-width: 560px`) on MD+.
- 5-step flow: empty → picker for 1st → 1st filled + picker for 2nd → all 3 filled → success. Reference `hifi/bet-flow.jsx`.
- Driver picker sheet renders inline below the active position, not as a nested modal.
- Already-picked drivers show with `opacity: 0.4` and `cursor: not-allowed` to prevent double-picking.

## 6 · Testing checklist

| Test | Expected |
|---|---|
| Resize 320 → 1920 on home | No layout breaks, no horizontal scroll, hero scales smoothly, drawer remains accessible |
| Toggle dark/light via bottom bar | All pages flip; no white-on-white, no missing borders |
| Tap hamburger on mobile | Drawer drops with animation, traps focus, closes on outside click |
| Place a bet end-to-end | 5 steps all reachable, can't pick same driver twice, success state shows podium summary |
| Admin tabs at 600px (XS) | Dropdown appears, no horizontal scroll |
| Admin tabs at 1200px (LG) | Tabs visible, wrap to second row if needed |
| Leaderboard | Your row pinned at top regardless of position |
| Footer | "Frederikssund F1 Klub · v1.2.1 · Sæson 2026" visible at bottom of every content page |

## What this release does NOT include

- **New color tokens** — palette stays v1.1.0; broadcast red, neutrals, and gold are unchanged.
- **New production fonts** — hi-fi keeps the existing **Chivo + Manrope** stack. The Patrick Hand and Special Elite fonts you saw in the design were **wireframe-only sketch fonts** (in `wireframe/style.css`); they are not part of the production design and should not be loaded by the live site.
- **Imagery** — no photos, illustrations, or icons added (Font Awesome usage carried forward).
- **Auth flow logic** — only `login.php` markup changes; session handling, password reset, invite redemption logic unchanged.

## Backend changes required

The redesign is mostly markup + CSS, but **two features need backend work** — don't skip these or the leaderboard ships broken:

### Rank-delta on leaderboard (“↑ 2 pladser siden sidste runde”)

The self-position card on the leaderboard shows the user's rank movement since the previous round. Two equally valid implementations:

**Option A — add a snapshot table (recommended for performance + clarity):**
```sql
CREATE TABLE leaderboard_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    round_id INT NOT NULL,    -- references the race that just completed
    rank INT NOT NULL,
    points INT NOT NULL,
    stars INT NOT NULL,
    created_at DATETIME NOT NULL,
    UNIQUE KEY uniq_user_round (user_id, round_id),
    INDEX idx_round (round_id)
);
```
Write a row per user when a race result is finalized. Read the latest two snapshots per user to compute the delta.

**Option B — compute on the fly with a window function** over `bet_results`:
```sql
SELECT
  user_id,
  RANK() OVER (PARTITION BY round_id ORDER BY cumulative_points DESC) AS rank,
  LAG(RANK() OVER (PARTITION BY round_id ORDER BY cumulative_points DESC))
    OVER (PARTITION BY user_id ORDER BY round_id) AS previous_rank
FROM round_cumulative_points
WHERE round_id IN (current_round, previous_round);
```
No schema change, but more expensive per page load. Cache the result for the round.

Pick A if the leaderboard is hit often. Pick B if you want zero migrations.

### Pool size in DKK (“Puljen · 1.240 kr”)

The home page stats strip displays the pool size in Danish kroner. If `settings` doesn't yet have a configurable pool-per-round amount or a query that sums pool contributions, add one:
```sql
ALTER TABLE settings
    ADD COLUMN pool_size_dkk INT NOT NULL DEFAULT 0;
```
Or derive: `SUM(round_pool_dkk) FROM rounds WHERE season_id = current AND status != 'settled'`.

## Files left untouched

- `config.php` and CSP nonces
- Email templates
- Authentication / session / invite-redemption logic
- Driver / race seed data
- All admin business logic (only the tab markup changes; CRUD handlers stay)
