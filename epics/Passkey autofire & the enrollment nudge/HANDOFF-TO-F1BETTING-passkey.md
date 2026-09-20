# Passkey autofire & the enrollment nudge — handoff to F1Betting

Written from the `robinsonklubben.dk` repo, 2026-09-20, for a same-developer sibling project
(F1Betting / formula-1.dk). Not an automated cross-repo change — a reference to copy from by hand.
Source commits: `f22c921` (conditional WebAuthn UI on `login.php`) and `c71fea7` (doc corrections)
on Robinsonklubben's `main`. Full write-up: `epics/Passkey Autofill on Login/epic.md`; the nudge's
own epic: `epics/Easier Face ID Login/epic.md`.

## In short

Robinsonklubben's login page used to make Safari pop its native "fill saved password" sheet on
every visit, even when a passkey existed — the fix wasn't an autocomplete flag, it was giving the
browser a real WebAuthn conditional-UI signal. A second, unrelated feature (a one-time nudge to
enroll a passkey after a password login) shipped alongside it. Both are drop-in patterns for
F1Betting whenever it grows passkey login — this doc is the reference for building it right the
first time, including a real e2e-testing trap that cost half a day here.

## 1. The bug this started from

On a real iPhone, with a password already saved for the site (Bitwarden *or* the built-in
Passwords app/iCloud Keychain, it made no difference) and a passkey also enrolled, opening the
login page or tapping into the email/password field immediately popped iOS's native "sign in with
your saved password" sheet — never offering the passkey at all. An earlier, narrower fix (removing
`autofocus` from the password field) had already shipped and been confirmed on a real device, but
that confirmation turned out not to have covered this exact case: a device with a password
*already saved from a previous session*. Once tested against that steady state, the auto-popup was
still there.

Root cause, isolated by toggling one variable at a time on real hardware: the popup fires for
**any saved password on file for the origin**, full stop. Not a Bitwarden quirk, not related to
whether a passkey exists. An earlier, separate experiment — adding `autocomplete="off"` to the
password field — had already been tried against this and confirmed ineffective; Safari
deliberately ignores that attribute on password fields. It was reverted rather than kept as dead
weight.

## 2. The fix: conditional WebAuthn UI

Instead of trying to suppress the browser's own heuristic, give it a competing, explicit signal:
**WebAuthn conditional mediation**. Mark the username-equivalent field
`autocomplete="username webauthn"`, then fire
`navigator.credentials.get({ mediation: 'conditional' })` on page load. Feature-detect it
separately from plain WebAuthn support — `isConditionalMediationAvailable()` is its own capability
check, unsupported on more browsers than WebAuthn itself. No server-side change was needed: the
existing anonymous discoverable-credential login endpoints were reused as-is.

`public/login.php` — inline script, runs unconditionally on page load:

```js
var conditionalAbort = null;

function abortConditional() {
    if (conditionalAbort) {
        conditionalAbort.abort();
        conditionalAbort = null;
    }
}

if (window.PublicKeyCredential && PublicKeyCredential.isConditionalMediationAvailable) {
    PublicKeyCredential.isConditionalMediationAvailable().then(function (available) {
        if (!available) return;
        conditionalAbort = new AbortController();
        passkeyAssert('login', csrfToken, { mediation: 'conditional', signal: conditionalAbort.signal })
            .then(function (result) {
                if (result.ok) { window.location.href = result.redirect; }
                // else: server said no credential matched — silent, same as the button's own catch()
            })
            .catch(function () {
                // aborted by another ceremony starting, or the member dismissed the suggestion — not an error
            });
    });
}

// Any other WebAuthn ceremony starting must abort this one first — overlapping
// get() calls are spec-rejected, not just discouraged.
document.getElementById('loginForm').addEventListener('submit', abortConditional);
// ...and the explicit "log in with passkey" button's own click handler calls
// abortConditional() as its first line too.
```

> **Load-bearing detail**: the `AbortController` is shared between the conditional request and
> every other WebAuthn ceremony on the page (the explicit button, the password form submit). Skip
> this and a member who taps the explicit button while the background conditional request is still
> pending gets a spec-rejected "operation already in progress" failure instead of a clean login.

The shared assertion helper grew one optional parameter to carry this through, with zero effect on
existing callers:

`public/assets/passkey.js`:

```js
function passkeyAssert(purpose, csrfToken, getOptions) {
    return passkeyPost(purpose + '_options', csrfToken, {}).then(function (optionsResult) {
        if (!optionsResult.ok) { return optionsResult; }
        var getArgs = Object.assign(
            { publicKey: passkeyPreparePublicKey(optionsResult.publicKey) },
            getOptions || {}
        );
        return navigator.credentials.get(getArgs).then(function (credential) {
            /* ...unchanged verify + redirect logic... */
        });
    });
}
```

## 3. Real-device result

> **Confirmed twice, live iPhone**: tested with a password *and* a passkey both saved, in both
> AutoFill-provider states (Bitwarden active, and Passwords app/iCloud Keychain active). In both,
> the page now goes straight into a Face-ID-driven passkey flow instead of the old
> password-chooser sheet. This is the daily-driver configuration (Bitwarden) that earlier testing
> hadn't actually covered.

A member with zero enrolled passkeys sees no change at all — the conditional request still fires
(the server doesn't know who's visiting), it just resolves to "no credential" and the password
form works exactly as before.

## 4. The e2e testing trap

This is the part most worth reading before writing tests against conditional UI in any codebase,
not just this one.

