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

### Phase 9 — Email deliverability verification & sending-domain review (added 2026-09-20; moved ahead of the FTP cleanup phase on 2026-09-21)

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
Scope note below for why this doesn't reopen `hpovlsen.dk`'s DNS/MX.

#### 9a — Baseline: verify current behavior first, before changing anything

- [ ] 9.1 Inventory every email-sending code path in the app, with file + trigger condition for
      each: registration confirmation, password reset, MFA email OTP (`public/includes/mfa.php`),
      challenge invites (`public/challenges-invite.php`, `public/challenges-join.php`),
      admin-triggered notifications (`public/admin.php`, `public/admin-challenges.php`), the
      notifications cron (`public/cron/notifications.php`), and the CI nightly report /
      `npm run test:resend`. This checklist is what 9.2 actually tests against, not vibes.
- [ ] 9.2 With `SMTP_INTERCEPT` off (send-for-real is the test-env default per gotcha #17), trigger
      each path against `https://www.formula-1.helvegpovlsen.dk` and confirm **actual delivery** to
      a real inbox — check the Proton "Sent" folder and the destination inbox for each, not just
      that the app returned success. A soft bounce or silent drop looks identical to a successful
      send from the application's point of view.
- [ ] 9.3 Separately verify the Resend fallback transport (`npm run test:resend`) against test's
      current config values — a different code path/provider than primary SMTP, and it can pass or
      fail independently of it.
- [ ] 9.4 Re-run `npm run test:security`'s DNS/mail-auth checks (SPF/DKIM/DMARC, Phase 6's
      parent-domain fallback) as a documented precondition immediately before 9.2 — if these are
      failing, delivery problems found in 9.2 are an expected consequence, not a new bug to chase.
- [ ] 9.5 Write down the baseline result: pass/fail per path from 9.2/9.3, and the exact
      domain(s) currently in use for `SMTP_HOST` / `SMTP_FROM_EMAIL` / `SMTP_USER` on test. This
      baseline is the evidence for whether 9.6's refactor is actually warranted — not an assumption
      going in.

#### 9b — Sending-domain review: decide before changing

- [ ] 9.6 **(decision point — present findings to Djarnis, do not decide unilaterally)** Using
      9.5's baseline, lay out whether test's sending domain should move to `helvegpovlsen.dk`.
      Points to surface, not resolve alone:
      - Whether Proton Mail actually has `helvegpovlsen.dk` provisioned as a *verified sending*
        domain (a DKIM signing key configured for outbound), not just a domain with SPF/DMARC TXT
        records visible via DNS lookup — those are two different things, and Phase 6 only confirmed
        the latter.
      - Whether a project-scoped local part (mirroring the `<project>.helvegpovlsen.dk` convention
        from Phase 8) is preferable to a bare `noreply@helvegpovlsen.dk`, so a future project's test
        email doesn't collide in the same inbox the way `hpovlsen.dk`'s catch-all already does for
        synced/fixture accounts (gotcha #15).
      - Interaction with gotcha #14 (same-Proton-account self-send duplicate): moving `SMTP_FROM` to
        another address on the *same* Proton account doesn't by itself avoid that failure mode —
        check which account the candidate address resolves to before picking one.
      - Whether this should ever extend to live's `SMTP_FROM` (`formula-1.dk` / `info@formula-1.dk`
        today). Default assumption is **no** — out of scope for this epic per its live-untouched
        success metric — unless Djarnis explicitly says otherwise.
- [ ] 9.7 **(gate)** Get Djarnis's explicit go/no-go on the refactor before touching any config.
      This changes a real address recipients see, not just an internal setting.
- [ ] 9.8 If approved: update `config.test.php`'s `SMTP_FROM_EMAIL` (and `SMTP_USER`/`SMTP_HOST`
      only if Proton requires a distinct login identity for the new sending domain), redeploy test,
      then repeat 9.2's full send-and-verify pass end-to-end. A refactor isn't done until delivery
      is re-proven, not merely deployed.
- [ ] 9.9 Update docs alongside the config change (`docs/github-actions.md`,
      `docs/disaster-recovery/runbook.md`, `config.example.php` comments) so the new sending-domain
      convention is documented, not just implemented — same discipline as the rest of this epic.
- [ ] 9.10 Re-run `npm run test:security` and `npm run test:resend` once more post-change as final
      regression confirmation.

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
- Anything about `hpovlsen.dk`'s DNS/MX/email setup. That domain keeps functioning exactly as it
  does today for `sync-from-live.php`/e2e-fixture email purposes — this epic only removes its
  file-hosting role and the files at `/hpovlsen.dk`, never its DNS records or mail routing.
  (Phase 9, added 2026-09-20, is a narrow, deliberate exception to this: it audits — and, pending
  Djarnis's go/no-go, potentially reconfigures — the test app's own outbound `SMTP_FROM_EMAIL`
  identity. It does not touch `hpovlsen.dk`'s DNS/MX, which remains untouched either way.)
- A generalized "test subdomain provisioning" tool or script. One manual Simply.com setup plus one
  written convention is the right amount of process for how rarely new projects start.
