# Handoff: Responsive Navigation

> **Design System version:** `v1.0.1` · 2026-05-14 · see [CHANGELOG.md](./CHANGELOG.md)

Top-nav and admin menu rebuilt to scale gracefully from desktop to mobile without horizontal scroll and without squeezing the logo when admin/extra menu items appear.

## About the design files

The HTML in `preview/nav-responsive.html` is a **design reference**, not production code. It demonstrates the target layout behaviour at four container widths plus the new mobile admin pattern. Your task is to apply the changes described below to the **existing PHP codebase** — primarily `public/assets/css/style.css`, `public/includes/header.php`, and `public/admin.php` — preserving every existing class name so other styles keep working.

## Fidelity

**High-fidelity.** Exact CSS values are provided. The HTML prototype renders the same final visual that the production site should match after the patch is applied.

## What problem this solves

Today:
- The 768px media-query is the only breakpoint. Between 769–1100px the header gets cramped when admin items are present — logo text wraps and nav links collide with controls.
- The mobile admin tabs scroll horizontally, which is poor UX and easy to miss.
- Adding any new nav item makes the cramping worse because nothing collapses gracefully.

After the patch:
- The header has **four progressive stages** driven by container queries (not viewport media queries), so it reacts to its own available width.
- The admin menu **stays as tabs on desktop and becomes a native `<details>` dropdown below 720px** — no horizontal scroll, no JS required.
- Adding new nav or admin items just works; every stage absorbs them.

## The four header stages

| Stage | Container width | Behaviour |
|---|---|---|
| **A** | ≥ 1024px | Full text labels, year visible, user name visible |
| **B** | 720–1024px | Nav collapses to **40×40 icon-only buttons**, `tooltip` via `title=`, year hidden, user name hidden |
| **C** | 560–720px | Same as B; controls cluster tightens |
| **D** | < 560px | Hamburger drawer anchored under header; nav becomes vertical list with full labels |

Breakpoints are encoded as **container queries** against `.header` (which gets `container-type: inline-size`) so they evaluate against the actual header width, not viewport — important because `.container` has `max-width: 1200px` plus padding, so on tablets and in dev-tools split panes the viewport ≠ header width.

## Files to change in the F1Betting repo

### 1. `public/assets/css/style.css` — append after the existing header block

```css
/* ============================================================
   Responsive header — container-query based
   Replaces the old `@media (max-width: 768px) { .nav { … } }`
   that swapped to mobile drawer.
   ============================================================ */
.header {
    container-type: inline-size;
    container-name: header-vp;
}
.header-content {
    min-width: 0;            /* KEY: allow children to truncate */
}
.logo {
    min-width: 0;            /* KEY: let logo-text ellipsize */
    flex: 0 1 auto;
}
.logo-text {
    font-size: clamp(0.95rem, 1.5cqi + 0.6rem, 1.25rem);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
}
.nav {
    flex: 1 1 auto;
    justify-content: center;
    min-width: 0;
}
.btn-primary { white-space: nowrap; }

/* Stage B+C: icon-only nav, year hidden, user name hidden */
@container header-vp (max-width: 1024px) {
    .logo-year { display: none; }
    .nav-link span { display: none; }
    .nav-link {
        padding: 0.5rem;
        width: 40px; height: 40px;
        justify-content: center;
    }
    .nav-link i { font-size: 16px; width: auto; }
    .user-name { display: none; }
}

/* Stage D: hamburger drawer */
@container header-vp (max-width: 560px) {
    .mobile-menu-btn { display: inline-flex; }
    .header-content { position: relative; }
    .nav {
        position: absolute;
        top: 100%; right: 0; left: auto;
        flex-direction: column;
        align-items: stretch;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 0.5rem;
        min-width: 240px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        z-index: 50;
        display: none;
        margin-top: 0.5rem;
        /* override the existing fixed/right:-100% mobile rules */
        height: auto;
        width: auto;
        transition: none;
    }
    .nav.active { display: flex; right: 0; }
    .nav-link span { display: inline; }
    .nav-link {
        width: 100%; height: auto;
        justify-content: flex-start;
        padding: 0.65rem 0.75rem;
    }
    .nav-link.active::after { display: none; }
    .nav-link.active { border-left: 3px solid var(--f1-red); background: var(--bg-hover); }
    .controls .btn-primary span,
    .user-name { display: none; }
}
```

