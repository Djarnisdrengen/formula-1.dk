# Implementation Plan: Passkey Autofire & the Enrollment Nudge

Epic: `epic.md` · Source reference: `HANDOFF-TO-F1BETTING-passkey.md`
Produced by the web-architecture-review skill against the shipped Passkey Authentication code (2026-09-20).

Branch: `passkey-autofire-nudge`

---

## Decisions

- **Scope:** branch-1 nudge only (password-only login, zero active second factors), per the epic's resolved Scope decision. Branch 2 (2FA member, no passkey) is untouched.
- **Conditional UI fires only on `login.php`.** `public/assets/js/passkey.js` is also loaded on `public/profile.php` (Security tab) and `public/mfa_challenge.php` (second-factor challenge). Firing an anonymous discoverable-credential login attempt on either of those would be actively wrong — on the challenge page in particular, it could silently complete a *different, unrelated* passwordless login while a two-step challenge is mid-flight in `$_SESSION['mfa_pending']`. Gate strictly on the existing `[data-passkey-login]` DOM marker, which only renders on `login.php`.
- **No new abstraction reused from `assertFlow()`.** The conditional trigger is a new, separate function — `assertFlow()`'s error path is built around a clicked button (`fail(btn)` → visible `[data-passkey-error]`) and a silent "no credential found" background attempt must never surface that note.
- **No client-side WebAuthn feature-detection on the nudge card itself** — see design note below. This is a deliberate divergence from the source handoff's `passkeySupported()` client-side hide.
- **`login_options` gets one new log line**, purely to make the epic's flagged rate-limit-distortion risk measurable instead of just flagged. No rate-limiting logic changes — that's a separate decision, intentionally not bundled here.
- **E2e stub extracted to a shared helper** (`tests/helpers/webauthn.js`) rather than duplicated in both `35-passkey.spec.js` and `36-passkey-negative.spec.js`, following the existing `tests/helpers/markers.js` pattern.

## Design note: no feature-detection on the nudge card