> **Chromium CDP quirk**: the WebAuthn spec requires a **real user gesture** before a conditional
> `get()` is allowed to resolve — specifically to prevent a silent, unattended login. Real browsers
> enforce this. Chromium's CDP virtual authenticator (`WebAuthn.addVirtualAuthenticator`, the
> mechanism behind most automated passkey e2e tests) does **not**: its default
> `automaticPresenceSimulation` auto-resolves *any* pending `get()`, conditional or not, the
> instant a matching resident credential exists — with no simulated tap at all.
>
> Result here: the moment the conditional-UI code shipped to the test environment, 10 of 27
> existing Playwright tests started failing — a background conditional request was racing ahead of
> tests' own explicit button-click or password-submit steps and completing the login first,
> mid-test.
>
> A second, independent failure mode showed up too: even with **no** virtual authenticator attached
> at all, plain headless Chromium still reports `isConditionalMediationAvailable()` as available and
> fires the background request — enough on its own to silently plant a fresh session challenge in
> an anonymous test session that assumed none would exist.

Fix: stub the capability check off by default across the whole spec file, and deliberately
re-enable it only in the one test written to exercise it.

`tests/e2e/11-passkeys.spec.js`:

```js
async function disableConditionalMediation(page) {
    await page.addInitScript(() => {
        if (window.PublicKeyCredential && window.PublicKeyCredential.isConditionalMediationAvailable) {
            window.PublicKeyCredential.isConditionalMediationAvailable = () => Promise.resolve(false);
        }
    });
}

test.beforeEach(async ({ page }) => {
    await disableConditionalMediation(page);
});
```

One catch: `test.beforeEach` only covers the default `page` fixture. Any test that opens a second
browser context manually (`browser.newContext()` / `newPage()` — typically to simulate a second
device or a concurrent session) needs the same stub applied to that second page explicitly, right
after it's created.

The one test file that actually wants to exercise the conditional path re-enables it deliberately,
then treats CDP's gesture-free auto-resolve as a stand-in for a real tap — enough to prove the
client/server wiring (fetch, codec, verify, redirect) end to end, while still being honest that it
can't prove the "requires a real gesture" guarantee itself. That last mile stayed a manual
real-device check.

## 5. The passkey enrollment nudge

Separate feature, shipped in the epic just before this one, worth handing off together since it's
the other half of "make passkeys the path of least resistance." A member who logs in with just a
password and has **zero** enrolled passkeys gets a one-time, dismissible card nudging them to set
one up right then — while they're already authenticated and the value is obvious.

Shape: the login handler sets a single-read session flag right before its final redirect (never on
the already-has-a-passkey branch); a self-gating include, required unconditionally from the shared
nav partial, consumes and clears that flag the first time nav renders — so the card appears on
whichever page the post-login redirect happens to land on, with zero per-page wiring.

`public/login.php` — set right before the final redirect, password-only branch:

```php
establishSession($db, $user['id']);
// Read-once by includes/passkey-nudge.php, the first time nav.php next renders.
// Never set on the "already has a passkey" branch above — an enrolled
// member never sees this.
$_SESSION['passkey_nudge'] = true;
header('Location: ' . $redirect);
```

`public/includes/passkey-nudge.php` — required unconditionally from `nav.php`:

```php
$showPasskeyNudge = !empty($_SESSION['passkey_nudge']);
unset($_SESSION['passkey_nudge']);
// ... renders a dismissible card only if true, hides itself entirely
// client-side if passkeySupported() is false, same idiom as the login
// button's own "server renders visible, JS hides if unsupported" pattern.
```

> **Reusable pattern**: this "self-gating include, required unconditionally from the shared nav"
> shape is the generalizable part — it works for any one-time, post-action nudge that shouldn't
> need per-page wiring, not just this one. If F1Betting's nav/layout structure has an equivalent
> shared partial, this slots in the same way.

## 6. Porting this to F1Betting

Structural notes for whoever picks this up over there, since the two apps mirror each other
closely:

- This assumes F1Betting already has (or is building) WebAuthn/passkey registration and a
  discoverable-credential login endpoint of its own — conditional UI is additive on top of that,
  not a replacement for it. If passkeys don't exist there yet, the base enrollment/login ceremony
  has to come first; this handoff only covers the autofire layer and the nudge.
- The `autocomplete="username webauthn"` + conditional `get()` pair is what actually matters.
  Everything else (the abort wiring, the feature-detect) exists to make that pair safe to ship, not
  to replace it.
- Don't reach for `autocomplete="off"` as a first move if F1Betting hits a similar native-autofill
  annoyance — it was tried here first and confirmed ineffective on iOS/Safari specifically. Save
  the round trip.
- If F1Betting's e2e suite uses Playwright + Chromium's CDP `WebAuthn` domain for any passkey
  coverage, budget for the exact same stubbing pattern (§4) *before* conditional UI ships, not
  after test runs start failing mysteriously.

## 7. Still open, not yet done here either

- [x] **Real iPhone, both AutoFill providers** — confirmed twice, see §3.
- [ ] **Real Android device** — the success metric asks for one; not tested yet.
- [ ] **Deployed to live** — shipped to Robinsonklubben's test environment only so far.
- [ ] **Rate-limit distortion, unmeasured** — the conditional request now fires `login_options` on
      every anonymous page view, not just on an explicit login attempt. Whether that skews the
      IP-scoped rate-limit counter for unrelated legitimate logins sharing a network was flagged as
      a risk going in and hasn't been specifically measured.

## 8. Reference

| File | What changed |
| --- | --- |
| `public/login.php` | conditional-UI script block, `autocomplete` attribute, abort wiring |
| `public/assets/passkey.js` | `passkeyAssert()` gained an optional `getOptions` param |
| `public/includes/passkey-nudge.php` | self-gating post-login nudge partial (separate, earlier epic) |
| `tests/e2e/11-passkeys.spec.js` | `disableConditionalMediation()` stub + one dedicated describe block |