**Then delete or comment out** these existing blocks in `style.css` — they're now handled above and will conflict:

- Lines ~789–810 (the `.header-content { flex-wrap: wrap; }` + `.nav { order: 3; width: 100%; }` block inside the first `@media (max-width: 768px)`)
- Lines ~1146–1265 (the second mobile block: `.nav { position: fixed; right: -100%; … }`, `.nav.active { right: 0; }`, the entire `.mobile-nav-extras`, `.nav-overlay`, etc.)

The drawer is now anchored to the header (`position: absolute; top: 100%`) instead of a full-height side-fixed panel — simpler, no overlay needed, body stays scrollable.

### 2. `public/includes/header.php` — keep markup, simplify drawer

The existing markup is fine. The `.mobile-nav-extras` block (Profil / Log ud / mobile-controls inside the nav) can stay — it'll be visible at Stage D only. Make sure the mobile menu button JS toggles `.nav.active` (it already does via `data-link="toggleMobileMenu"`).

Add a tooltip via `title=""` to each `<a class="nav-link">` so Stage B icon-only mode is discoverable:

```php
<a href="leaderboard.php"
   class="nav-link <?= $currentPage === 'leaderboard' ? 'active' : '' ?>"
   title="<?= t('leaderboard') ?>">
    <i class="fas fa-trophy"></i> <span><?= t('leaderboard') ?></span>
</a>
```

### 3. `public/assets/css/style.css` — admin tabs section

Replace the existing `.tabs` rule (~line 708) and the mobile admin tabs block (~line 1397) with:

```css
/* ============================================================
   Admin menu — tabs on desktop, dropdown on mobile
   ============================================================ */
.admin-shell {
    container-type: inline-size;
    container-name: admin-vp;
}

.tabs {
    display: flex;
    flex-wrap: wrap;           /* changed: was overflow-x: auto */
    gap: 0.25rem;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 1.5rem;
}
/* keep existing .tab and .tab.active rules unchanged */

/* Mobile dropdown — hidden on desktop, shown below 720px */
.admin-dropdown { display: none; }
.admin-dropdown summary {
    list-style: none;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Chivo', sans-serif;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
}
.admin-dropdown summary::-webkit-details-marker { display: none; }
.admin-dropdown summary .label { display: flex; align-items: center; gap: 0.6rem; }
.admin-dropdown summary .label > i:first-child { color: var(--f1-red); }
.admin-dropdown summary .chev { transition: transform 0.2s; color: var(--text-muted); }
.admin-dropdown[open] summary .chev { transform: rotate(180deg); }
.admin-dropdown .menu {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 4px;
    margin-bottom: 16px;
    display: flex; flex-direction: column;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}
.admin-dropdown .menu a {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 0.85rem;
    color: var(--text-secondary);
    text-decoration: none;
    font-family: 'Chivo', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 6px;
}
.admin-dropdown .menu a .l { display: flex; align-items: center; gap: 0.65rem; }
.admin-dropdown .menu a:hover { background: var(--bg-hover); color: var(--text-primary); }
.admin-dropdown .menu a.active { background: var(--bg-hover); color: var(--f1-red); }

@container admin-vp (max-width: 720px) {
    .tabs { display: none; }
    .admin-dropdown { display: block; }
}

/* Viewport-media-query fallback — fires even if the page hasn't been
   wrapped in .admin-shell yet. Container query above wins where it applies. */
@media (max-width: 720px) {
    .tabs { display: none; }
    .admin-dropdown { display: block; }
}
```

**Delete** the old `@media (max-width: 768px) { .tabs { overflow-x: auto; …` block — the dropdown replaces it. **This step is required** — if left in place, the tabs will stay visible on mobile and you'll see both the old tabs and the new dropdown.

### Troubleshooting: "I see both menus on mobile"

If the old tabs *and* the new dropdown are both showing below 720px, one of these is true:

1. **The old `@media (max-width: 768px) { .tabs { overflow-x: auto; … } }` block in `style.css` was not deleted.** It keeps the tabs visible. Remove it.
2. **The `.admin-shell` wrapper is missing in `admin.php`.** Container query has nothing to evaluate. The viewport-media-query fallback above will catch this, but wrapping in `.admin-shell` is still recommended for accurate component-level scaling.
3. **A different stylesheet overrides `.tabs { display: none }`** — check DevTools → Computed for `.tabs` and look for a competing rule. If found, raise specificity: `body .admin-shell .tabs { display: none; }`.

