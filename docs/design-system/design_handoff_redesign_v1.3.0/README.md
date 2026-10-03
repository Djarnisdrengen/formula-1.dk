# Handoff: Full website redesign · v1.3.0

> **Design System version:** `v1.3.0` · 2026-05-18 · see [CHANGELOG.md](./CHANGELOG.md)

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
6. **Versioned footer** on every page — `Frederikssund F1 Klub · v1.3.0 · Sæson 2026`.
7. **Acceptance criteria** — every page + feature in this handoff now has explicit, testable pass/fail criteria. See section 7.

## Files in this bundle

```
design_handoff_redesign_v1.3.0/
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
   v1.3.0 — New navigation shell + page footer
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
            <span class="v">v1.3.0</span>
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

## 6 · Testing checklist (smoke)

Run these first. They take ~5 minutes and catch ~80% of regressions.

| Test | Expected |
|---|---|
| Resize 320 → 1920 on home | No layout breaks, no horizontal scroll, hero scales smoothly, drawer remains accessible |
| Toggle dark/light via bottom bar | All pages flip; no white-on-white, no missing borders |
| Tap hamburger on mobile | Drawer drops with animation, traps focus, closes on outside click |
| Place a bet end-to-end | 5 steps all reachable, can't pick same driver twice, success state shows podium summary |
| Admin tabs at 600px (XS) | Dropdown appears, no horizontal scroll |
| Admin tabs at 1200px (LG) | Tabs visible, wrap to second row if needed |
| Leaderboard | Your row pinned at top regardless of position |
| Footer | "Frederikssund F1 Klub · v1.3.0 · Sæson 2026" visible at bottom of every content page |

## 7 · Acceptance criteria

Per-feature pass/fail criteria. The release is **not shippable** until every checkbox here is green in staging on the full browser matrix (see §7.10). Each item is intentionally testable by one person in ≤2 minutes; if you can't decide pass/fail by looking, the criterion is wrong — raise it and we'll tighten it.

### 7.1 — Shell: top bar, drawer, bottom bar, footer

- [ ] **AC-SHELL-01** — `.hf-top` is present on every authenticated and unauthenticated page, sticks to `top: 0`, height = `56px`, contains exactly two children: `.hf-logo` (left) and `.hf-hamburger` (right).
- [ ] **AC-SHELL-02** — Logo mark renders as a 32×32 red square with the text "F1" in Chivo 900; clicking it navigates to `/` regardless of current page.
- [ ] **AC-SHELL-03** — Hamburger button has `aria-label="Menu"`, `aria-expanded` toggles between `"false"` and `"true"` on open/close, and `aria-controls="main-drawer"`.
- [ ] **AC-SHELL-04** — Drawer (`#main-drawer`) opens with the `hf-drop` animation (≤250ms), is dismissed by: (a) clicking outside, (b) pressing `Esc`, (c) clicking the hamburger again, (d) clicking any nav row inside it.
- [ ] **AC-SHELL-05** — Drawer rows show: Home, Races, Leaderboard for everyone; Rules only when logged in; Admin only when `role === 'admin'`. The current page's row has the `.active` class (red right-rail + red icon).
- [ ] **AC-SHELL-06** — `.hf-bottom` is present on every page, sticks to `bottom: 0`, height = `64px`, contains exactly 4 cells in a `repeat(4, 1fr)` grid. The 4 cells are: Profile-or-Login, Theme, Language, Font (in that order).
- [ ] **AC-SHELL-07** — Profile cell shows the logged-in user's initial in a 28px red-bordered circle, and the first 4 letters of their display name in uppercase below. Logged-out users see a red "→" arrow and the localized "LOG IND" / "LOGIN" label.
- [ ] **AC-SHELL-08** — `.hf-footer` is the last child of `<main class="hf-body">` (sits **above** the bottom bar in source order), shows the literal string `Frederikssund F1 Klub · v1.3.0 · Sæson 2026` (with locale-correct season label), and the `v1.3.0` chip is rendered in Courier Prime.

### 7.2 — Responsive: 5 breakpoints

Test by resizing a desktop browser; each breakpoint has an exact pixel boundary. No layout may break, scroll horizontally, or overflow at any width from **320px to 1920px**.

