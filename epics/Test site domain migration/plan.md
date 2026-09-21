# Epic: Move the Test Site from hpovlsen.dk to formula-1.helvegpovlsen.dk

Created via `/f1betting-product-owner`, grounded in this repo's actual deployment/config
architecture (single-source-of-truth `config.test.php` read by both PHP and the Node
build-deploy/test tooling via `build-deploy/php-config.js`) rather than the skill's generic
F1-prediction-feature template. **Revised** after Djarnis clarified two things the first draft got
wrong: (1) Simply.com only allows creating subdomains under `helvegpovlsen.dk`, not `hpovlsen.dk`
— so the new test hostname is `formula-1.helvegpovlsen.dk`, not `formula-1.hpovlsen.dk`; (2) the
FTP document root the new subdomain serves from is `/test.formula-1.dk` — a folder name that does
**not** match the new hostname, mirroring how live's FTP root (`/formula-1.dk`) already doesn't
need to match anything but its own domain. Two features:

1. **Feature 1 — Hosting, DNS & Config Cutover.** The mechanism: stand up
   `formula-1.helvegpovlsen.dk` on Simply.com serving from FTP path `/test.formula-1.dk`, point
   `config.test.php` and `build-deploy/.env` at the new host/path, handle the one hard-fail
   dependency this repo already enforces at runtime (`PASSKEY_RPID` must match the host derived
   from `SITE_URL`), and clean up the old `/hpovlsen.dk` FTP directory once the new site is
   confirmed working.
2. **Feature 2 — Reference Sweep, CI Wiring & Convention Doc.** The cleanup and the actual ask
   behind "make this the future pattern": update the GitHub Actions variable and every doc/script
   that still says `hpovlsen.dk` as a *hostname* (never the many that use it as an *email domain*
   — see Feature 2, REQ-900), and write down `<project>.helvegpovlsen.dk` as the standing
   test-subdomain convention somewhere Djarnis will find it for the *next* project, not just this
   one.

---

## Origin