### 4. `public/admin.php` — wrap tabs + add dropdown

Wrap the entire admin tab section in `<div class="admin-shell">` and duplicate the tab list as a `<details class="admin-dropdown">`. Both render the same set of links — CSS hides the inactive form factor at each width.

```php
<div class="admin-shell">

    <!-- Mobile dropdown -->
    <details class="admin-dropdown">
        <summary>
            <span class="label">
                <i class="fas fa-<?= $tabIcons[$activeTab] ?>"></i>
                <?= t($activeTab) ?>
            </span>
            <i class="fas fa-chevron-down chev"></i>
        </summary>
        <div class="menu">
            <?php foreach ($tabs as $key => $label): ?>
                <a href="?tab=<?= $key ?>" class="<?= $activeTab === $key ? 'active' : '' ?>">
                    <span class="l">
                        <i class="fas fa-<?= $tabIcons[$key] ?>"></i> <?= $label ?>
                    </span>
                    <?php if (!empty($tabCounts[$key])): ?>
                        <span class="tab-count"><?= $tabCounts[$key] ?></span>
                    <?php endif; ?>
                </a>
            <?php endforeach; ?>
        </div>
    </details>

    <!-- Desktop tabs -->
    <div class="tabs">
        <?php foreach ($tabs as $key => $label): ?>
            <a href="?tab=<?= $key ?>" class="tab <?= $activeTab === $key ? 'active' : '' ?>">
                <i class="fas fa-<?= $tabIcons[$key] ?>"></i> <?= $label ?>
                <?php if (!empty($tabCounts[$key])): ?>
                    <span class="tab-count"><?= $tabCounts[$key] ?></span>
                <?php endif; ?>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- existing tab panel content … -->

</div>
```

If `$tabIcons` / `$tabCounts` arrays don't exist yet, extract them from your current tab markup. The `$tabs` array is the existing list (`races`, `members`, `drivers`, `invites`, etc.).

## Design tokens used

Pulled from existing `style.css` — **no new tokens required**:
- Colors: `--f1-red`, `--bg-primary`, `--bg-secondary`, `--bg-card`, `--bg-hover`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-color`
- Type: `'Chivo'` display, `'Manrope'` body
- Radii: `8px` (controls), `12px` (drawer, dropdown menu), `999px` (user chip)
- Sizing: `40×40` (icon button), `36px` (logo image)

## Browser support

Container queries: Chrome/Edge 105+, Safari 16+, Firefox 110+ (all shipped Q3 2022 – Q1 2023). `clamp()`, `cqi`, `<details>` are universal.

If you need fallback for older browsers, the existing `@media (max-width: 768px)` drawer remains as a `@supports not (container-type: inline-size) { … }` block.

## Testing checklist

| Test | Expected |
|---|---|
| Resize Chrome from 1400 → 320px on `/` (public) | Text labels disappear at 1024px; hamburger appears at 560px; no horizontal scroll at any width |
| Resize on `/admin.php` | Admin tabs wrap to a second row above 720px; switch to dropdown below 720px |
| Add a 6th `<a class="nav-link">` to header.php | All four stages still readable; Stage A wraps to second row if needed |
| Open DevTools side panel at 50% width on `admin.php` | Header reacts to actual width, not viewport — icon-only mode kicks in even though viewport is wide |
| Tab through nav with keyboard | All links reachable; focus rings visible |

## Files in this bundle

- `preview/nav-responsive.html` — the live design reference; open it in a browser to see all four stages animated. Use the **role pills** at the top to swap public ↔ member ↔ admin and see how the menu density changes.
- `preview/_card.css` — shared base styles the preview imports.
- `colors_and_type.css` — design-system tokens (matches your `style.css` `:root` block).

## Files in your repo to edit

- `public/assets/css/style.css` — add the new blocks, delete the marked old blocks
- `public/includes/header.php` — add `title=""` to each nav link
- `public/admin.php` — wrap tabs in `.admin-shell`, add `<details class="admin-dropdown">`

That's the whole patch. No new dependencies, no JS framework, no Font Awesome changes.