| BP | Min width | Container max | Hero title size | Verify |
|---|---|---|---|---|
| XS | 320 | 100% − 32px | 36px | Single column, drawer is the only nav, admin uses `<details>` dropdown |
| SM | 480 | 100% − 32px | 44px | Single column, countdown cells legible (≥34px num) |
| MD | 768 | 760px | 56px | Container caps, admin tabs visible + wrappable, leaderboard podium appears |
| LG | 1024 | 1080px | 72px | Home/Profile/Rules switch to 2-col grid, Rules TOC sidebar visible |
| XL | 1440 | 1280px | 84px | Login splits to editorial intro + card, hero padding maxes out |

- [ ] **AC-RESP-01** — At every breakpoint boundary (±1px on either side), no element overflows its container and no scrollbar appears horizontally.
- [ ] **AC-RESP-02** — `.hf-container` max-widths match the table above. Padding is `16px` / `16px` / `24px` / `32px` / `48px` per breakpoint.
- [ ] **AC-RESP-03** — `.hf-hero-title` and `.hf-cd-num` scale per the type ramp in `style.css`. No font size is hardcoded outside the ramp.
- [ ] **AC-RESP-04** — At LG+ on Home, Profile, Rules, Races, the layout uses a real CSS grid (`grid-template-columns: 2fr 1fr` or similar), **not** a JS-resized div.

### 7.3 — Theme & language toggles

- [ ] **AC-THEME-01** — Tapping the THEME cell flips `<body>` class between `dark` and `light` and persists via the same query-param + cookie flow as v1.1.0. The icon swaps between `☀` and `☾` correspondingly.
- [ ] **AC-THEME-02** — Every page renders correctly in **both** themes: no white-on-white text, no missing borders, no invisible icons. Spot-check Home, Races, Race detail, Bet modal, Leaderboard, Profile, Rules, Login, Admin in both themes.
- [ ] **AC-LANG-01** — Tapping the LANGUAGE cell flips between Danish and English and persists. The SVG flag swaps between Dannebrog and Union Jack; the label below swaps between "DANSK" and "ENGLISH".
- [ ] **AC-LANG-02** — All page chrome (nav, buttons, badges, footer, validation errors) localizes. No raw `t('key')` placeholders leak through. No mixed-language sentences in chrome copy.
- [ ] **AC-FONT-01** — Tapping the FONT cell is a no-op for now (stub OK), does not throw a console error, does not 404. Document the stub in `bottom_bar.php` with a `TODO`.

### 7.4 — Home page

- [ ] **AC-HOME-01** — The next upcoming race renders in `.hf-hero` with: live "BETTING OPEN" / "BETTING CLOSED" eyebrow, race name as `.hf-hero-title`, location + date in `.hf-hero-meta`, 4-cell countdown (D/H/M/S) updating every second on the client.
- [ ] **AC-HOME-02** — Countdown numbers are in Chivo 900, `font-variant-numeric: tabular-nums` so they don't shift width as digits change.
- [ ] **AC-HOME-03** — Primary CTA reads "Læg dit bud →" (DA) / "Place your bet →" (EN), links to the bet flow for the next race, and is **disabled** (visually + `aria-disabled`) when betting is closed.
- [ ] **AC-HOME-04** — When no upcoming race exists, hero shows the empty state copy "Ingen kommende løb" / "No upcoming races" and the CTA is hidden (not just disabled).
- [ ] **AC-HOME-05** — Stats strip below hero shows: Puljen (pool in DKK), Aktive spillere (active player count), Næste deadline (countdown duplicate, smaller). Pool value reads from `settings.pool_size_dkk` or the derived sum (see §Backend changes).
- [ ] **AC-HOME-06** — Leaderboard preview shows top 5 with position chips (gold/silver/bronze for 1–3, neutral for 4–5), points, and stars (`★N`). Tapping any row navigates to the full leaderboard.

### 7.5 — Races, Race detail, Bet flow

