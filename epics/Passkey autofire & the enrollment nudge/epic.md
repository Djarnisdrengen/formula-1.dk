# Epic: Passkey Autofire & the Enrollment Nudge

> **Status:** Refined — architecture review + product-owner review complete, scope decision resolved below. Ready for implementation planning.
> **Predecessor:** Passkey (WebAuthn) Authentication — **shipped** (`public/webauthn.php`, `public/assets/js/passkey.js`, `public/includes/passkey.php`, Security tab in `public/profile.php`, second-factor challenge in `public/mfa_challenge.php`)
> **Source:** `epics/Passkey autofire & the enrollment nudge/HANDOFF-TO-F1BETTING-passkey.md` — a hand-written reference from the sibling Robinsonklubben project (same developer, structurally similar app), not an automated port. Two Robinsonklubben source epics are cited there (`epics/Passkey Autofill on Login/epic.md`, `epics/Easier Face ID Login/epic.md`) but live in that repo, not this one.

## User Value

The Passkey Authentication epic already shipped passwordless login for F1Betting, but the most common real-world device state — a member with a password saved from before they had a passkey (Bitwarden, or iOS's own Passwords app/iCloud Keychain) *and* a passkey enrolled — still gets intercepted before ever seeing it. Opening `login.php` or tapping into the email/password field pops the browser's own "use saved password" sheet first, because the browser's autofill heuristic fires on *any* saved password for the origin, independent of whether a passkey exists. The member has to dismiss that sheet and reach for the separate "Sign in with a passkey" button to get the fast path they already set up. This epic closes that gap with **WebAuthn conditional mediation**: a competing, explicit signal that wins the race and puts the passkey prompt in front of the member directly.

A second, independent piece rides along: members who still log in with just a password, and have never enrolled a passkey, get a one-time dismissible nudge card right after login — while they're already authenticated and the value of "next time, one tap" is obvious. This is adoption-side; the conditional-UI fix is friction-side for members who already converted.

Both are drop-in patterns already validated on Robinsonklubben's `main`, including a real-device confirmation and a documented Playwright/CDP testing trap — this epic's job is translating that reference onto F1Betting's actual login/webauthn architecture, which differs structurally from Robinsonklubben's in ways that change the implementation (not the product behavior).

## Scope decision — resolved in product-owner review

Robinsonklubben's login model is simpler than F1Betting's: password success there leads straight to a session or a single passkey/TOTP-equivalent step. F1Betting has a genuine three-way branch on `login.php` (`public/login.php:49-116`):

1. **Password, zero active second factors** → straight to `establishSession()` and redirect (`login.php:87-94`).
2. **Password, an active second factor (TOTP / email OTP / passkey) enrolled** → held in `$_SESSION['mfa_pending']`, sent to `mfa_challenge.php`, which calls `establishSession()` only after the challenge is satisfied (`mfa_challenge.php:91`).
3. **Challenge-participant fallback** (non-core account) → never a core session at all.

The source handoff's nudge rule — "a member who logs in with just a password and has zero enrolled passkeys" — maps cleanly onto branch 1, and does so *automatically*: `userHasActiveFactor()` (`public/includes/mfa.php:277-279`) already OR's in `passkeyActive()`, so branch 1 is only reachable when the member has zero passkeys among other things — no redundant re-check needed at that write site. It's silent on branch 2's sub-case: a member with TOTP or email OTP active (so they *do* complete a second factor every login) but **no passkey enrolled** — that combination doesn't self-exclude the way branch 1 does, so branch 2's write site (if ever built) genuinely does need an explicit `passkeyActive($db, $uid)` check.

**Decision: this epic covers branch 1 only.** A TOTP/email-OTP member without a passkey is a real candidate too, but folding them in now doubles the write sites, doubles the e2e surface, and — more importantly — needs its own nudge copy: "set up a passkey" reads as an upsell to a password-only member and as "replace your 6-digit code with Face ID" to a 2FA member, and this epic hasn't written that second pitch. Branch 1 alone is the same behavior the source handoff validated, has one write site, and reuses the existing branch-1 coverage pattern in `tests/e2e/auth/35-passkey.spec.js` and `36-passkey-negative.spec.js` without inventing new ones. Branch 2 is a natural, cheap fast-follow once branch 1 is live — same partial, same `passkeyActive($db, $uid)` gate, one more write site at `mfa_challenge.php:91` — but it's out of scope here and should be its own follow-up feature, not bundled into this epic's review or test surface.

## User Experience

- **Login page, conditional UI:** no visible change to the page for a member with *no* passkey — the password form and the existing "Sign in with a passkey" button behave exactly as today. For a member *with* a passkey and a saved password, opening the login page now goes straight into the Face ID/Touch ID/Windows Hello prompt instead of the browser's native password-chooser sheet.
- **Login page, explicit button:** unchanged — still there, still works, still the fallback for a member who dismisses or ignores the conditional prompt.
- **The enrollment nudge:** a dismissible card appears once, on whichever page the post-login redirect lands on, inviting a password-only member (branch 1 — no active second factor, no passkey) to set up a passkey right then. Dismiss means gone for good — not "ask me later." A member who already has a passkey never sees it. A member with TOTP or email OTP active but no passkey does **not** get the nudge in this release either — that's branch 2, explicitly deferred (see Scope decision) rather than silently included.
- **No-JS / unsupported browsers:** identical to today — the passkey button and the nudge both render server-gated-hidden and are revealed/shown only by client-side feature detection, the same idiom already used for `[data-passkey-supported]` in `public/assets/js/passkey.js:100-109`.

## Constraints (from architecture review — bind the implementation)

**Conditional-mediation trigger doesn't fit the existing click-driven helper.**
`public/assets/js/passkey.js`'s `assertFlow(btn, optionsAction, verifyAction, extra)` (lines 75-98) is built around a clicked button: it resolves error display via `fail(btn)` → `btn.closest('[data-passkey-scope]')`, and it's invoked from the single delegated `click` listener in `init()` (lines 110-119). A page-load-triggered conditional `get()` has no `btn` and must never surface the visible `[data-passkey-error]` note on a background attempt that simply found no credential — that's expected, silent behavior, not a failure. This needs its own function: `post('login_options', {})` → `navigator.credentials.get({ publicKey: pk, mediation: 'conditional', signal })`, sharing the existing `b64uToBuf`/`bufToB64`/`post` helpers and the `login_options`/`login_verify` server actions, but not routed through `assertFlow`'s UI-coupled failure path.

**Shared abort wiring is load-bearing, per the source handoff's own flagged gotcha.**
Overlapping `navigator.credentials.get()` calls are spec-rejected, not just discouraged. The conditional request's `AbortController` must be aborted by both: (a) the login form's submit — `login.php`'s `<form>` currently has no `id`, so either add one (e.g. `id="loginForm"`) or hook a submit listener via the same delegation style already used in `passkey.js`; and (b) the explicit passkey button's own click branch inside `init()`'s delegated handler (`passkey.js:116-118`), as the first line before its own `assertFlow` call. Skipping either means a member who taps the explicit button while the background conditional request is still pending gets a spec-rejected "operation already in progress" failure instead of a clean login.

**`autocomplete="username webauthn"` is already shipped.**
`login.php:142` already carries it — that half of the port is done. Only the `isConditionalMediationAvailable()` feature-detect and the page-load `get({ mediation: 'conditional' })` call are missing. Feature-detect it separately from the existing `supported = !!(window.PublicKeyCredential && navigator.credentials)` check (`passkey.js:101`) — conditional mediation support is a narrower, separately-queried capability.

**`autocomplete="off"` is a confirmed dead end — don't re-try it.**
Already tried and confirmed ineffective on iOS/Safari in the source project; same browser engine, no reason to expect different behavior here. Skip straight to conditional UI if this surfaces again elsewhere.

**Rate-limit distortion risk carries over unchanged, and is still unresolved at the source.**
`public/webauthn.php`'s `login_options` case (lines 152-162) has **no** rate-limit check — only `login_verify` does (lines 165-172, `isRateLimited($db, $ip, 'login', '')`). Firing `login_options` unconditionally on every anonymous `login.php` page view (not just every login attempt) multiplies that endpoint's call volume by however many members merely *visit* the page without logging in. Whether this skews the IP-scoped rate limiter for unrelated legitimate logins sharing a network was flagged as a risk in the source handoff too and was never specifically measured there (see "Carried-over open items" below) — budget to measure it here rather than assume it's fine because it shipped elsewhere.

**E2e breakage is concrete, not hypothetical — it's reproducible against the current suite today.**
`tests/e2e/auth/35-passkey.spec.js` attaches a CDP virtual authenticator with `automaticPresenceSimulation: true` (lines 72-85) in nearly every test, and several navigate or reload `/login.php` a **second** time after a resident credential already exists from an earlier step in the same test: `passwordless login from the login page (PWL-01)`, `sign-count regression...passwordless (SEC-01)`, every challenge test whose shared `login()` helper (lines 38-43) re-visits `/login.php`, `recovery code is the break-glass (CHA-08)`, the admin-strips-factors test, and the revoke test. Per the source handoff's own finding, Chromium's virtual authenticator ignores the spec's real-user-gesture requirement for conditional `get()` and auto-resolves the instant a matching resident credential exists — with no simulated tap. Once conditional UI ships, page load itself races an unattended login against these tests' own explicit click/submit steps, the same way it broke 10 of 27 tests on Robinsonklubben. Every test in this file needs `disableConditionalMediation()` stubbed via `page.addInitScript()` before this ships (source handoff §4 has the working snippet), except one new dedicated test that re-enables it deliberately to prove the client/server wiring end to end.

**A second, independent e2e risk shows up with no virtual authenticator at all.**
`tests/e2e/auth/36-passkey-negative.spec.js` never attaches a virtual authenticator, but its tests still call `page.goto('/login.php')` (via the shared `csrfTokenFrom` helper, line 14-17) in plain headless Chromium — which the source handoff found still reports `isConditionalMediationAvailable()` as available and fires the background `login_options` request regardless. That's enough on its own to plant a session challenge ahead of this file's own explicit calls, most notably `challenge is single-use and garbage assertions fail after valid options (PWL-03)` (lines 76-91), which depends on `login_options` being called exactly once to reason about single-use consumption. This file needs the same stub applied.

**No `nav.php` here — `header.php` is the equivalent hook for the nudge.**
Robinsonklubben's "self-gating include, required unconditionally from the shared nav" pattern needs a different anchor in F1Betting: there is no separate nav partial, but `public/includes/header.php` is required by essentially every page, already resolves `$currentUser` (`header.php:76`), and opens `<main>` at line 227 — the natural drop point for the nudge include, right after that. Before implementing, confirm every page the post-login redirect can land on actually includes `header.php` (it should — `index.php`, `profile.php`, `races.php`, etc. all render through it) — a page that skips it would silently never show the nudge.

**Session-flag write site, per the resolved scope decision:**

- Branch 1 (password-only, no active factor) only: set right before the redirect at `login.php:93`, mirroring the source handoff's placement.
- Not written at `mfa_challenge.php:91` — branch 2 (2FA members with no passkey) is explicitly out of scope for this epic; see Scope decision. Leave that call site untouched here so a future fast-follow feature can add it cleanly, gated by the same `passkeyActive($db, $uid)`.
- Never set from `webauthn.php`'s `passkeyPromoteSession()` (`webauthn.php:46-56`) — a member who just authenticated *with* a passkey obviously isn't a nudge target.
- The nudge partial itself follows the source pattern exactly: read `$_SESSION['passkey_nudge']`, `unset()` it immediately (single-read), render only if it was true.

**Nudge self-hides via the existing idiom, not a new one.**
Client-side visibility must reuse `[data-passkey-supported]` / `[data-passkey-unsupported]`, already wired in `passkey.js:100-109` and already used identically for the login button and the Security tab — not a new detection path.

### Carried-over open items (not resolved by porting; re-verify for F1Betting, don't assume inherited)

- Real Android device — the source's own success metric asked for one; never tested there either.
- Rate-limit distortion from unconditional `login_options` calls on every page view — flagged as a risk going in, never measured on Robinsonklubben. Measure it here before/after rollout rather than deferring indefinitely a second time.
- Deployed to production — the source pattern has only reached Robinsonklubben's test environment so far; treat this as an independent, unproven-at-scale pattern rather than a battle-tested one.

## Success Metrics

- No regression in `tests/e2e/auth/35-passkey.spec.js` or `tests/e2e/auth/36-passkey-negative.spec.js` after the stub is applied — both suites pass unchanged in behavior, only in setup.
- On a real iPhone with both a saved password and an enrolled passkey (Bitwarden active, and separately Passwords app/iCloud Keychain active), opening `login.php` goes straight to the passkey prompt instead of the native password-chooser sheet — confirmed on real hardware, not just CDP.
- `login_options` call volume vs. actual login attempt volume, watched for at least one full week post-rollout as the concrete measurement the source handoff never got to.
- Passkey enrollment rate among password-only members, before vs. after the nudge ships — measurable via `user_passkeys` row counts over time, same instrumentation note as the original Passkey Authentication epic.
- Nudge dismissal doesn't reappear on a later login (single-read session flag holds; no repeat-nag reports).

## Acceptance Criteria

```gherkin
Feature: Passkey autofire (conditional WebAuthn UI on login)

  Scenario: Member with a saved password and a passkey is offered the passkey directly
    Given a member has both a password saved by the browser/password manager and a passkey enrolled
    When they open the login page
    Then the browser's native "use saved password" sheet does not appear
    And the passkey's biometric/device-unlock prompt is offered instead

  Scenario: Member with no passkey sees no change
    Given a member has zero passkeys enrolled
    When they open the login page
    Then the page behaves exactly as before — password form usable, explicit passkey button absent or inert per existing feature detection

  Scenario: Explicit passkey button still works while a conditional request is pending
    Given the background conditional request has fired on page load and not yet resolved
    When the member taps "Sign in with a passkey" instead of waiting
    Then the background request is aborted first
    And the explicit request completes normally, without a spec-rejected "operation already in progress" failure

  Scenario: Submitting the password form aborts any pending conditional request
    Given the background conditional request has fired on page load and not yet resolved
    When the member submits the password form instead
    Then the background request is aborted first
    And the password login proceeds normally

  Feature: One-time passkey enrollment nudge

  Scenario: Password-only login with zero passkeys shows the nudge once
    Given a member has no active second factor and no enrolled passkey
    When they log in with their password
    Then a dismissible passkey-enrollment card appears on the page the post-login redirect lands on
    And it does not reappear on their next login after being dismissed

  Scenario: A member with an enrolled passkey never sees the nudge
    Given a member has at least one passkey enrolled
    When they log in by any method
    Then the nudge card never appears

  Scenario: A member who logs in via passkey never sees the nudge
    Given a member authenticates using their passkey (login or second-factor challenge)
    When the session is established
    Then the nudge card never appears, regardless of prior nudge history

  Scenario: A 2FA member without a passkey does not see the nudge in this release
    Given a member has TOTP or email OTP active as their second factor and has no passkey enrolled
    When they log in with their password and complete the second-factor challenge
    Then the nudge card does not appear
    # Branch 2 (2FA, no passkey) is explicitly out of scope for this epic — see Scope decision.
    # Revisit as a fast-follow feature reusing the same partial and passkeyActive() gate.
```

---

*Context: this epic ports a validated pattern from the sibling Robinsonklubben project (`epics/Passkey autofire & the enrollment nudge/HANDOFF-TO-F1BETTING-passkey.md`) onto F1Betting's own, already-shipped WebAuthn/passkey infrastructure (`public/webauthn.php`, `public/assets/js/passkey.js`, `public/includes/passkey.php`, the Security tab in `public/profile.php`, and the second-factor challenge in `public/mfa_challenge.php`). It is additive to that existing system, not a new passkey implementation, and touches no files in the `robinsonklubben.dk` repository.*
