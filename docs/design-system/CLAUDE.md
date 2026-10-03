# Claude — Frederikssund F1 Klub Design System

**Current version: `v1.3.0`** · see [CHANGELOG.md](./CHANGELOG.md) for history.

This project is the design system / handoff hub for the F1Betting PHP codebase. When working here, read the relevant handoff doc(s) below before changing files.

## Active handoffs

| Topic | Doc | Version | Status |
|---|---|---|---|
| Full website redesign + acceptance criteria (per-page, A11y, perf, browser matrix, sign-off) | [`claude-design-system-v1.3.0.md`](./claude-design-system-v1.3.0.md) | v1.3.0 | Ready to ship |
| Earlier redesign — missing explicit acceptance criteria | [`claude-design-system-v1.2.3.md`](./claude-design-system-v1.2.3.md) | v1.2.3 | Superseded by v1.3.0 |
| Earlier redesign — missing accent fonts (Kalam + Courier Prime) | [`claude-design-system-v1.2.2.md`](./claude-design-system-v1.2.2.md) | v1.2.2 | Superseded by v1.2.3 |
| Earlier redesign — missing email templates section | [`claude-design-system-v1.2.1.md`](./claude-design-system-v1.2.1.md) | v1.2.1 | Superseded by v1.2.2 |
| Earlier redesign draft (had inaccurate backend / fonts claims) | [`claude-design-system-v1.2.0.md`](./claude-design-system-v1.2.0.md) | v1.2.0 | Superseded by v1.2.1 |
| Responsive navigation (top-nav + admin menu + mobile drawer footer) | [`claude-design-system-v1.1.0.md`](./claude-design-system-v1.1.0.md) | v1.1.0 | Superseded by v1.2.0 |

> Full content of each handoff also lives under `design_handoff_*/README.md` for download / sharing.

## Versioning rules

This design system uses [SemVer](https://semver.org/):
- **MAJOR** (e.g. v2.0.0) — breaking changes: token removed, class renamed, component API changed.
- **MINOR** (e.g. v1.1.0) — additive: new palette, new component, new handoff doc.
- **PATCH** (e.g. v1.0.1) — fix: color value tweaked, doc typo, internal markup correction.

When bumping, **create a new file with the version in its name** (don't overwrite). Update the table above to point at the new file. See [CHANGELOG.md](./CHANGELOG.md) for the full procedure.

## How to use this repo

- HTML files under `preview/` are **design references**, not production code. They demonstrate the target visual + behaviour.
- Tokens are defined in `colors_and_type.css` and mirror the `:root` block of `public/assets/css/style.css` in the F1Betting repo.
- When asked to "implement X", apply the patch described in the relevant handoff doc to the F1Betting repo files (`public/assets/css/style.css`, `public/includes/header.php`, etc.), keeping all existing class names.

## Conventions

- No new fonts or color tokens without explicit ask.
- Preserve every existing CSS class; additions only.
- Container queries are preferred over viewport media queries for component-level responsiveness.