- [ ] **AC-RACE-01** — Races page shows two sections: "Kommende løb" (chronological ascending) and "Tidligere løb" (chronological descending). Each section title is in Chivo 800.
- [ ] **AC-RACE-02** — Filter chips (`.hf-seg`) above the list filter by status: All / Open / Closed / Past. Active chip has red text + 2px red bottom border. Filter state persists via querystring `?filter=open`.
- [ ] **AC-RACE-03** — Race detail page shows: hero (same pattern as Home), "Dit bud" panel (your prediction), "Alle bud" list (locked until race start). Each user's predicted P1·P2·P3 string renders in Courier Prime.
- [ ] **AC-RACE-04** — Bet modal: on XS/SM fills the viewport (no border-radius, no margins); on MD+ centers as a `max-width: 560px` card with 16px radius. Overlay is `rgba(0,0,0,0.7)`, no backdrop-blur.
- [ ] **AC-RACE-05** — Bet flow is exactly 5 states: empty → picker for P1 → P1 filled + picker for P2 → all 3 filled + Confirm button → success. State 5 shows a podium summary and auto-dismisses after 2s (or on tap).
- [ ] **AC-RACE-06** — Already-picked drivers in the picker render at `opacity: 0.4`, `cursor: not-allowed`, and ignore tap events. Tapping a different position lets you reassign.
- [ ] **AC-RACE-07** — Submitting a bet that matches the qualification result shows the validation error "Bet kan ikke matche kvalifikationsresultatet" (terse, no apology). Submit button is re-enabled.
- [ ] **AC-RACE-08** — A user who has already bet on a race sees the "Du har allerede placeret et bud på dette løb" empty-state in place of the modal trigger, with an "Edit bet" pencil icon if the race is still open.

### 7.6 — Leaderboard, Profile

- [ ] **AC-LB-01** — Logged-in user's row is **pinned at the top** of the table (above row 1) with a "DIG" / "YOU" badge, regardless of their actual rank. The same user also appears in their natural rank position below — clearly the same row (same name, points, stars), not deduped.
- [ ] **AC-LB-02** — At MD+, top-3 render as a podium (gold > silver > bronze cards) **above** the table; at XS/SM, podium collapses into the top 3 rows of the table with their respective gradient tints.
- [ ] **AC-LB-03** — "Din position" sidebar at LG+ shows: current rank, points, stars, **rank delta vs previous round** (`↑ 2 pladser` / `↓ 1 plads` / `=`). Delta arrow is colored green / red / muted.
- [ ] **AC-LB-04** — "Perfect bet" users get the gold ★ chip with the `star-pulse` animation; chip is set in Chivo so the star is the font glyph, not an emoji.
- [ ] **AC-PROF-01** — Profile head shows avatar (initial in red-bordered circle), display name in Chivo 800, joined date in Courier Prime.
- [ ] **AC-PROF-02** — 4 stat tiles: Total points, Stars, Best finish (Pn), Bets placed. Tiles use `font-variant-numeric: tabular-nums` and Chivo 900 for the number.
- [ ] **AC-PROF-03** — Konto card has 3 rows: Display name (editable inline), Language (flag toggle), Password (masked, readout in Courier Prime, "Skift" button opens the change-password flow). Two action buttons at the bottom: "Log ud" (ghost) and "Slet konto" (danger / red text).
- [ ] **AC-PROF-04** — Bet history list shows last 10 bets, each row: race name + date, prediction (Courier Prime), result (P1·P2·P3 or em-dash if not raced), points earned, ★ if perfect.

### 7.7 — Rules, Login, Admin

