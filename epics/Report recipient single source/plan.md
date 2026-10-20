# Epic: One `REPORT_TO`, stored in one place

**Status:** proposed — awaiting Djarnis' OK before any code change
**Date:** 2026-10-20

## Why

Ops emails (nightly report, monthly security review, Resend health check) each work out their
recipient differently, and the value lives in up to four places:

| Script | How it resolves the recipient today |
| --- | --- |
| `build-deploy/nightly-report.js:27` | `process.env.REPORT_TO` → hardcoded `thomas@helvegpovlsen.dk` |
| `build-deploy/security-review.js:26` | `process.env.REPORT_TO` → hardcoded `thomas@helvegpovlsen.dk` |
| `build-deploy/verify-resend.js:15` | `process.env.REPORT_TO` → `REPORT_TO` in `config.<env>.php` → `F1_ADMIN_EMAIL` |

The places the value can come from:

1. GitHub **repo variable** `REPORT_TO` (= `f1_admin@helvegpovlsen.dk`), passed in by
   `nightly-tests.yml:26` and `monthly-security-review.yml:33`.
2. `config.test.php` / `config.live.php`: optional, and not in `config.example.php`, so it is
   normally missing.
3. `F1_ADMIN_EMAIL`: the automation login account, used here only by accident of the fallback.
4. Two hardcoded fallbacks in the scripts.

The result: `npm run test:resend` run locally goes to `F1_ADMIN_EMAIL`, while CI goes to the GitHub
variable. Nothing tells you which one was used. The docs also disagree with each other:
`docs/github-actions.md:372` says `REPORT_TO` is a *secret*, but it is a *variable*.

## User value

For Djarnis as the operator: one obvious place to change where ops mail goes. Local and CI runs
then behave the same, and none of the scripts can silently send to a different inbox. Players see
no change.

## Decision: where the single value lives

**`config.shared.php`** gets `define('REPORT_TO', '…');`.

- It is already in git and is read the same way on every machine and in CI (CI checks out the
  repo), so it needs no secret store and no extra sync between desktop and laptop.
- It is one value for test and live. That already matches today, since CI uses one variable for
  both.
- The address is not a secret. The repo is public, but the address already appears in
  `docs/gotchas.md`, and GitHub variables are plain text anyway.
- Rejected: **GitHub variable only**. Local runs would need `gh variable get` (a network call plus
  gh auth), and the value would not be versioned.
- Rejected: **`config.<env>.php`**. It would be two copies (test and live) on two machines, plus a
  GitHub copy for CI. That is the problem we are trying to fix.

**Rule after this epic:** scripts read `REPORT_TO` only from `config.shared.php`. There is no
env-var override and no fallback. If the value is missing, the script fails loudly.

## Plan

1. **`config.shared.php`**: add `define('REPORT_TO', 'f1_admin@helvegpovlsen.dk');` with a
   one-line comment ("recipient of nightly / security / Resend ops mail — the only place this is
   set"). Djarnis confirms the address first; the current GitHub variable value is shown above.
2. **`build-deploy/php-config.js`**: add `readSharedConfig()`. It reads string `define()`s from
   `config.shared.php` and does not depend on `config.<env>.php`, which does not exist in CI.
   Remove `reportTo` from `readPhpConfig()`.
3. **Scripts**: in `verify-resend.js`, `nightly-report.js` and `security-review.js`, set
   `REPORT_TO = readSharedConfig().reportTo`. Drop `process.env.REPORT_TO`, the hardcoded
   `thomas@helvegpovlsen.dk` and the `F1_ADMIN_EMAIL` fallback. If the value is missing, exit 1
   with a clear message. Update the header comment in `nightly-report.js` (lines 6–9).
4. **Workflows**: remove the `REPORT_TO:` env lines from `nightly-tests.yml` and
   `monthly-security-review.yml`.
5. **Local config cleanup (Djarnis)**: if `config.test.php` or `config.live.php` defines
   `REPORT_TO`, delete it, on **both** desktop and laptop. Claude cannot read those files
   (secret-file hook).
6. **Docs** (same commit): `docs/gotchas.md` (#14 wording + line 223 fallback text),
   `docs/github-actions.md` (lines 37, 217, 342, 372, which also fixes the "secret" error),
   `build-deploy/DEPLOYMENT.md:173`, `docs/disaster-recovery/runbook.md:176`, and
   `docs/testing.md` (lines 695, 704, 708, 812). Each says that `REPORT_TO` lives in
   `config.shared.php`.
7. **Delete the GitHub variable** `REPORT_TO`, but only after the CI run in step 8 is green
   (`gh variable delete REPORT_TO`). Djarnis runs this or explicitly approves it.

## Verification

8. Locally: `npm run test:resend` and `npm run test:resend:live`. Both must log the recipient from
   `config.shared.php` and arrive there.
   CI: after pushing, trigger `nightly-tests.yml` and `monthly-security-review.yml` via
   `workflow_dispatch` (with Djarnis' OK). Both emails must arrive at the same address.
9. `grep -rn "REPORT_TO"` (excluding `config.test.php` and `config.live.php`) should only hit
   `config.shared.php`, `php-config.js`, the three scripts and the docs.

## Acceptance criteria

```gherkin
Feature: Single source for the ops-report recipient

  Scenario: Local Resend check uses the shared recipient
    Given REPORT_TO is defined only in config.shared.php
    And no REPORT_TO env var is set
    When Djarnis runs "npm run test:resend"
    Then the health-check email is sent to the config.shared.php address
    And not to F1_ADMIN_EMAIL

  Scenario: CI and local agree
    Given the GitHub variable REPORT_TO has been deleted
    When the nightly and monthly security workflows run
    Then the report emails go to the same config.shared.php address

  Scenario: Missing value fails loudly
    Given REPORT_TO is removed from config.shared.php
    When any of the three ops scripts runs
    Then it exits non-zero with a message naming config.shared.php
    And no email is sent to a fallback address

  Scenario: Changing the recipient is a one-line change
    Given Djarnis edits REPORT_TO in config.shared.php and pushes
    Then the next local run and the next CI run both use the new address
```

## Out of scope

- `F1_ADMIN_EMAIL` stays the automation login account (smoke, E2E, seeding), unchanged.
- `test-seed.php` `send_email_preview` keeps sending to `F1_ADMIN_EMAIL`. Those are app emails
  rendered for the admin account, not ops reports. Moving them is a possible follow-up.
- The same treatment for `SMTP_FROM` (also a GitHub variable, duplicated as `SMTP_FROM_EMAIL` in
  `config.<env>.php`) would be a natural follow-up epic.
- Gotcha #14 (duplicate mail when sender and recipient share the Proton account) is not fixed here.
  This epic just makes the address easier to change if you want to fix it later.

## Rollback

Revert the commit and re-create the variable:
`gh variable set REPORT_TO --body f1_admin@helvegpovlsen.dk`.

## Risk

Low. The only thing that can go wrong is report mail going missing, and step 8 catches that before
the GitHub variable is deleted.