Today `hpovlsen.dk` (Djarnis's personal domain) doubles as the Paddock Picks test environment,
while `formula-1.dk` is live (`docs/deployment.md`'s Environments table). This repo's own
`CLAUDE.md` already flags the risk of a bare, generic-looking domain/path pattern causing
wrong-project confusion — the sibling Robinsonklubben project is a structural near-twin, and a
2026-09 incident happened because file paths alone didn't disambiguate which repo was in scope.
A project-named test subdomain is a small, permanent fix to the same class of problem, and Djarnis
wants it applied as the template every future project's test site follows, rather than a one-off
rename. The subdomain lands on `helvegpovlsen.dk` rather than `hpovlsen.dk` specifically because
Simply.com's control panel only permits creating subdomains under the former — this is a hosting
constraint discovered while scoping the epic, not a preference.

**Two separate domains stay in play throughout, and this distinction matters everywhere below:**
`hpovlsen.dk` is not being retired — it remains Djarnis's real personal email domain (catch-all
forwarding), which `sync-from-live.php` and 30+ `test-seed.php` e2e fixtures deliberately keep using
as an **email** domain regardless of this migration (`docs/gotchas.md` gotcha #15). Only its role as
the test *website's* file host goes away.

## User Value

**For Djarnis (the only real user of the test environment):** a test URL that visibly says which
project it belongs to, instead of a bare personal domain that could be any project's test site (or
mistaken for whatever else lives on `hpovlsen.dk`/`helvegpovlsen.dk`). This directly extends the
disambiguation habit `CLAUDE.md` already asks Claude Code to apply at the repo level, into the one
place it was still missing — the URL testers and CI actually hit.

**For future projects:** `helvegpovlsen.dk` becomes reusable test-hosting infrastructure
(`<project>.helvegpovlsen.dk` per project) instead of registering — and paying for — a new bare
domain every time a new project needs a test environment.

**For players (indirect):** none directly — this only touches the test environment. The
acceptance criteria below exist specifically to guarantee `formula-1.dk` (live) sees zero change
as a side effect.

## User Experience

- `formula-1.dk` is untouched: no change to `config.live.php`, live DNS, `FTP_ROOT_LIVE`, or any
  GitHub Actions secret/variable suffixed (or not) for live.
- `hpovlsen.dk` stops hosting the Paddock Picks test site's files — the old FTP directory
  (`/hpovlsen.dk`, per `build-deploy/.env`'s current `FTP_ROOT_TEST`) is deleted once the new site
  is confirmed working (Feature 1, REQ-809). Djarnis and CI use
  `https://formula-1.helvegpovlsen.dk` going forward (exact `www.`/non-`www.` form to be confirmed
  empirically — see Feature 1, REQ-803 — this repo has a documented Apache non-www→www redirect
  gotcha for the bare domain that must not be assumed to carry over unchanged to a subdomain).
  `hpovlsen.dk` itself is **not** decommissioned as a domain — it keeps serving as the real email
  address domain for `sync-from-live.php`/e2e fixtures (gotcha #15); only its file-hosting role ends.
- The new site's public hostname (`formula-1.helvegpovlsen.dk`) and the FTP folder it's served from
  (`/test.formula-1.dk`) are deliberately different strings — unlike live, where both happen to
  match (`formula-1.dk` domain, `/formula-1.dk` FTP root). Anyone deploying by hand should not
  assume the two always line up going forward.
- Every existing local command that already reads `SITE_URL` from `config.test.php`
  (`deploy:test`, `test:e2e:test`, `test:smoke`, `schema:check`, `sync:live`, …) keeps working with
  zero code changes — the domain swap is fully driven by editing one file, because
  `build-deploy/php-config.js` is already the single source of truth `tests/playwright.config.js`,
  `tests/global-setup.js`, `build-deploy/deploy.js`, `build-deploy/sync.js`, `build-deploy/backup.js`
  and `tests/email-preview.js` all read from. `deploy:test`'s upload *destination*, separately, is
  controlled by `FTP_ROOT_TEST` in `build-deploy/.env` (Feature 1, REQ-801a) — this is the one
  setting that isn't part of that single-source-of-truth chain and must be edited on its own.
- CI workflows that hit the test site (the `trigger-test` jobs in the cron-trigger workflows, the
  E2E orchestrator) keep passing once the paired `BASE_URL_TEST` **repository Variable** (not
  Secret — `docs/github-actions.md` already documents why storing a URL as a Secret silently breaks
  `vars.*` lookups) is updated to match.
- Every WebAuthn/passkey credential registered on the old test domain stops working the moment
  `PASSKEY_RPID` changes — expected and test-only (RP ID is baked into a credential at registration
  per the WebAuthn spec, and already documented behavior per gotcha #20), not a defect.
  TOTP/recovery-code MFA is unaffected (`MFA_KEY` isn't domain-bound).
- The `<project>.helvegpovlsen.dk` pattern this epic establishes gets written down once, in a place
  that's still findable from a brand-new project's repo — not just buried in this repo's
  `CLAUDE.md`/memory, which a fresh project's Claude Code session won't have access to.

## Success Metrics

- `npm run deploy:test`, `npm run test:e2e:test`, `npm run test:smoke`, and `npm run test:security`
  all pass against `https://formula-1.helvegpovlsen.dk` with zero application code changes — only
  `config.test.php`, `build-deploy/.env`, and CI variable values differ from before.
- `formula-1.dk`'s live smoke/security gate shows no behavior change attributable to this epic (run
  it before/after as a negative control).
- A final `grep -rn "hpovlsen\.dk"` sweep across the repo turns up only (a) intentionally-preserved
  `@hpovlsen.dk` email addresses/mail-routing checks — this domain is also Djarnis's real personal
  email domain, deliberately reused by `sync-from-live.php` and 30+ `e2e_*@hpovlsen.dk` test-seed
  fixtures, and those must **not** change (see Feature 2, REQ-900) — or (b) intentionally-excluded
  historical paths (`epics/Archive/**`, completed disaster-recovery drill logs, closed
  session-handover notes). No hit should remain that denotes the *website's hostname*.
- The old `/hpovlsen.dk` FTP directory no longer exists on the server, confirmed by directory
  listing, not assumed from having run a delete command once.
- The test-subdomain naming convention is written down somewhere Djarnis confirms he'll actually
  reference when the next project needs a test environment — this epic doesn't count as "done" if
  the only artifact is the domain change itself.
- Every email-sending code path on the test environment (registration, password reset, MFA email
  OTP, challenge invites, admin notifications, the notifications cron, Resend fallback) is confirmed
  to actually deliver against `formula-1.helvegpovlsen.dk` — verified by checking a real inbox, not
  assumed from the application reporting success (Phase 9, added 2026-09-20).

## Acceptance Criteria

```gherkin
Feature: Test site migrated to formula-1.helvegpovlsen.dk

  Scenario: Test site is reachable on the new subdomain, served from the new FTP path
    Given DNS, hosting, and a TLS certificate are configured for formula-1.helvegpovlsen.dk on
      Simply.com, pointed at FTP document root /test.formula-1.dk
    And config.test.php's SITE_URL/PASSKEY_RPID and build-deploy/.env's FTP_ROOT_TEST all point at
      the new host/path
    When a browser or test suite requests the confirmed SITE_URL
    Then it receives the Paddock Picks test site, not a DNS/TLS error, a 301 that drops POST bodies,
      or the bare hpovlsen.dk content

  Scenario: Full test suite passes against the new domain
    Given the new subdomain is live and config.test.php, build-deploy/.env, and the BASE_URL_TEST
      GitHub variable are all updated to match
    When npm run deploy:test, npm run test:e2e:test, npm run test:smoke, and npm run test:security
      are run
    Then all suites pass exactly as they did against hpovlsen.dk before the migration

  Scenario: Live site is provably untouched
    Given config.live.php, FTP_ROOT_LIVE, and every *_LIVE GitHub secret/variable are unchanged by
      this epic
    When formula-1.dk's smoke/E2E gate is run before and after this migration
    Then the outcome is identical — no code path in this epic conditions on the live domain

  Scenario: Passkey credentials are handled, not silently broken
    Given a tester has a passkey registered on the old test domain
    When PASSKEY_RPID changes to the new host
    Then the old credential fails to authenticate (expected) and the tester can register a new one
      successfully on the new domain — verified once, not assumed

  Scenario: The old FTP directory is cleaned up deliberately, after the new site is proven, not
  before
    Given formula-1.helvegpovlsen.dk has passed its full validation pass (Feature 1)
    When the old /hpovlsen.dk FTP directory is deleted
    Then it happens as a deliberate, confirmed step with nothing still depending on those files —
      never as an accidental side effect of some other action, and never before validation

  Scenario: hpovlsen.dk the domain survives this epic, only its file-hosting role ends
    Given the migration and cleanup are complete
    When sync:live next runs or an e2e "real-run" notification spec fires
    Then emails still land at @hpovlsen.dk exactly as before — deleting the FTP directory did not
      touch DNS/MX for the domain itself

  Scenario: The naming pattern outlives this one migration
    Given a hypothetical next project needs its own test site
    When Djarnis looks for how test subdomains should be named
    Then a written convention — not this conversation's memory — tells them to use
      <project>.helvegpovlsen.dk

  Scenario: Test-environment email actually delivers after the domain migration
    Given the test site is fully migrated and every prior phase has passed
    When each email-sending code path is exercised against formula-1.helvegpovlsen.dk with
      SMTP_INTERCEPT off
    Then the message is confirmed delivered to a real inbox, not merely reported as sent by the
      application — and any sending-domain refactor to helvegpovlsen.dk happens only after Djarnis's
      explicit go/no-go, never assumed from the delivery check alone
```

## Implementation Plan (Step-by-Step)

Consolidated, strictly-sequenced execution checklist. Full rationale for every step lives in the
REQ/NFR it cites (`feature-1-hosting-dns-config-cutover.md`, `feature-2-reference-sweep-ci-convention.md`)
— this section is the runbook, not a replacement for that detail. **As of 2026-09-20, nothing below
has been executed** — `config.test.php` still reads `SITE_URL = https://www.hpovlsen.dk` /
`PASSKEY_RPID = hpovlsen.dk`, and `build-deploy/.env` still has `FTP_ROOT_TEST=/hpovlsen.dk`.

Order is load-bearing (NFR-802): DNS/hosting/TLS → config+FTP cutover (atomic) → validation →
CI variable → doc sweep → convention doc → old-directory cleanup (strictly last). Steps marked
**(manual)** are Simply.com-panel or FTP-client actions Djarnis (or an assistant with Djarnis
present) performs outside this repo; steps marked **(gate)** require Djarnis's explicit sign-off
before proceeding, per CLAUDE.md's f1-intelligence rule or this epic's own destructive-action rules.

### Phase 1 — DNS, hosting & TLS (Feature 1) — ✅ done 2026-09-20

- [x] 1.1 **(manual)** Create the `formula-1.helvegpovlsen.dk` DNS record on Simply.com, document
      root `/test.formula-1.dk` on `linux350.unoeuro.com`. Confirm in the panel whether the folder
      must pre-exist before pointing the subdomain at it, or whether either order works. (REQ-801)
      — done by Djarnis.
- [x] 1.2 Verify DNS propagation from an **external** resolver before touching anything else:
      `dig +short formula-1.helvegpovlsen.dk` and `dig +short www.formula-1.helvegpovlsen.dk`.
      (REQ-802a) — both resolve to `185.20.205.21`, confirmed 2026-09-20.
- [x] 1.3 **(manual)** Issue/confirm a TLS cert covering `www.formula-1.helvegpovlsen.dk`
      specifically (not just the bare subdomain — `.htaccess`'s www-forcing rule is host-agnostic).
      Verify: `openssl s_client -connect www.formula-1.helvegpovlsen.dk:443 -servername www.formula-1.helvegpovlsen.dk`
      and confirm the SAN list includes that exact host. (REQ-802) — confirmed 2026-09-20: cert
      `CN=formula-1.helvegpovlsen.dk`, SAN covers both `formula-1.helvegpovlsen.dk` and
      `www.formula-1.helvegpovlsen.dk`, valid 2026-09-13 → 2026-12-12.

### Phase 2 — Determine the exact SITE_URL form — ⚠️ revised 2026-09-20

- [x] 2.1 ~~POST-probe both host forms before picking `SITE_URL`~~ — **sequencing gap found**: the
      www-forcing 301 (the thing REQ-803 is trying to detect) lives in the app's own
      `public/.htaccess`, not a Simply.com panel/vhost setting. A single safe GET probe (Node's core
      `https` module, matching `tests/smoke.js`'s known-safe request style — **not** `curl`/`fetch()`,
      which the site-verification memory flags as liable to trip Simply.com's shared WAF and poison
      later Playwright runs) against both `formula-1.helvegpovlsen.dk` and
      `www.formula-1.helvegpovlsen.dk` returned a plain `200`, no `Location` header, from both —
      confirming nothing is deployed to `/test.formula-1.dk` yet, so there is no redirect to probe
      before Phase 3 deploys the app there. **Decision:** use `www.formula-1.helvegpovlsen.dk` as
      `SITE_URL` now, matching the existing pattern on both `hpovlsen.dk` and `formula-1.dk` and the
      fact that the redirect rule is host-agnostic application code, not per-domain config — no
      reason to expect this third domain to behave differently once deployed. The actual empirical
      confirmation (that `www.` does **not** drop a POST body) now happens as part of 3.3's
      post-deploy smoke check instead of as a separate pre-deploy gate. (REQ-803)

### Phase 3 — Config + FTP cutover (atomic — do 3.1 and 3.2 in the same commit/deploy) — ✅ done 2026-09-20

- [x] 3.1 Edit `build-deploy/.env`: `FTP_ROOT_TEST=/hpovlsen.dk` → `FTP_ROOT_TEST=/test.formula-1.dk`.
      Leave `FTP_ROOT_LIVE` untouched. (REQ-801a) — done 2026-09-20.
- [x] 3.2 Edit `config.test.php` in the same change: `SITE_URL` → the form confirmed in 2.1;
      `PASSKEY_RPID` → that host with any `www.` stripped (matches the existing
      `preg_replace('/^www\./i', ...)` logic in `public/includes/passkey.php:27`). Do not deploy with
      only one of 3.1/3.2 done — a partial state either uploads to an empty new folder with stale
      config, or trips the `passkey.php` RuntimeException on every authenticated page. (REQ-804) —
      done 2026-09-20: `SITE_URL=https://www.formula-1.helvegpovlsen.dk`,
      `PASSKEY_RPID=formula-1.helvegpovlsen.dk`.
- [x] 3.3 Deploy: `npm run deploy:test`. Confirm the built-in post-deploy smoke check passes against
      the new domain — this run now also serves as Phase 2.1's deferred empirical confirmation that
      `www.formula-1.helvegpovlsen.dk` does not drop a POST body via a 301 (login/bet-submission
      checks in the smoke/e2e suite exercise real POSTs against it). If any POST-dependent check
      fails with a redirect-looking symptom (body-less request, lost session), stop and re-examine
      the `www.` vs bare-domain choice before continuing. (REQ-805, REQ-803) — done 2026-09-20:
      deploy uploaded to `/test.formula-1.dk`, DB schema check passed, all 8/8 smoke checks passed
      (200) against `https://www.formula-1.helvegpovlsen.dk`, including both authenticated checks,
      which require a real POST login — confirms `www.` does not drop the POST body or session.
- [x] 3.4 Spot-check that `/hpovlsen.dk` on the FTP server was **not** written to by this deploy —
      it must keep serving the old domain untouched as a fallback until Phase 10. (Test Scenario,
      Feature 1) — confirmed 2026-09-20 by the deploy log itself (`build-deploy/deploy.js` uploads
      to the single `FTP_ROOT_TEST` path only): "✅ Done! Uploaded to /test.formula-1.dk", no writes
      to `/hpovlsen.dk` in this run.

### Phase 4 — Validation — ✅ done 2026-09-20

- [x] 4.1 Run the full suite against the new domain: `npm run test:e2e:test`, `npm run test:smoke`.
      Hold off on `npm run test:security` until Phase 6 (REQ-908 may require a code change first). —
      done 2026-09-20. First attempt hit an unrelated local-sandbox gap (Playwright's Chromium
      binary wasn't installed — `npx playwright install chromium` needed
      `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu22.04-x64` since the host OS isn't officially
      supported), not a migration regression. After installing the browser, re-ran clean:
      11/12 suites passed outright (Smoke, **Authentication** — real POST login/session flows —,
      Invites & Registration, Podium Predictions, Auto-Scoring & Leaderboard, Race Page, Admin,
      Profile & Stats, Appearance, Preferences Editor, Notifications & Cron Jobs). 1 test failed in
      the 114-test Paddock Challenges suite ("correct option awards 5 CP and reveals the check");
      re-ran in isolation and it passed — a pre-existing test-ordering/shared-state flake in that
      suite, not a domain-related failure (nothing else in that suite or run touches host/URL
      assumptions differently). `npm run test:smoke` also re-confirmed 8/8 separately.
- [x] 4.2 Confirm SMTP interception is unaffected: trigger one email-generating e2e flow and confirm
      it still lands in `EMAIL_INTERCEPT_FILE` — this is keyed off `APP_ENV`/a local path, not
      `SITE_URL`, so this is a verification step only. (REQ-807) — confirmed via 4.1's run: the
      Notifications & Cron Jobs suite and the Duels outcome-email tests both explicitly assert
      emails were captured via interception, and passed, on the new domain.
- [x] 4.3 No action needed on CSP (`public/includes/header.php:10-21`) — already confirmed
      domain-agnostic. (REQ-807a, informational only)
- [x] 4.4 **(manual)** If Djarnis has a real passkey registered against the old `hpovlsen.dk` test
      site on his own device, confirm it now fails to authenticate, then register a new one on the
      new domain and confirm it succeeds. The `35-passkey`/`36-passkey-negative` e2e specs need no
      changes and cover the "new credential works" case automatically via virtual authenticators.
      (REQ-806) — done by Djarnis, confirmed 2026-09-20.
- [x] 4.5 **(manual)** Walk one admin login + one core podium-prediction betting flow end-to-end
      against `formula-1.helvegpovlsen.dk` by hand. — done by Djarnis, confirmed 2026-09-20.
- [x] 4.6 Run `formula-1.dk`'s live smoke/security gate before *and* after this epic's changes as a
      negative control — results must be identical. (NFR-801, Success Metrics) — done 2026-09-20:
      `npm run test:e2e:smoke:live` and `npm run test:security:live` both run by Djarnis, both
      passed. Live is confirmed unaffected by this epic's changes.

### Phase 5 — CI wiring (only after Phase 4 is green) — ✅ done 2026-09-20

- [x] 5.1 Update the GitHub Actions repository **Variable** `BASE_URL_TEST` (Settings → Secrets and
      variables → Actions → **Variables** tab, not Secrets) from `https://www.hpovlsen.dk` to the
      value confirmed in 2.1. Confirm no stale `BASE_URL_TEST` **Secret** exists that would shadow
      it. (REQ-901) — done 2026-09-20 via `gh variable set BASE_URL_TEST` on
      `Djarnisdrengen/formula-1.dk`, new value `https://www.formula-1.helvegpovlsen.dk`, verified with
      `gh variable list`. `gh secret list` confirmed no `BASE_URL_TEST` secret exists to shadow it.
- [x] 5.2 Watch the next scheduled `trigger-test` job in `cron-notifications.yml` and
      `cron-qualifying-import.yml` complete successfully against the new domain; re-confirm
      `CRON_SECRET_TEST` still matches `config.test.php`'s `CRON_SECRET` (no rotation implied).
      (REQ-902) — done 2026-09-20: rather than wait out the observed ~4-5h natural schedule slip,
      Djarnis manually ran `gh workflow run cron-notifications.yml -f dry_run=true` himself (this
      also fires `trigger-live` against `formula-1.dk`, which the Claude Code auto-mode classifier
      correctly blocked me from dispatching — a live-touching action needing his own hands on it).
      Run `35533425351`: both `trigger-live` and `trigger-test` jobs succeeded. `trigger-test`'s log
      confirms `BASE_URL: https://www.formula-1.helvegpovlsen.dk`, the `CRON_SECRET_TEST` secret was
      accepted (no rotation needed), and the script returned "Notification check complete." —
      `cron-qualifying-import.yml` uses the identical `vars.BASE_URL_TEST` / `secrets.CRON_SECRET_TEST`
      pattern (confirmed in 5.3), so this is treated as sufficiently covering both workflows rather
      than requiring a second manual dispatch of a Saturday-only qualifying-import job with no race
      qualifying session imminent.
- [x] 5.3 Confirm neither workflow YAML hardcodes the old domain outside a comment (prior research
      found none, but verify once against the live files). (NFR-902) — confirmed 2026-09-20:
      `grep -n "hpovlsen" .github/workflows/*.yml` only matches comment text in
      `cron-qualifying-import.yml:19` and `cron-notifications.yml:12`; both `trigger-test` jobs
      already reference `${{ vars.BASE_URL_TEST }}` dynamically, no literal hardcoded domain.

### Phase 6 — Security heuristic check — ✅ done 2026-09-20

- [x] 6.1 Determine whether `helvegpovlsen.dk`'s actual mail setup is SimpleLogin-style or
      Proton-style (unknown as of this writing). (REQ-908, prerequisite) — confirmed via direct
      Cloudflare DoH queries: `helvegpovlsen.dk` apex has `v=spf1 include:_spf.protonmail.ch
      include:spf.simply.com -all`, MX to `mail.protonmail.ch`/`mailsec.protonmail.ch`, and
      `_dmarc.helvegpovlsen.dk` = `v=DMARC1; p=quarantine`. **Proton-style**, not SimpleLogin.
- [x] 6.2 If SimpleLogin-style (matching `hpovlsen.dk`), extend the
      `hostname.includes('hpovlsen')` check at `tests/security/security.js:762,795` to also match
      `helvegpovlsen`. If Proton-style, no code change — the existing `else` branch already does the
      right thing. (REQ-908) — the `else` branch's SPF-include/DKIM-selector guess (proton) was
      already right, but a **deeper bug** surfaced during 6.3: `tests/security/security.js`'s DNS
      section derives its query domain as `hostname.replace(/^www\./, '')`, which for
      `formula-1.helvegpovlsen.dk` produces the site's own subdomain, not the registrable domain
      `helvegpovlsen.dk` where the SPF/MX/DMARC/DKIM records actually live (confirmed empirically —
      `formula-1.helvegpovlsen.dk` has no TXT/DMARC records of its own, only an SOA). This never
      showed up for `hpovlsen.dk` or `formula-1.dk` because both are 2-label apexes where site
      hostname and mail domain coincide; it's new because `<project>.helvegpovlsen.dk` (the Phase 8
      convention for *every future project*) is a 3-label subdomain of the actual mail domain. Fix
      (Djarnis's explicit choice over "just document the false-positive"): added a
      `findTxtWithFallback()` helper in `checkDnsSecurity()` — when the apex has >2 labels, SPF,
      DMARC, and DKIM each retry once against the last-two-labels parent domain if nothing is found
      at the exact apex, and the pass message notes `(on parent domain X)`. CAA and DNSSEC are
      unchanged (checked on the exact hostname — DNSSEC already validates the full chain via the
      resolver's AD flag regardless of label depth). For a 2-label apex, `mailParent` is `null` and
      the fallback path never executes, so `formula-1.dk`/`hpovlsen.dk` behavior is byte-for-byte
      unchanged (verified by code inspection, not by re-running against live — see 6.3).
- [x] 6.3 Run `npm run test:security` against the new domain and confirm the SPF/DMARC/DKIM checks
      pass or warn as expected. — done 2026-09-20: pre-fix run showed SPF/DMARC/DKIM all falsely
      warning as missing (plus a genuine, pre-existing CAA gap at both domain levels — not a
      migration regression). Post-fix run: SPF ✔ `include:_spf.protonmail.ch include:spf.simply.com
      -all (on parent domain helvegpovlsen.dk)`, DMARC ✔ `p=quarantine (on parent domain
      _dmarc.helvegpovlsen.dk)`, DKIM ✔ `Selector "protonmail._domainkey.helvegpovlsen.dk" found`.
      CAA warning remains (no CAA record at either level) — out of scope for REQ-908, unrelated to
      the domain migration. Did not re-run `test:security:live` — the live-gate policy from Phase
      4.6 applies, and the fix is provably a no-op for 2-label apexes by inspection.

### Phase 7 — Doc & script sweep — ✅ done 2026-09-20

- [x] 7.1 Sweep every file in Feature 2 REQ-903's list, changing only occurrences that denote the
      **site's hostname** (never an `@hpovlsen.dk` email address or mail-routing check — see
      REQ-900's exclusion list, which must not be touched):
      `docs/deployment.md`, `docs/testing.md`, `docs/github-actions.md`, `docs/admin-dashboards.md`,
      `docs/cron-jobs.md`, `docs/gotchas.md`, `docs/getting-started.md`, `docs/commands.md`,
      `docs/disaster-recovery/runbook.md`, `docs/disaster-recovery/drill-plan-test.md`,
      `build-deploy/DEPLOYMENT.md` (reword the shorthand table to state the domain/FTP-path split
      explicitly), `build-deploy/restore-db.js`'s warning label, `tests/smoke.js`'s usage string,
      this repo's own `CLAUDE.md`, `.claude/settings.json` and `.claude/settings.local.json`'s
      `hpovlsen.dk` permission-allowlist entries. — done: every file in the list had its hostname
      mentions swapped to `formula-1.helvegpovlsen.dk` (or `www.formula-1.helvegpovlsen.dk` where the
      original used `www.`); `docs/testing.md` needed no edit — every one of its `hpovlsen.dk`
      mentions was already an `@hpovlsen.dk` email/fixture address, correctly excluded.
      `build-deploy/DEPLOYMENT.md`'s `deploy:test` row was reworded to state the FTP path
      (`/test.formula-1.dk`) and the served domain as two explicitly different strings, per this
      item's parenthetical.
- [x] 7.2 Audit `hpovlsen.dk` mentions in `tests/e2e/02-auth.spec.js`, `04-betting.spec.js`,
      `05-profile.spec.js`, `07-cron.spec.js`, `tests/e2e/admin/11-invites.spec.js`,
      `12-users.spec.js`, `13-scoring.spec.js` — confirm each is a comment/description string, not a
      literal bypassing `BASE_URL` injection. Update comment text; escalate any literal found as a
      Phase 3 blocker, not a doc fix. (REQ-904) — done: every mention across all 7 files is either an
      `@hpovlsen.dk` fixture-email constant (correct per REQ-900, not a hostname literal) or, in
      `04-betting.spec.js:13`, a stale illustrative comment (`// e.g. "Registreret på
      www.hpovlsen.dk: ..."`) documenting an expected confirmation-email string — updated to
      `www.formula-1.helvegpovlsen.dk`. Confirmed the actual assertion (`04-betting.spec.js:17`)
      already derives the domain from `process.env.BASE_URL` at runtime, not a hardcoded literal — no
      Phase 3 blocker needed.
- [x] 7.3 **(gate)** Get Djarnis's explicit go-ahead, called out separately from the rest of the
      sweep commit, before editing `docs/f1-intelligence-reference.md`, `f1-intelligence/README.md`,
      `paddock-rumors/README.md`, `paddock-rumors/ROADMAP.md`. (REQ-905) — asked via AskUserQuestion,
      separately from the rest of the sweep; Djarnis approved the hostname-only substitution (no
      code/logic changes) in all 4 files. Applied. A second, adjacent batch of hostname mentions
      surfaced during 7.4's verification in files not on this original list but in the same
      f1-intelligence/paddock-rumors area (`f1-intelligence/docs/DEPLOYMENT.md`, `TESTING.md`,
      `ARCHITECTURE.md`, `docs/paddock-rumors-reference.md`) — asked again as a separate, explicit
      gate rather than assuming the first approval covered them; Djarnis approved the same
      substitution there too.
- [x] 7.4 Final sweep verification — not a bare zero-hit check: run `grep -rn "hpovlsen\.dk" .`
      (excluding `node_modules`, `.git`, `build-deploy/backups`) and classify every hit as (a)
      intentionally-preserved email domain, (b) intentionally-excluded historical record
      (`epics/Archive/**`, etc.), or (c) a missed hostname reference — sweep is only done when (c) is
      empty. Then run `grep -rn "helvegpovlsen\.dk" .` and confirm it turns up only the intended new
      references plus the pre-existing, unrelated `f1_admin@helvegpovlsen.dk`. (NFR-901) — done:
      final grep's remaining hits are all (a) `@hpovlsen.dk` email/fixture addresses (`test-seed.php`,
      `sync-from-live.php`, `mfa_challenge.php`, the e2e specs, `docs/testing.md`, `docs/gotchas.md`,
      `docs/commands.md`, `docs/test-strategy.md`) or (b) intentionally-excluded historical record —
      `epics/Archive/**`, this epic's own planning docs (`plan.md`, `feature-1-*.md`, `feature-2-*.md`,
      `test-strategy-review.md` — describing the pre-migration state by design), the frozen
      design-handoff mockup exports under `epics/Admin area redesign/` (static point-in-time HTML
      snapshots with baked-in example values, not living docs), and the completed-work changelog
      entries in `security-findings-remaining.md` / `paddock-rumors/SESSION_HANDOVER.md`. Category
      (c) is empty. Two comment-only hostname mentions were also found and fixed along the way in
      `.github/workflows/cron-qualifying-import.yml` and `cron-notifications.yml` (not in REQ-903's
      list but same-file, low-risk comment text). `helvegpovlsen.dk` grep confirms only the intended
      new `formula-1.helvegpovlsen.dk` references plus pre-existing, unrelated personal-email
      addresses (`f1_admin@helvegpovlsen.dk`, `thomas@helvegpovlsen.dk` in `nightly-report.js` /
      `security-review.js` / `.env.example` / CI secrets) — none of which this epic touches.

### Phase 8 — Write down the convention — ✅ done 2026-09-21

- [x] 8.1 Draft the convention note covering both: (a) `<project>.helvegpovlsen.dk` is the standard
      test-subdomain pattern for every future project, and (b) `hpovlsen.dk` the domain is **not**
      decommissioned — it keeps its email role (gotcha #15); only its file-hosting role and old FTP
      directory are retired. (REQ-906, REQ-907) — written as `docs/conventions.md`, deliberately
      self-contained (no dependency on this repo's `CLAUDE.md` or memory) so it reads correctly if
      moved elsewhere.
- [x] 8.2 **(resolved 2026-09-21 — asked Djarnis)** Where should this note live for cross-project
      visibility, since a brand-new project's own repo won't have this repo's `CLAUDE.md` or memory
      in context? **Decision: keep it in this repo for now** (`docs/conventions.md`, linked from
      `CLAUDE.md`'s doc table), written so it's easy to move to a personal ops/notes location later
      without rewriting it. Not a bootstrapping-template line — that option was offered but not
      chosen. (REQ-906)

### Phase 9 — Email deliverability verification & sending-domain review (added 2026-09-20; moved ahead of the FTP cleanup phase on 2026-09-21) — ✅ done 2026-09-21

Added after Phase 6 (Security heuristic check) surfaced that SPF/DKIM/DMARC records for the test
domain resolve on the registrable **parent** (`helvegpovlsen.dk`), not on
`formula-1.helvegpovlsen.dk` itself (`tests/security/security.js`'s `mailParent` fallback) — which
raises a separate question this epic hadn't asked yet: is the app's actual outbound *sending*
domain (`SMTP_FROM_EMAIL` in `config.test.php`) aligned with where mail authentication actually
lives? This phase runs **before** Phase 10 (old FTP directory cleanup) deliberately: Phase 10 is
destructive and permanently closes the rollback window, so email deliverability — a core piece of
"the migration actually works" — must be proven while rollback is still possible, not after. It
exists to (a) prove email delivery actually works end-to-end on the new test domain — not just
that the app reports no error — and (b) evaluate, not assume, whether `helvegpovlsen.dk` should
become the test environment's sending domain. Scoped to **test only**; see the amended Out of
Scope note below for why this doesn't reopen `hpovlsen.dk`'s DNS/MX. **Outcome (see 9.6):** the
eventual decision kept the sending domain unchanged and solved a different, related problem
instead (where test-data addresses land) — the question below was worth asking, but the answer
wasn't the one the framing here assumed.

#### 9a — Baseline: verify current behavior first, before changing anything — ✅ done 2026-09-21

- [x] 9.1 Inventory every email-sending code path in the app, with file + trigger condition for
      each: registration confirmation, password reset, MFA email OTP (`public/includes/mfa.php`),
      challenge invites (`public/challenges-invite.php`, `public/challenges-join.php`),
      admin-triggered notifications (`public/admin.php`, `public/admin-challenges.php`), the
      notifications cron (`public/cron/notifications.php`), and the CI nightly report /
      `npm run test:resend`. This checklist is what 9.2 actually tests against, not vibes. — done
      2026-09-21. **Correction to this item's own premise:** there is no "registration confirmation"
      email — `register.php` sends nothing on signup; that path doesn't exist in the code. Full
      inventory found via `sendEmail()`/wrapper call sites (`grep` across `public/`):
      - Password reset (user-initiated) — `forgot_password.php` → `sendPasswordResetEmail()`.
      - Admin-triggered password reset — `admin.php:297` (`sendEmail`, inline template).
      - MFA reset notice — `admin.php:355`.
      - Bet-deleted notice (admin-triggered) — `admin.php:414`.
      - Invite (new + resend) — `admin.php:470,513` → `sendInviteEmail()`.
      - Bet confirmation (placed + updated) — `bet.php`, `edit_bet.php` → `sendBetConfirmationEmail()`,
        unconditional best-effort send on every successful bet write.
      - MFA email OTP (enroll + login) — `includes/mfa.php`'s `issueEmailOtp()`.
      - Challenge: owner email-confirm magic link — `challenges-invite.php` (own email path).
      - Challenge: friend invite — `challenges-invite.php` (friend-send path, gated by
        `canSendInvite()` — suppression/dedupe/rate-limit/daily-cap).
      - Challenge: join magic link — `challenges-join.php`.
      - Challenge: participant promoted to core account — `admin-challenges.php` (permanent-promotion
        branch).
      - Challenge: set-password invite (non-permanent promotion) — `admin-challenges.php` (else
        branch).
      - Duel result (win/lose/tie) — `includes/challenges.php:787`.
      - Notifications cron (3 templates): pool reminder (non-competing + pending-invite variants),
        betting-window-open, betting-closing-soon — `cron/notifications.php`.
      - CI nightly Resend health check — `build-deploy/verify-resend.js` (`npm run test:resend`),
        separate provider/transport from all of the above (Resend API, not Proton SMTP).
      - `public/tools/test-seed.php`'s `send_email_preview` action (`test`-env only, token-gated)
        already exercises 10 of the above templates × 2 languages with dummy data, no DB
        side-effects, all sent to `F1_ADMIN_EMAIL` — the natural tool for 9.2.
- [x] 9.2 With `SMTP_INTERCEPT` off (send-for-real is the test-env default per gotcha #17), trigger
      each path against `https://www.formula-1.helvegpovlsen.dk` and confirm **actual delivery** to
      a real inbox — check the Proton "Sent" folder and the destination inbox for each, not just
      that the app returned success. A soft bounce or silent drop looks identical to a successful
      send from the application's point of view. — done 2026-09-21. Djarnis chose "extend the
      preview tool" (over real-flow triggering or accepting partial coverage) to close 9.1's full
      inventory: added 7 more templates (MFA OTP, both challenge-invite paths, challenge-join magic
      link, both admin-challenges promotion emails, duel result — "won" variant) to
      `test-seed.php`'s `send_email_preview` action, each reproducing the real call site's template
      with dummy data and **no DB writes** (fake tokens never inserted into
      `challenge_magic_links`/`password_resets`; `canSendInvite()`/`createChallengeInvite()`'s
      dedupe/rate-limit/suppression logic intentionally bypassed since this is a template/transport
      check, not a business-logic test) — deployed via `npm run deploy:test` (8/8 smoke passed).
      Ran `node tests/email-preview.js` twice (once pre-extension, once post): **34/34 sends
      reported `success`** across all 17 templates × da/en, all to `f1_admin@helvegpovlsen.dk`.
      Confirmed real (non-intercepted) delivery both times via `action=get_test_emails`: **0 entries**
      in the server's intercept JSONL each time (a nonzero count would mean `SMTP_INTERCEPT`'s flag
      file was set and these never left the server) — this is the full inventory from 9.1, no gaps.
      **Confirmed by Djarnis 2026-09-21:** all 34 preview emails were visually confirmed delivered
      to `f1_admin@helvegpovlsen.dk`'s actual Proton inbox — closes the one gap this session
      couldn't verify itself (no email-inbox access). 9.2 is fully done, no caveats remaining.
      **Unrelated finding surfaced along the way (not fixed here, out of scope for this phase):**
      `public/lang/email.php` has two full `// Duel result email` blocks under both `da` and `en`
      (~line 58 and ~line 133 for da; ~195 and ~268 for en) — the same class of duplicate-`t()`-key
      bug found previously in `email.php` and left unfixed in ~9 places in `user.php`, this time a
      second instance in `email.php` itself. The later block silently wins, so the **live**
      duel-result email subject is
      literally `"Duel complete: %s"` / `"Duellen er afsluttet: %s"` with the `%s` never
      substituted (`includes/challenges.php:787` passes the subject straight to `sendEmail()` with
      no `sprintf()`), and the body's win/lost/tie text uses a hardcoded "+15/+5/+10 CP" that ignores
      the actual `own_score`/`opp_score` arguments the code passes in. Pre-existing production bug,
      unrelated to the domain migration — flagging for Djarnis to decide whether/when to fix.
- [x] 9.3 Separately verify the Resend fallback transport (`npm run test:resend`) against test's
      current config values — a different code path/provider than primary SMTP, and it can pass or
      fail independently of it. — done 2026-09-21: `npm run test:resend` → `OK — email delivered via
      Resend` (from `info@formula-1.dk` to `f1_admin@helvegpovlsen.dk`, via the Resend API, using
      test's current `RESEND_API_KEY`/`SMTP_FROM`).
- [x] 9.4 Re-run `npm run test:security`'s DNS/mail-auth checks (SPF/DKIM/DMARC, Phase 6's
      parent-domain fallback) as a documented precondition immediately before 9.2 — if these are
      failing, delivery problems found in 9.2 are an expected consequence, not a new bug to chase.
      — done 2026-09-21, run immediately before 9.2: 18 passed, 0 failed, 1 warning (pre-existing CAA
      gap, unrelated). SPF ✔, DMARC ✔, DKIM ✔, all resolved on parent domain `helvegpovlsen.dk` per
      Phase 6's fallback — confirms 9.2 is being attempted against a healthy mail-auth setup.
- [x] 9.5 Write down the baseline result: pass/fail per path from 9.2/9.3, and the exact
      domain(s) currently in use for `SMTP_HOST` / `SMTP_FROM_EMAIL` / `SMTP_USER` on test. This
      baseline is the evidence for whether 9.6's refactor is actually warranted — not an assumption
      going in. — done 2026-09-21.
      - **DNS/mail-auth (9.4):** pass — SPF/DKIM/DMARC all resolve on parent `helvegpovlsen.dk`, 0
        failures.
      - **Primary SMTP transport, all inventoried paths (9.2):** pass — 34/34 (17 templates × da/en)
        sent successfully via real Proton SMTP, confirmed non-intercepted.
      - **Resend fallback transport (9.3):** pass — one health-check email delivered via the Resend
        API.
      - **Current config values on test:** `SMTP_HOST=smtp.protonmail.ch`,
        `SMTP_USER=info@formula-1.dk`, `SMTP_FROM_EMAIL=info@formula-1.dk` — i.e. the actual
        **sending** domain is `formula-1.dk` (live's own domain), not `helvegpovlsen.dk` and not
        `formula-1.helvegpovlsen.dk`. Meanwhile `F1_ADMIN_EMAIL` (Resend report-to / preview-tool
        recipient) is already `f1_admin@helvegpovlsen.dk`, and mail-auth (SPF/DKIM/DMARC) lives on
        `helvegpovlsen.dk` — three different domains involved in one send. This three-way split is
        exactly what 9.6 needs to evaluate: nothing in this baseline is currently *broken* (mail-auth
        passes for `helvegpovlsen.dk`, and `formula-1.dk` presumably has its own separate SPF/DKIM
        setup that this baseline didn't check since it's out of scope — live is untouched by this
        epic), but the sending domain doesn't match the new test-site domain either, which is the
        open question 9.6 exists to surface.
      - **Not covered by this baseline (out of scope, not a gap):** live's SMTP config — this epic's
        success metric requires live stay untouched, so `formula-1.dk`'s own mail-auth was
        deliberately not re-verified here.

#### 9b — Email addressing strategy: decided and implemented 2026-09-21 — ✅ done

- [x] 9.6 **(decision point — resolved through direct discussion with Djarnis, 2026-09-21, not
      decided unilaterally)** Covers both halves of the question this phase opened with:
      - **Sending identity: no change.** Test keeps sending as `info@formula-1.dk`
        (`SMTP_HOST=smtp.protonmail.ch`, `SMTP_USER`/`SMTP_FROM_EMAIL=info@formula-1.dk`, unchanged
        from 9.5's baseline). Moving to `helvegpovlsen.dk` was rejected once Djarnis raised a
        constraint this epic hadn't known: **Simply.com does not support email addresses on a
        subdomain at all** — so any `helvegpovlsen.dk`-based sending identity could only ever live
        at the bare apex anyway, never as a project-scoped `formula-1.helvegpovlsen.dk` address
        (consistent with Phase 6's finding that only the apex has SPF/DKIM/DMARC records). Given
        that, and that `formula-1.dk` is already a known-working sending identity (it's live's own
        domain), there was no upside left to moving — it would have traded a working setup for an
        unverified one (the "is `helvegpovlsen.dk` actually DKIM-provisioned for *sending*, not
        just SPF/DMARC records" unknown from the original framing was never resolved, because the
        decision made it moot).
      - **Test data (`sync:live` + E2E fixtures): move to `<original-local-part>+test@formula-1.dk`.**
        Djarnis proposed "+"-addressing off `formula-1.dk`'s existing catch-all (confirmed
        2026-09-21) as the no-manual-provisioning mechanism, ruling out a parallel move to
        `helvegpovlsen.dk` for the same Simply.com subdomain reason above, and also sidestepping the
        open question of whether `helvegpovlsen.dk` even has catch-all forwarding configured.
        Confirmed exact shape: original local-part first, then a literal `+test` tag, e.g. synced
        user `thomas@gmail.com` → `thomas+test@formula-1.dk`; fixture `e2e_auth_f1@hpovlsen.dk` →
        `e2e_auth_f1+test@formula-1.dk`. This ordering (not `test+<original>@`) was chosen
        specifically because it keeps the `e2e_` prefix at the very front of the local part, so the
        existing `str_starts_with($email, 'e2e_')` half of `test-seed.php`'s safety guards survives
        unchanged — only the domain-suffix half of those checks needs updating (see 9.8).
      - **Two consequences accepted, not blockers:** (1) gotcha #14's same-Proton-account
        send/receive display-dedup quirk becomes routine — sending (`info@formula-1.dk`) and every
        rewritten test-data recipient now share the same domain/account, so expect Proton's UI to
        show most test emails twice (sent + received view). Cosmetic, not a functional bug, but
        constant instead of a one-off. (2) `sync-from-live.php`'s rewrite must be made idempotent —
        strip any existing `+...` tag from the local part before adding `+test`, so re-running
        `sync:live` doesn't accumulate `thomas+test+test@formula-1.dk`.
      - `hpovlsen.dk` is untouched by this decision — it keeps its existing role per
        `docs/conventions.md` (Phase 8); this only means *new* test-data mail stops being routed
        there going forward, nothing about the domain itself changes.
- [x] 9.7 **(gate)** — satisfied 2026-09-21: Djarnis gave explicit approval for the
      `<original-local-part>+test@formula-1.dk` scheme through direct discussion in this session,
      including confirming the exact tag shape. Nothing on the sending-identity side needed
      approval since no change was proposed there.
- [x] 9.8 Implement the `<original-local-part>+test@formula-1.dk` scheme — done 2026-09-21.
      - `sync-from-live.php:104-113`: rewrite logic now strips any existing `+...` suffix from the
        local part first (idempotency — handles a live user whose *real* address already contains a
        `+tag`, and defensively guards against any future double-processing), then appends
        `+test@formula-1.dk`. The `$testEmails` stale-invite cleanup list (3 literals) updated to
        match. `f1_admin@helvegpovlsen.dk`'s separate preserve/restore path (queries test's own DB
        by `F1_ADMIN_EMAIL`, bypasses the per-row loop entirely) is untouched by this, as designed.
      - `test-seed.php`: all 35 hardcoded `@hpovlsen.dk` fixture literals mechanically swapped to
        `+test@formula-1.dk` (verified via `grep -c hpovlsen` → 0 after). The `str_ends_with($email,
        '@hpovlsen.dk')` half of the safety guard in both `cleanup_passkeys` and
        `set_passkey_sign_count` now checks `'+test@formula-1.dk'`; the `e2e_`-prefix half is
        unchanged, exactly as planned in 9.6. `php -l` clean.
      - The six `tests/e2e/**` specs (`02-auth`, `05-profile`, `07-cron`, `admin/11-invites`,
        `admin/12-users`, `admin/13-scoring`) updated the same way; `node --check` clean on all six.
      - `public/mfa_challenge.php`'s one remaining `@hpovlsen.dk` reference is a doc-comment example
        of `maskEmail()`'s output format, unrelated to fixtures/sync — left alone, out of this
        item's scope.
      - Redeployed test (`npm run deploy:test`, 8/8 smoke passed), then ran the full
        `npm run test:e2e:test` pass: **all 12 suites green, 114/114 Paddock Challenges tests
        included** — covers every spec touched above, confirming the safety-guard suffix change
        didn't regress `cleanup_passkeys`/`set_passkey_sign_count`.
      - Ran `npm run sync:live` twice back-to-back. First run: all 8 synced users landed as
        `<local>+test@formula-1.dk` (spot-checked via direct DB query), `f1_admin@helvegpovlsen.dk`
        untouched. Second run: byte-for-byte identical email list — confirms the idempotency fix
        holds, no `+test+test` accumulation.
- [x] 9.9 Update `docs/gotchas.md`'s gotcha #15 to describe the new
      `<original-local-part>+test@formula-1.dk` scheme (it currently describes `@hpovlsen.dk`
      verbatim). This is the only doc that needs updating this time — `docs/github-actions.md`,
      `docs/disaster-recovery/runbook.md`, and `config.example.php` all describe the *sending*
      identity, which per 9.6 isn't changing. — done 2026-09-21, folded into the f1_admin
      domain-change work below (9c) since both touched the same section: rewrote gotcha #15's
      heading, body, and TOC anchor, and gotcha #14's example (which also referenced the old
      `f1_admin@helvegpovlsen.dk`) to note it now applies on both live and test. `docs/gotchas.md`
      was the only file this item named, and no other doc needed touching, as predicted.
- [x] 9.10 Confirm real delivery for the new address shape — done 2026-09-21, but not via
      `send_email_preview` as originally planned: that action always targets the fixed
      `F1_ADMIN_EMAIL`, so it can't actually exercise a `+test@formula-1.dk` address and re-running
      it would have just re-proven the same F1_ADMIN_EMAIL path 9.2 already covered. Instead, ran a
      one-off local script (never committed) that `require`s `config.test.php` +
      `public/includes/smtp.php` directly on this dev machine and calls `sendEmail()` straight to
      Proton's SMTP — since `emailIntercepted()` checks a temp-dir flag file that only the deployed
      *server* can set, running locally makes interception structurally impossible, no
      `get_test_emails` check needed. Sent to both address shapes 9.8 produces:
      `thomas+test@formula-1.dk` (synced real-user shape) and `e2e_auth_f1+test@formula-1.dk` (e2e
      fixture shape). Both returned `{"success":true,"message":"Email sent successfully via SMTP"}`
      — the literal SMTP-path success message, not the intercepted-path one — confirming Proton
      *accepted* both for delivery. **Confirmed by Djarnis 2026-09-21:** both emails received —
      proves the `formula-1.dk` catch-all genuinely honors `+`-tags end-to-end for both address
      shapes, not just that Proton's SMTP accepted the send. This was the one part of the whole
      9.6-9.8 decision that hadn't been empirically proven until now. No caveats remaining.

#### 9c — `f1_admin` service account: move to `formula-1.dk` — ✅ done 2026-09-21

Raised by Djarnis after 9.8-9.10: the `F1_ADMIN_EMAIL` service/automation account
(`f1_admin@helvegpovlsen.dk`) was still on the old domain even though everything else test-related
had moved to `formula-1.dk`. Request: keep the account and its special "preserved across
`sync:live`" treatment exactly as-is, just change its domain.

- [x] 9.11 **(scope check — asked Djarnis before touching anything)** `F1_ADMIN_EMAIL` turned out
      not to be test-only: `config.live.php` defines the identical constant, and
      `.github/workflows/nightly-tests.yml` hardcodes `f1_admin@helvegpovlsen.dk` as
      `TEST_USER_EMAIL_LIVE` — the credential CI uses to log into **production** every night. Given
      the stakes (a live CI credential, a real production DB row), asked rather than assumed.
      **Decision: test only.** `config.live.php`, live's own DB, and `nightly-tests.yml`'s
      live-scoped line are all untouched.
- [x] 9.12 Implemented and verified, test only:
      - `config.test.php`: `F1_ADMIN_EMAIL` → `f1_admin@formula-1.dk`.
      - Test's own DB: the existing `users` row's `email` renamed from `f1_admin@helvegpovlsen.dk`
        to the new address via a direct one-off `UPDATE` (test DB only) — necessary because
        `sync-from-live.php`'s preserve/restore step looks the row up *by* `F1_ADMIN_EMAIL`; without
        this the account would have silently vanished on the next `sync:live` (old row no longer
        matching the new constant, nothing to restore).
      - `config.example.php` and `build-deploy/.env.example`: example values updated/annotated to
        note test and live are now allowed to diverge here.
      - `docs/gotchas.md`: folded in as 9.9 above (gotcha #14's example, gotcha #15's admin-account
        line).
      - `docs/disaster-recovery/runbook.md` (test DR drill table) and `drill-plan-test.md` updated;
        `drill-plan-live.md` and `runbook.md`'s live-restore step (both still genuinely
        `f1_admin@helvegpovlsen.dk`) left untouched.
      - Checked whether any GitHub Actions secret/variable needed updating: **no.** `REPORT_TO` (a
        repo variable, still `f1_admin@helvegpovlsen.dk`) only feeds `nightly-tests.yml`'s
        `DEPLOY_ENV: live` job — unrelated to this change. `TEST_USER_EMAIL_TEST` is referenced in
        `e2e-test-orchestrator.yml` but was **never actually set** (`gh secret list` confirms) — the
        app's own fallback chain (`cfg.adminEmail` from `config.test.php`) has been doing the real
        work all along, so it already picks up the new address with no CI change needed.
      - Redeployed test (`npm run deploy:test`) and confirmed end-to-end via the deploy's own smoke
        suite: the "authed" checks (`tests/smoke.js`) do a real login POST using
        `config.test.php`'s admin credentials — both passed, meaning the new address
        (`f1_admin@formula-1.dk`) successfully authenticated against the renamed DB row on the live
        test server. No separate ad-hoc login test needed; the routine deploy step already proved it.

### Phase 10 — Old FTP directory cleanup (strictly last, destructive, gated)

- [ ] 10.1 **(manual)** List `/hpovlsen.dk`'s full contents on the FTP server. Confirm the set matches
      exactly what this repo's tooling put there: `public/`, `config.php`, `config.shared.php`, and
      conditionally `bin/state/`. If anything else is present, **stop and ask Djarnis** before
      deleting anything. (REQ-809.1)
- [ ] 10.2 **(gate)** Get Djarnis's explicit approval specifically for deleting the deployed
      `f1-intelligence/` client instance at `/hpovlsen.dk/public/f1-intelligence/` — separate from
      the doc-edit approval in 7.3; deleting a live-adjacent deployed instance is a bigger action.
      (REQ-809.2)
- [ ] 10.3 **(gate)** Get Djarnis's explicit sign-off that every Phase 1–9 scenario has passed and
      he's ready for irreversible cleanup.
- [ ] 10.4 **(manual)** Delete `/hpovlsen.dk` via an FTP client or Simply.com's File Manager — a
      one-off action, never scripted or run unattended. (REQ-809.4)
- [ ] 10.5 Confirm the test database is unaffected (row counts/content unchanged) — this is a
      filesystem-only action with no DB dependency. (REQ-809.3)

### Rollback (only if a problem surfaces before Phase 10 runs)

Revert `config.test.php` + `build-deploy/.env` to their pre-migration values, redeploy via
`npm run deploy:test`, and flip `BASE_URL_TEST` back to `https://www.hpovlsen.dk` **in the same
action** — reverting only the code/config side while CI still points at the new domain reproduces
the exact failure NFR-802 exists to prevent, in reverse. This window closes permanently once Phase 10
runs. (NFR-803)

## Out of Scope

- Any change to `f1-intelligence/` or `public/f1-intelligence/` behavior. Per `CLAUDE.md`, that RAG
  system is live and requires explicit approval for any modification; this epic's research found no
  functional dependency on the test domain (CORS is already `Access-Control-Allow-Origin: *`,
  `F1_INTELLIGENCE_DEBUG` keys off `APP_ENV`, not the domain string) — only prose mentions in its
  reference docs need updating, and even that should get an explicit nod first (Feature 2, REQ-905).
  Note this now also covers the fact that deleting `/hpovlsen.dk` removes that domain's deployed
  `f1-intelligence/` PHP client instance (Feature 1, REQ-809) — get the same explicit nod before
  that deletion, not just before editing docs about it.
- Renaming/rotating any secret (`CRON_SECRET`, `INTEGRATION_SEED_TOKEN`, `MFA_KEY`,
  `PASSWORD_PEPPER`, …). This is a hostname/FTP-path change only; nothing here calls for touching
  cryptographic material.
- Anything about `hpovlsen.dk`'s own DNS/MX/email setup — this epic only removes its file-hosting
  role and the files at `/hpovlsen.dk`, never its DNS records or mail routing; `hpovlsen.dk` itself
  is not reconfigured by anything in Phase 9. (Phase 9, added 2026-09-20, audited the test app's
  own outbound `SMTP_FROM_EMAIL` identity as a narrow, deliberate exception to "nothing about mail
  changes" — the eventual 9.6 decision kept it unchanged, at `info@formula-1.dk`.) What **does**
  change per 9.6/9.8: `sync-from-live.php` and E2E fixtures stop *routing new test data* to
  `@hpovlsen.dk`, moving to `<original-local-part>+test@formula-1.dk` instead — `hpovlsen.dk`'s own
  configuration is untouched either way, this just means it stops being the destination for mail
  this app's test tooling generates going forward.
- A generalized "test subdomain provisioning" tool or script. One manual Simply.com setup plus one
  written convention is the right amount of process for how rarely new projects start.