- [ ] **AC-RULES-01** — Rules page renders as numbered editorial sections (`.hf-rule`), each with a Chivo 800 heading prefixed by its number ("1.", "2.", ...) and a body in Manrope 1.6 line-height.
- [ ] **AC-RULES-02** — TOC sidebar visible at LG+ (sticky, follows scroll, current section highlighted in red). At MD, TOC collapses to a horizontal chip row above the content. At XS/SM, no TOC.
- [ ] **AC-RULES-03** — Inline `<code>` and `.kbd` chips render in Courier Prime with `--bg-secondary` background.
- [ ] **AC-LOGIN-01** — Login page is a single card centered in the viewport at XS/SM/MD; at LG/XL, splits into a 2-col grid: editorial intro on the left, login card on the right (max-width 480px).
- [ ] **AC-LOGIN-02** — Form validation: empty email → "Email er påkrævet"; bad format → "Ugyldig email"; short password → "Adgangskoden skal være mindst 6 tegn". Errors render below the field in red, no toast.
- [ ] **AC-LOGIN-03** — Password input uses `letter-spacing: 0.2em` so the bullet style reads as typewriter dots (Courier Prime). "Vis"/"Skjul" toggle reveals the field in cleartext.
- [ ] **AC-LOGIN-04** — "Glemt adgangskode?" link navigates to `forgot_password.php`, which uses the same card layout and produces a success state ("Tjek din indbakke") on submit — no full page reload required if JS is available.
- [ ] **AC-ADMIN-01** — At MD+, admin tabs render as wrapping pills in a `flex-wrap` row. Active tab has red text + 2px red bottom border. Each tab shows a count chip (Courier Prime) when relevant.
- [ ] **AC-ADMIN-02** — At XS/SM, tabs collapse into a native `<details class="admin-dropdown">` element. **Only one** of (tabs, dropdown) is visible at any width — never both simultaneously.
- [ ] **AC-ADMIN-03** — Race admin table at LG+ uses a 6-col grid: `#` / Navn / Dato / Status / Bud / actions. Column widths match `hifi/admin.jsx`.
- [ ] **AC-ADMIN-04** — Edit form active state on a race row gets the 2px red border + `pulse-border` animation (2s, infinite).

### 7.8 — Email templates

- [ ] **AC-EMAIL-01** — All 5 templates (invite, password-reset, race-reminder, results-posted, welcome) render correctly in Gmail (web + iOS + Android), Outlook (desktop + web), and Apple Mail. **Outlook on Windows is the failure case** — if it renders there, it ships.
- [ ] **AC-EMAIL-02** — Each template uses inline-styled `<table>` markup (no flexbox, no grid). No `<link>` to Google Fonts. Font stack is `-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif`.
- [ ] **AC-EMAIL-03** — Header lockup shows the correct logo asset (`logo_header_dark.png` for dark themes, `logo_header_light.png` for light) at 32px square.
- [ ] **AC-EMAIL-04** — Primary CTA button uses the exact inline-style block from §Email templates, with the arrow character `→` (not SVG).
- [ ] **AC-EMAIL-05** — Footer mirrors the web footer line: `Frederikssund F1 Klub · v1.3.0 · Sæson 2026`, in 11px muted gray, centered.
- [ ] **AC-EMAIL-06** — All copy is sentence-case (e.g. "Velkommen til klubben", not "VELKOMMEN TIL KLUBBEN"). Subject lines too.

### 7.9 — Backend changes

- [ ] **AC-BE-01** — Leaderboard rank delta returns a correct signed integer (positive = moved up the leaderboard, negative = moved down, `0` for no change, `null` for first-ever round). Verify with a fixture user who moved P5 → P3 (expect `+2`).
- [ ] **AC-BE-02** — Either Option A (snapshot table) or Option B (window function) is shipped. Whichever is shipped, the query for the home page leaderboard preview must execute in **<50ms** on a dataset of 10 users × 24 rounds.
- [ ] **AC-BE-03** — `settings.pool_size_dkk` (or the equivalent derived sum) renders on the home stats strip as a Danish-formatted integer with `kr` suffix (`1.240 kr`, not `1,240 kr` or `1240kr`).
- [ ] **AC-BE-04** — Migrations are reversible. Provide `up()` and `down()` for any new table or column added.

### 7.10 — Accessibility

- [ ] **AC-A11Y-01** — Every interactive element has a visible `:focus-visible` ring (3px, `rgba(225,6,0,0.4)`). Verify by tabbing through Home → Races → Bet modal → Profile.
- [ ] **AC-A11Y-02** — Bet modal traps focus while open: `Tab` cycles within the modal, `Shift+Tab` cycles backward, `Esc` closes it and returns focus to the trigger button.
- [ ] **AC-A11Y-03** — Drawer is keyboard-operable: hamburger receives focus, `Enter`/`Space` opens it, focus moves into the drawer's first row, `Esc` closes it and returns focus to the hamburger.
- [ ] **AC-A11Y-04** — All form inputs have a programmatically-associated `<label>` (not just a placeholder). All buttons have text or `aria-label`.
- [ ] **AC-A11Y-05** — Body text contrast meets **WCAG AA** (≥4.5:1) in both themes. Muted text + accent reds documented with their actual ratios in `colors_and_type.css`.
- [ ] **AC-A11Y-06** — Animations respect `prefers-reduced-motion: reduce` — `hf-drop`, `hf-pulse`, `star-pulse`, `pulse-border`, and the modal scale-in all collapse to instant transitions.