The source handoff's nudge hides itself client-side via `passkeySupported()` before it's even shown. F1Betting's `passkey.js` is **not** loaded on `index.php`, `races.php`, `leaderboard.php`, `bet.php`, `race.php`, `edit_bet.php`, etc. — the pages the nudge can actually land on, since the post-login redirect goes wherever the member was headed. Duplicating `passkey.js`'s feature-detection inline on every possible landing page (or, worse, adding a second `<script src="assets/js/passkey.js">` tag to pages that don't already have one) would either scatter detection logic across the codebase or risk double-loading the IIFE on `profile.php`, which already loads it once — a second `<script src>` tag re-executes the whole file, double-attaching the delegated click listener in `init()`.

The nudge card is not a WebAuthn ceremony — it's a static link to `/profile.php?tab=tab-security`. If a member on an unsupported browser clicks through, the Security tab **already** handles that gracefully: `passkey.js`'s own feature detection there hides `[data-passkey-add]` and shows the existing `[data-passkey-unsupported]` message (`profile.php:389`). Graceful degradation already exists one hop downstream, so the nudge card renders unconditionally whenever the session flag is set — simpler, and no new detection surface to keep in sync.

## Phasing

| Phase | Content | Shippable | Depends on |
|---|---|---|---|
| **1** | Conditional-mediation UI on `login.php` | yes | nothing new |
| **2** | Enrollment nudge | yes | nothing new |

Independently shippable in either order, per the epic. Phase 1 touches `login.php`/`passkey.js`/`webauthn.php`; Phase 2 touches `login.php`/`header.php`/a new partial. Both touch `login.php`'s password-only success block, so land them in the same PR if that block would otherwise be edited twice.

---

## Phase 1 — Conditional WebAuthn UI

### Step 1.1 — `login.php`: form id

Add `id="loginForm"` to the `<form method="POST" ...>` at `login.php:137` — needed so `passkey.js` can attach a submit-triggered abort listener without new markup elsewhere. `autocomplete="username webauthn"` is already on the email input (`login.php:142`) — no change there.

### Step 1.2 — `passkey.js`: conditional trigger + shared abort wiring

New module-scope state and two new functions, sharing the existing `b64uToBuf`/`bufToB64`/`post` helpers and the `login_options`/`login_verify` actions.

**Correction found while designing the abort-wiring test (see Step 1.4):** an `AbortController`-only design has a real timing gap. If `conditionalAbort` is only created *after* the `login_options` fetch resolves, an abort that arrives while that fetch is still in flight (a genuinely reachable case — the whole premise of this epic is fast, automatic actions at page load, and a password manager auto-submitting the form is a realistic instance of exactly that) has nothing to cancel: `abortConditional()` no-ops, and the background chain sails on to call `navigator.credentials.get({mediation:'conditional', ...})` moments later, overlapping with whatever ceremony the abort was supposed to make way for. Closing this needs a plain cancelled flag checked at *every* async continuation, not just an abort signal wired in after the fact:

| Addition | Purpose |
|---|---|
| `var conditionalAbort = null;` | created before the `login_options` fetch is even issued (see next correction) — module-scope, shared with every explicit ceremony on the page |
| `var conditionalCancelled = false;` | set immediately by `abortConditional()`, checked at each continuation below — closes the gap before `isConditionalMediationAvailable()` itself resolves |
| `abortConditional()` | `conditionalCancelled = true`; also aborts and clears `conditionalAbort` if it exists |
| `loginConditional()` | guarded by `document.querySelector('[data-passkey-login]')` (login.php only) and `isConditionalMediationAvailable` |

**Second correction, found while running CU-02 against the real test environment (not just designing it):** even with the flag above, the first working version still hung — `page.waitForURL(/index\.php/)` timed out at the full test timeout, not a fast assertion failure. Network logging showed why: the explicit flow completed two clean round-trips (`login_options` → `login_verify`, ~30ms total) and got HTTP 200 back, but never navigated. The held background `login_options` fetch, released moments later, *still reached the server* — `post()` had no way to cancel an already-dispatched `fetch()`, since the `AbortController` only existed once created inside the `.then()` after that fetch had already resolved, and was only ever passed to the later `get()` call, never to the fetch itself. `passkeyChallengeBegin()` (`includes/passkey.php`) stores exactly one outstanding challenge per session — "starting a new ceremony invalidates any outstanding challenge" is the comment on that function. The background request's late arrival silently overwrote the challenge the explicit flow had already fetched and used, so its `login_verify` failed server-side (still HTTP 200 — every `webauthn.php` failure mode does, by design) with no client-visible symptom beyond "nothing happened." Not a client-side overlapping-`get()` problem at all — a server-side single-challenge-slot race between two `login_options` calls, one of which the client had already given up on. Fix: create `conditionalAbort` *before* the `login_options` fetch (not after), and thread its `signal` into that fetch too, not just `get()` — `post()` gained an optional third `signal` parameter. This doesn't change `public/includes/passkey.php` (still untouched per Files changed) — it closes the race by actually cancelling the redundant client request instead of requiring the server to tolerate one.

```js
function post(action, fields, signal) {
    var fd = new FormData();
    fd.append('action', action);
    fd.append('csrf_token', csrfToken());
    Object.keys(fields || {}).forEach(function (k) { fd.append(k, fields[k]); });
    var opts = { method: 'POST', body: fd, credentials: 'same-origin' };
    if (signal) opts.signal = signal;
    return fetch('/webauthn.php', opts)
        .then(function (r) { return r.json(); })
        .catch(function () { return null; });   // includes AbortError — same "no result" path as any other failure
}

function loginConditional() {
    if (!window.PublicKeyCredential || !PublicKeyCredential.isConditionalMediationAvailable) return;
    if (!document.querySelector('[data-passkey-login]')) return;   // login.php only
    PublicKeyCredential.isConditionalMediationAvailable().then(function (available) {
        if (!available || conditionalCancelled) return;
        conditionalAbort = new AbortController();                  // created BEFORE the fetch — not after
        post('login_options', {}, conditionalAbort.signal).then(function (res) {
            if (conditionalCancelled || !res || !res.options || !res.options.publicKey) return;
            var pk = res.options.publicKey;
            pk.challenge = b64uToBuf(pk.challenge);
            (pk.allowCredentials || []).forEach(function (c) { c.id = b64uToBuf(c.id); });
            navigator.credentials.get({ publicKey: pk, mediation: 'conditional', signal: conditionalAbort.signal })
                .then(function (cred) {
                    conditionalAbort = null;
                    if (!cred) return;
                    var fields = {
                        rawId: bufToB64(cred.rawId),
                        clientDataJSON: bufToB64(cred.response.clientDataJSON),
                        authenticatorData: bufToB64(cred.response.authenticatorData),
                        signature: bufToB64(cred.response.signature),
                        userHandle: cred.response.userHandle ? bufToB64(cred.response.userHandle) : ''
                    };
                    return post('login_verify', fields).then(function (v) {
                        if (v && v.ok && v.redirect) window.location.href = v.redirect;
                        // else: no credential matched — silent, same as the button's own catch()
                    });
                })
                .catch(function () { conditionalAbort = null; });   // aborted, or no tap — silent
        });
    });
}
```

Wiring (both call sites abort *before* starting their own ceremony — this ordering is what the epic's Constraints flags as load-bearing, since overlapping `get()` calls are spec-rejected):

```js
// init(), inside the existing delegated click handler:
var login = e.target.closest('[data-passkey-login]');
if (login) {
    e.preventDefault();
    abortConditional();                                    // NEW — first line
    assertFlow(login, 'login_options', 'login_verify', { redirect: login.getAttribute('data-redirect') || '' });
}

// init(), new:
var loginForm = document.getElementById('loginForm');
if (loginForm) loginForm.addEventListener('submit', abortConditional);

loginConditional();   // fire on init(), after feature-detection has already run
```

`loginForm` only exists on `login.php`, so this is a safe no-op on `profile.php`/`mfa_challenge.php` without an extra page check.

### Step 1.3 — `webauthn.php`: measurement log line

`login_options` (lines 152-162) has no rate-limit check today — only `login_verify` does — and no success-path logging at all, so there's currently no way to observe how often it fires. Add one line so the epic's Success Metric ("`login_options` call volume vs. actual login attempt volume, watched for one week post-rollout") is actually answerable by grepping `APP_LOG_FILE`:

```php
case 'login_options': {
    if (getCurrentUser()) passkeyJsonFail();
    try {
        logToFile(APP_LOG_FILE, '[PASSKEY] login_options ip=' . $ip);   // NEW
        passkeyJsonOut(['options' => passkeyAssertOptions($db, null, 'login')]);
    } catch (Throwable $e) {
        logToFile(APP_LOG_FILE, '[PASSKEY] login_options failed: ' . $e->getMessage());
        passkeyJsonFail();
    }
    break;
}
```

Treat this as short-lived instrumentation: it's expected to run at much higher volume than `[LOGIN]` lines once conditional UI ships (every anonymous page view, not just every attempt) — that gap *is* the measurement. Fine to downgrade or drop once the post-rollout watch window closes with no distortion found.

### Step 1.4 — e2e: shared stub + retrofit + one proving test

**New `tests/helpers/webauthn.js`** (mirrors `tests/helpers/markers.js`'s module shape):

```js
'use strict';

// Stubs conditional-mediation feature-detection off by default so a background
// login_options/get() call never races a test's own explicit login steps — Chromium's CDP
// virtual authenticator ignores the spec's real-gesture requirement and auto-resolves any
// pending conditional get() the instant a matching resident credential exists (see epic.md).
// Call before any page.goto().
async function disableConditionalMediation(page) {
    await page.addInitScript(() => {
        if (window.PublicKeyCredential && window.PublicKeyCredential.isConditionalMediationAvailable) {
            window.PublicKeyCredential.isConditionalMediationAvailable = () => Promise.resolve(false);
        }
    });
}

module.exports = { disableConditionalMediation };
```

**`tests/e2e/auth/35-passkey.spec.js`:** import the helper; extend the existing `test.beforeEach(async () => { user = await seed.authUser(); })` (line 119) to also take `page` and call `await disableConditionalMediation(page);`. Checked each test in this file against the risk: every test that calls `addVirtualAuthenticator(page)` and later revisits `/login.php` after a resident credential exists (PWL-01, SEC-01, every `CHA-*` test whose shared `login()` helper reloads `/login.php`, CHA-08, the revoke test) is covered by this single `beforeEach` change. The `admin strips two-step factors` test's second context (`adminCtx`/`adminPage`, lines 390-394) never navigates to `/login.php` — it goes straight to `/admin.php?tab=users` on an already-authenticated storage state — so it needs no separate stub.

**`tests/e2e/auth/36-passkey-negative.spec.js`:** import the helper; add `test.beforeEach(async ({ page }) => { await disableConditionalMediation(page); });` (this file currently has no per-test `page` hook, only `test.beforeAll`/`afterAll` for seeding). Covers the second, independent risk: plain headless Chromium reports `isConditionalMediationAvailable()` true with no virtual authenticator attached at all, which would otherwise plant a session challenge ahead of `challenge is single-use... (PWL-03)`'s own explicit `login_options` call.

**New test, added to `35-passkey.spec.js`**, deliberately re-enabling the stub to prove the wiring end-to-end (the one exception to the blanket `beforeEach` stub):

```js
test('conditional UI logs in without an explicit click (CU-01)', async ({ page }) => {
    await addVirtualAuthenticator(page);
    await login(page, user.email, user.password);
    await page.waitForURL(/index\.php/);
    await registerPasskey(page);
    await dismissRecoveryCodes(page);
    await page.goto('/logout.php');

    // Override the beforeEach stub back on for this test only.
    await page.addInitScript(() => {
        if (window.PublicKeyCredential && window.PublicKeyCredential.isConditionalMediationAvailable) {
            window.PublicKeyCredential.isConditionalMediationAvailable = () => Promise.resolve(true);
        }
    });
    await page.goto('/login.php');
    await page.waitForURL(/index\.php/);   // no click, no form submit — conditional get() alone
});
```

This proves the client/server wiring (fetch → codec → `navigator.credentials.get({mediation:'conditional'})` → verify → redirect) exactly once, using CDP's gesture-free auto-resolve as a stand-in for a real tap — same honest limitation the source handoff called out: it cannot prove the "requires a real user gesture" guarantee, or that the *native password-chooser sheet* is actually suppressed (CDP has no concept of that sheet). Both stay real-device checks (epic's Carried-over open items).

**Test-strategy review addendum (added on review pass):** the initial plan covered AC1 (native-sheet suppression, real-device only) and the happy path (CU-01), but left three acceptance criteria from the epic unexercised: AC2 ("member with no passkey sees no change"), and both abort-wiring scenarios (AC3 explicit button, AC4 form submit). CDP's `automaticPresenceSimulation` resolves a pending `get()` near-instantly once a matching credential exists, which makes racing it directly from a test flaky and non-deterministic — the fix is to make the "pending" window deterministic at the network layer via `page.route()`, not to chase CDP's timing.

**New test, added to `35-passkey.spec.js` — explicit button aborts a pending conditional request (CU-02):**

```js
test('explicit passkey button aborts a pending conditional request (CU-02)', async ({ page }) => {
    await addVirtualAuthenticator(page);
    await login(page, user.email, user.password);
    await page.waitForURL(/index\.php/);
    await registerPasskey(page);
    await dismissRecoveryCodes(page);
    await page.goto('/logout.php');

    await page.addInitScript(() => {
        if (window.PublicKeyCredential && window.PublicKeyCredential.isConditionalMediationAvailable) {
            window.PublicKeyCredential.isConditionalMediationAvailable = () => Promise.resolve(true);
        }
    });
    // Hold only the FIRST login_options call (the background conditional one, which
    // fires on page load before any click can happen) — let every later call through
    // immediately, including the explicit button's own login_options fetch.
    let heldOnce = false, releaseDelay;
    const firstCallHeld = new Promise((resolve) => { releaseDelay = resolve; });
    await page.route('**/webauthn.php', async (route) => {
        // post() sends multipart/form-data (FormData), not "action=login_options" as a
        // literal urlencoded string — checked against real Chromium during implementation
        // (2026-09-20) and corrected here; the naive urlencoded-style match never held the
        // request, so the background conditional login raced ahead of the click every time.
        const body = route.request().postData() || '';
        if (body.includes('login_options') && !heldOnce) { heldOnce = true; await firstCallHeld; }
        await route.continue();
    });

    await page.goto('/login.php');
    const btn = page.locator('[data-testid="passkey-login"]');
    await expect(btn).toBeVisible();
    await btn.click();     // explicit flow starts while the background one is still held
    releaseDelay();        // let the background call through afterward
    await page.waitForURL(/index\.php/);   // explicit flow completes cleanly — no overlapping-get() failure
});
```

This is a real discriminating test, not a smoke check: without the `conditionalCancelled` fix in Step 1.2, the held background call resolves *after* the explicit click, reaches `navigator.credentials.get({mediation:'conditional', ...})`, and overlaps with the explicit flow's own `get()` call — which the epic's Constraints (and the source handoff's own production experience) documents as spec-rejected. With the fix, the background chain checks `conditionalCancelled` right after the held fetch resolves and bails before ever calling `get()`.

**Form-submit abort (AC4) — deliberately not given a separate E2E test.** The submit listener calls the exact same shared `abortConditional()` function CU-02 already exercises end-to-end; a form-submit-specific E2E test would mostly be re-proving that `addEventListener('submit', abortConditional)` is wired up, not new behavior. A dedicated test here would need a way to distinguish "abort worked" from "abort didn't fire but the redirect target happened to match anyway" (the password-form and passkey-button paths currently resolve to the same `$redirect` value), which makes a genuinely discriminating assertion hard to construct without adding a test-only hook to production JS — not worth it for a one-line wiring difference already covered by code review. Documented here as an accepted, reasoned gap rather than a silent one.

**New test, added to `35-passkey.spec.js` — no credential present, password login unaffected (CU-04, closes AC2):**

```js
test('conditional UI enabled with no credential: password login unaffected (CU-04)', async ({ page }) => {
    // No addVirtualAuthenticator — nothing exists to resolve navigator.credentials.get().
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e));

    await page.addInitScript(() => {
        if (window.PublicKeyCredential && window.PublicKeyCredential.isConditionalMediationAvailable) {
            window.PublicKeyCredential.isConditionalMediationAvailable = () => Promise.resolve(true);
        }
    });
    await page.goto('/login.php');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/index\.php/);   // normal password login, unaffected by the background attempt
    expect(pageErrors).toHaveLength(0);    // an unresolved/rejected background get() must stay caught, not thrown
});
```

**Residual risk not closed by this suite:** CU-02 proves the abort code path is exercised and produces no observable failure under a *network-delayed, CDP-simulated* race. It does not prove real Chromium's WebAuthn engine behaves identically under a real, human-timed race (a member tapping the explicit button at the exact instant Face ID resolves in the background) — that specific interleaving is inherently hard to provoke deliberately even on a real device. Accepted as residual risk, consistent with the epic's existing carried-over open items rather than a new one.

### Step 1.5 — Docs

- `docs/gotchas.md`: conditional mediation must stay scoped to `login.php` via `[data-passkey-login]` — firing it on `mfa_challenge.php` would race an unrelated passwordless login against a pending two-step challenge.
- `docs/testing.md`: `disableConditionalMediation()` stub requirement for any future spec that navigates to `/login.php` with a virtual authenticator or in plain Chromium.

---

## Phase 2 — Enrollment nudge

### Step 2.1 — `login.php`: session flag write

Password-only branch only (`login.php:87-94`). Reaching this branch already proves `!userHasActiveFactor($db, $user['id'])` (checked at line 62), and `userHasActiveFactor()` (`mfa.php:277-279`) already OR's in `passkeyActive()` — so no extra passkey check is needed or correct here; re-checking `passkeyActive()` in this branch would always evaluate true and be dead code:

```php
establishSession($db, $user['id']);
$db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);
logLoginMethod('password', $user['id']);
setLang($user['language']    ?? 'da');
setTheme($user['theme']      ?? $anonTheme);
setFont($user['font_stack']  ?? $anonFont);
// Read-once by includes/passkey-nudge.php, the first time header.php next renders.
// Reaching this branch already proves zero active factors incl. no passkey (line 62).
$_SESSION['passkey_nudge'] = true;
header("Location: " . $redirect);
exit;
```

Not written anywhere else. Not in `webauthn.php`'s `passkeyPromoteSession()` (a member who just authenticated *with* a passkey isn't a nudge target). Not at `mfa_challenge.php:91` (branch 2, out of scope — see epic).

### Step 2.2 — New `public/includes/passkey-nudge.php`

Self-gating, single-read, following the source pattern:

```php
<?php
// Read-once, self-gating: consumes $_SESSION['passkey_nudge'] the first time header.php
// renders after a password-only login with zero active factors (see login.php). Never
// shown again after this render, dismissed or not — there is no "ask me later".
$showPasskeyNudge = $currentUser && !empty($_SESSION['passkey_nudge']);
unset($_SESSION['passkey_nudge']);
if ($showPasskeyNudge): ?>
<div class="hf-container" style="padding-top:16px;" data-testid="passkey-nudge">
    <div style="border:1px solid var(--border-color);border-radius:10px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:10px;">
            <i class="fas fa-fingerprint" style="color:var(--f1-red-light);font-size:20px;"></i>
            <div>
                <div style="font-weight:600;"><?= t('passkey_nudge_title') ?></div>
                <div class="text-muted" style="font-size:13px;"><?= t('passkey_nudge_body') ?></div>
            </div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0;">
            <a href="/profile.php?tab=tab-security" class="btn btn-primary" data-testid="passkey-nudge-cta"><?= t('passkey_nudge_cta') ?></a>
            <button type="button" class="btn" data-passkey-nudge-dismiss data-testid="passkey-nudge-dismiss"><?= t('passkey_nudge_dismiss') ?></button>
        </div>
    </div>
</div>
<script nonce="<?= $nonce ?>">
(function () {
    var btn = document.querySelector('[data-passkey-nudge-dismiss]');
    if (btn) btn.addEventListener('click', function () { btn.closest('[data-testid="passkey-nudge"]').remove(); });
})();
</script>
<?php endif; ?>
```

**CSP correctness note:** `header.php`'s CSP is `script-src 'self' 'nonce-$nonce' <three fixed sha256 hashes>` with no `'unsafe-inline'` — an `onclick="..."` attribute would be silently blocked by this policy (nonces cover `<script>` elements, not inline event-handler attributes). The dismiss handler must be a nonce'd `<script>` block, not an inline attribute. `$nonce` is already in scope here since this file is `require`d directly inside `header.php`'s own execution. No `DOMContentLoaded` wrapper needed — the button markup is already parsed by the time this inline script runs, since it's emitted immediately before it in document order.

Dismiss is a pure client-side `.remove()`, no server round-trip — same idiom already used for the recovery-codes panel (`mfa.js:67-68`, `dismissBtn.addEventListener('click', function () { panel.remove(); })`), which works for the identical reason: the underlying flag was already consumed server-side on this same render, so a page reload won't show it again regardless of whether "dismiss" was clicked.

### Step 2.3 — `header.php`: hook the include

`header.php` is 227 lines and ends on `<main>` with nothing after it — every page's own content is appended by the including page from that point. Add the require as the new last line:

```php
<main>
<?php require_once __DIR__ . '/passkey-nudge.php'; ?>
```

Confirmed 23 of 29 `public/*.php` pages include `header.php`, covering every realistic post-login redirect target (`index.php`, `profile.php`, `races.php`, `leaderboard.php`, `bet.php`, `race.php`, `edit_bet.php`, ...). The 6 exceptions (`admin-actions.php`, `logout.php`, `challenges-board.php`, `challenges-upgrade.php`, `csp-report.php`, `webauthn.php`) are redirect-only or JSON handlers, never a `sanitizeLoginRedirect()` target.

### Step 2.4 — Translations (`public/lang/user.php`, da + en)

| Key | DA | EN |
|---|---|---|
| `passkey_nudge_title` | `Skift til passkey?` | `Switch to a passkey?` |
| `passkey_nudge_body` | `Log ind med Face ID eller fingeraftryk næste gang — ingen adgangskode nødvendig.` | `Sign in with Face ID or your fingerprint next time — no password needed.` |
| `passkey_nudge_cta` | `Opret passkey` | `Set up a passkey` |
| `passkey_nudge_dismiss` | `Nej tak` | `No thanks` |

Run through `/motorsport-en-da-translator` for tone/accuracy before merge — this plan's Danish is a first pass, not a final review.

### Step 2.5 — e2e: new spec file

**New `tests/e2e/auth/37-passkey-nudge.spec.js`** (next free number after `35`/`36`):

- `password-only login with zero passkeys shows the nudge once (NDG-01)` — fresh `seed.authUser()` (no factors), login, assert `[data-testid="passkey-nudge"]` visible on the landing page; reload the same page and assert it's gone (single-read, not just dismissed).
- `dismissing the nudge removes it immediately (NDG-02)` — login, click `[data-passkey-nudge-dismiss]`, assert the panel is gone from the DOM without a reload.
- `a member with a passkey never sees the nudge, via the second-factor challenge (NDG-03)` — `addVirtualAuthenticator`, login, `registerPasskey`, logout, log in again: this now routes through the MFA-pending/challenge branch (not branch 1, since `passkeyActive()` makes `userHasActiveFactor()` true) and completes via the passkey challenge button; assert `[data-testid="passkey-nudge"]` has count 0 on the landing page.
- `a member who logs in via the passwordless button never sees the nudge (NDG-05)` — `addVirtualAuthenticator`, login, `registerPasskey`, logout, then log back in via `[data-testid="passkey-login"]` on `login.php` (no password typed — `webauthn.php`'s `login_verify` → `passkeyPromoteSession()` path, a different code path from NDG-03's challenge promotion); assert no nudge. **Added on review pass** — the epic's AC7 explicitly covers both "login or second-factor challenge"; NDG-03 alone only exercised the challenge path, leaving the passwordless-button path unverified even though `passkeyPromoteSession()` never writes the flag.
- `a 2FA member without a passkey does not see the nudge (NDG-04)` — enroll TOTP only (no passkey), log in through the challenge; assert no nudge — locks in the epic's branch-2-out-of-scope decision as a regression guard, not just documentation.

### Step 2.6 — Docs

- `docs/patterns.md`: note the self-gating single-read session-flag include pattern (`passkey-nudge.php`) as the reusable shape for any future one-time post-action nudge, alongside the existing helper list.
- `docs/architecture.md`: one line noting `header.php` now renders a conditional nudge partial right after `<main>` opens.

---

## Files changed

| File | Change |
|---|---|
| `epics/Passkey autofire & the enrollment nudge/*.md` | These docs |
| `public/login.php` | `id="loginForm"`; nudge session-flag write in the password-only branch |
| `public/assets/js/passkey.js` | `conditionalAbort`/`abortConditional()`/`loginConditional()`; abort wiring on the explicit button and form submit |
| `public/webauthn.php` | One `logToFile()` line in `login_options` |
| `public/includes/header.php` | `require_once` the new nudge partial after `<main>` |
| `public/includes/passkey-nudge.php` | New: self-gating nudge partial |
| `public/lang/user.php` | 4 new keys (da+en) |
| `tests/helpers/webauthn.js` | New: shared `disableConditionalMediation()` |
| `tests/e2e/auth/35-passkey.spec.js` | Stub in `beforeEach`; new `CU-01`, `CU-02`, `CU-04` tests |
| `tests/e2e/auth/36-passkey-negative.spec.js` | Stub in a new `beforeEach` |
| `tests/e2e/auth/37-passkey-nudge.spec.js` | New: `NDG-01`, `NDG-02`, `NDG-03`, `NDG-05`, `NDG-04` |
| `docs/gotchas.md`, `docs/testing.md`, `docs/patterns.md`, `docs/architecture.md` | Documentation |

**No changes to:** `webauthn.php`'s `login_verify`/`challenge_*`/`register_*` actions, `public/includes/passkey.php`, `public/includes/mfa.php`, scoring, betting, leaderboard, schema. No new tables, no Composer, no new external services.

## Test coverage vs. epic acceptance criteria

Added on the test-strategy review pass — every AC in `epic.md`, traced to what actually exercises it:

| Epic AC | Exercised by | Notes |
|---|---|---|
| Member with saved password + passkey offered the passkey directly | Real-device check only | Untestable via CDP — no concept of the native chooser sheet |
| Member with no passkey sees no change | `CU-04` | Also asserts zero uncaught page errors from the unresolved background attempt |
| Explicit button still works while a conditional request is pending | `CU-02` | Deterministic via `page.route()` network delay, not CDP timing |
| Password form submit aborts a pending conditional request | Not directly E2E-tested — see Step 1.4 rationale | Shared-function proof via `CU-02` + code review; accepted gap, not silent |
| Password-only login with zero passkeys shows the nudge once | `NDG-01` | |
| Member with an enrolled passkey never sees the nudge | `NDG-03`, `NDG-05` | Both passkey-login paths (challenge and passwordless button) |
| 2FA member without a passkey doesn't see the nudge (this release) | `NDG-04` | |

## Verification

```bash
php -l public/login.php
php -l public/webauthn.php
php -l public/includes/header.php
php -l public/includes/passkey-nudge.php
node --test tests/unit/passkey.test.js
DEPLOY_ENV=test npx playwright test tests/e2e/auth/35-passkey.spec.js tests/e2e/auth/36-passkey-negative.spec.js tests/e2e/auth/37-passkey-nudge.spec.js --config tests/playwright.config.js
npm run test:smoke
npm run test:security
```

**Live-deploy gate:** the full auth E2E suite (`tests/e2e/auth/`) green on test with the exact code being deployed — same discipline as the original Passkey epic, extended to cover the new conditional-UI behavior explicitly via `CU-01`/`CU-02`/`CU-04` and the nudge via `NDG-01..05`. Passkey specs stay out of smoke, unchanged from the existing convention.

**Real-device check (before first live deploy of this epic):** iPhone Safari, both a saved password and an enrolled passkey, in both Bitwarden-active and Passwords-app/iCloud-Keychain-active states — confirms the actual native-sheet suppression that CDP cannot exercise. Android deferred per the epic's carried-over open items; note the gap rather than silently skip it.

## Rollback

Both features are additive and independently revertible. Conditional UI: removing the `loginConditional()` call from `init()` (or reverting `passkey.js`) restores today's explicit-button-only behavior; `login_options`/`login_verify` are unchanged, shared with the existing passwordless button, so nothing server-side needs to roll back. Nudge: removing the `require_once` line from `header.php` stops it rendering; the session flag write in `login.php` becomes a harmless unread key. Neither touches `user_passkeys`, existing MFA state, or any promotion path's session contract.