### 7.11 — Browser & device matrix

Smoke + acceptance must pass on each of:

| Browser | Version | Platform |
|---|---|---|
| Safari | latest + latest−1 | iOS 17+, macOS 14+ |
| Chrome | latest | Android 13+, macOS, Windows 11 |
| Firefox | latest | macOS, Windows 11 |
| Edge | latest | Windows 11 |

- [ ] **AC-COMPAT-01** — Verified on every browser/platform pair above. No JS errors in the console on any page.
- [ ] **AC-COMPAT-02** — `backdrop-filter: blur(14px)` on `.hf-top` and `.hf-bottom` degrades gracefully where unsupported (the `rgba(28,28,32,0.92)` background is still opaque enough to be legible).
- [ ] **AC-COMPAT-03** — Touch targets on XS/SM are ≥44×44px (bottom-bar cells, hamburger, drawer rows, bet picker rows).

### 7.12 — Performance

- [ ] **AC-PERF-01** — Home page LCP < **2.5s** on a throttled "Fast 3G" profile, measured with Lighthouse mobile preset.
- [ ] **AC-PERF-02** — No CLS shift > **0.1** on any page. The hero countdown must not cause layout shift as digits change (enforced by `font-variant-numeric: tabular-nums` per AC-HOME-02).
- [ ] **AC-PERF-03** — Total CSS payload (gzipped) for `style.css` is **<60KB**. v1.2.3 was 47KB; v1.3.0 added only docs, so no regression here is expected.
- [ ] **AC-PERF-04** — Google Fonts request loads with `&display=swap` so no FOIT (flash of invisible text). Fallback stack must render correctly during the swap window.

### 7.13 — Sign-off

- [ ] **AC-SIGNOFF-01** — All §7.1–§7.12 checkboxes are ticked in the PR description, with screenshots attached for each page in both themes at XS, MD, and LG (9 screenshots × 2 themes = 18 minimum).
- [ ] **AC-SIGNOFF-02** — A short Loom or screen-recording of the bet flow end-to-end is attached.
- [ ] **AC-SIGNOFF-03** — `CHANGELOG.md` entry written in the F1Betting repo matching the v1.3.0 release.
- [ ] **AC-SIGNOFF-04** — One of the 10 club members has clicked through the staging URL on their actual phone and signed off in the chat thread.

## Typography — production stack

v1.3.0 keeps the v1.2.3 4-font stack unchanged. **Two are primary** (don't replace them) and **two are accents** (use sparingly — each has a clear semantic role).

| Font | Role | Use for | Don't use for |
|---|---|---|---|
| **Chivo** | Display (primary) | Headlines, button labels, badges, large numerals | Body copy |
| **Manrope** | Body (primary) | Paragraphs, descriptions, default UI text | Display headlines |
| **Kalam** | Accent · handwriting | Page ledes (the sentence after a page H1), friendly empty-state copy, callouts that want clubhouse warmth | Body paragraphs, dense UI, anything official |
| **Courier Prime** | Accent · typewriter | Timestamps, meta/breadcrumbs, prediction strings ("Verstappen · Norris · Leclerc"), code snippets, version strings | Headlines, body, navigation |

### Where to load them

Replace the current `@import` in `public/assets/css/style.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Chivo:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700&family=Kalam:wght@300;400;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
```

And add the new variables in `:root`:

```css
:root {
    /* existing tokens … */
    --font-display: 'Chivo', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    --font-body:    'Manrope', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    --font-accent:  'Kalam', 'Patrick Hand', cursive;
    --font-mono:    'Courier Prime', ui-monospace, Menlo, monospace;
}
```

### Where they're wired in this release

**Kalam** is applied to:
- `.hf-pageh .lede` — the editorial paragraph after page H1s (Rules, Leaderboard, Profile, Races).
- Any future class that wants "committee newsletter" warmth — use sparingly.

**Courier Prime** replaces all uses of `ui-monospace, Menlo, monospace` for:
- `.hf-footer .v` — the `v1.2.3` version chip in the footer.
- `.hf-rule code` and `.hf-rule .kbd` — inline code + keyboard chips in Rules.
- Bet prediction strings (e.g. "Verstappen · Norris · Leclerc") on Profile.
- Race-card timestamp meta on Profile / Races.
- Tab-count chips in Admin ("12", "3").
- The masked password readout on the Profile Konto card.
- Login password input (letter-spacing 0.2em for the bullet style).

`ui-monospace` stays as the fallback inside the `--font-mono` declaration, so if Courier Prime ever fails to load, the visuals are still recognizable as typewriter / code.

Note: Patrick Hand and Special Elite remain wireframe-only sketch fonts in `wireframe/style.css` and do NOT ship to production.

## Email templates — update required

The transactional emails (invitation, password reset, race reminder, results posted) currently render in the old broadcast palette with the previous logo lockup, and contain no reference to the v1.2.x/v1.3.x visual language. **They must be updated** as part of this release so the brand experience is consistent end-to-end — receiving an email from the redesigned site that still looks like the old site is the most jarring possible regression.

### What to update

For each template under `public/emails/` (or wherever your stack stores them):

1. **Header lockup** — replace any inline `<img>` of the old logo with the v1.2.x logo image (32px square red mark + display name). If the email theme is dark, use the dark logo asset; otherwise light. Inline-styled `<table>` markup, not flexbox — most mail clients (Outlook especially) still don’t parse modern CSS.
2. **Type stack** — emails should declare:
   ```css
   font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
   ```
   Do NOT link to Google Fonts in email; Gmail strips it and Outlook ignores it. The web fonts (Chivo, Manrope) won’t reliably load anywhere — fall back to a clean system stack.
3. **Primary CTA** — reskin the action button to match the redesign:
   ```html
   <a href="..." style="display:inline-block; background:#e10600; color:#ffffff; padding:14px 28px; border-radius:8px; font-weight:700; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:15px; text-decoration:none; letter-spacing:-0.005em;">Læg dit bud →</a>
   ```
   The arrow character (→) is universally supported; avoid inline SVG (Outlook drops it).
4. **Footer** — mirror the new web footer line:
   ```html
   <p style="font-family:-apple-system,...; font-size:11px; color:#8e8e95; text-align:center;">
     Frederikssund F1 Klub · v1.3.0 · Sæson 2026
   </p>
   ```
5. **Tone** — sentence-case copy throughout, matching the clubhouse-newsletter voice from the redesign. e.g. invite email subject becomes "Velkommen til klubben" not "VELKOMMEN TIL KLUBBEN".
6. **Test in:** Gmail (web + iOS + Android), Outlook (desktop + web), Apple Mail. Use [Litmus](https://www.litmus.com/) or [Email on Acid](https://www.emailonacid.com/) if you have a license. **Outlook on Windows is the failure case** — if it renders there, it renders everywhere.

### Templates to touch (file names will vary in your setup)

| Template | Triggered by |
|---|---|
| `invite.html` | Admin creating a new member invitation |
| `password-reset.html` | User clicking "Glemt adgangskode?" on login |
| `race-reminder.html` | Cron job, day-of-race morning, before betting closes |
| `results-posted.html` | Cron job, after race results are finalized |
| `welcome.html` | Sent immediately after a new user redeems an invite |

## What this release does NOT include

- **New color tokens** — palette stays v1.1.0; broadcast red, neutrals, and gold are unchanged.
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
- **Email templates logic** \u2014 the templates themselves must be reskinned (see *Email templates* section above), but the underlying mailer / queue / scheduling code is unchanged.
- Authentication / session / invite-redemption logic
- Driver / race seed data
- All admin business logic (only the tab markup changes; CRUD handlers stay)
