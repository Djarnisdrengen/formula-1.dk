# Betting notifications catch-up: stop missing "Betting åbent" emails

**Status:** plan only. All decisions made 2026-10-20 (1.3, Phase 2). Nothing is implemented;
code changes start only on Djarnis's go.
**Date:** 2026-10-20

## Why

Players stopped getting the "Betting åbent" email for most races after late August. The first
report came from a player on a company Microsoft 365 address, so the first suspicion was mail
filtering (see the Robinsonklubben handoff, its gotcha #40). The evidence says otherwise: the
email was **never sent**, to anyone.

### Evidence (collected 2026-10-20)

1. **Proton Sent folder**, two players (one on Microsoft 365, one on a private domain). Both have
   the same gaps:

   | Race | Window opened | "Betting åbent" in Sent |
   | --- | --- | --- |
   | Monaco, Barcelona, Austrian, British, Belgian, Hungarian | Jun 5 – Jul 24 | ✅ every race |
   | Dutch | Aug 21 | ✅ |
   | Italian | Sep 4 | ❌ |
   | Spanish | Sep 11 | ✅ |
   | Bahrain | ~Oct 2 | ❌ |
   | Singapore | Oct 9 | ❌ |

   Every "Betting åbent" that went out went through Proton, so the Resend fallback is not involved.

2. **`cron-notifications.yml` run history** (GitHub Actions, scheduled `1 * * * *` = hourly):
   - Aug 22–25: 22–23 runs a day.
   - From ~Aug 27: **4–8 runs a day**, at irregular times. GitHub treats schedules as best-effort.

3. **`notifications.php` only sends "open" if a run lands in the hour after the window opens**
   (`$bettingOpens > $hourAgo && $bettingOpens <= $now`). A missed hour is never made up.
   - Spanish: opened ~13:00 UTC Sep 11, run at 13:15 → log shows `Betting opened for: Spanish
     Grand Prix` and 5 sends.
   - Italian: opened ~13:00 UTC Sep 4, runs at 10:39 and 14:47 → missed.
   - Bahrain: the nearest run (Oct 2, 13:35) took 2 s and sent nothing.
   - Singapore: runs at 10:05 and 17:19 on Oct 9 → missed. The 17:19 log has only
     `Notification check complete.`

   With ~5 runs a day against a 1-hour window, the hit rate is about 1 in 4. That matches 1 of 4
   since late August.

**The "betting closes soon" email has the same 1-hour design** (2–3 h before the race), so it is
being missed just as often. Nobody noticed because most players bet early.

The pool reminders to non-competing users and pending invites are sent in the same block as
"open", so those were missed too.

## Goal

- Each race sends "open" **exactly once**, even when the cron runs hours late or twice in one
  hour.
- Each race sends "closing soon" **at most once**, and only while it is still useful.
- A late run sends late. It never skips silently.
- No flood of old emails when the change is deployed.

## Out of scope

- Email wording, templates, languages.
- The Microsoft 365 link-domain issue on **test** (handled as a gotcha in Phase 3, no code).
- Changing who receives what (in-competition users who haven't bet; pool reminders to the rest).
- The scheduling logic of `import_qualifying.php` and the other cron jobs. They have their own
  windows and should be reviewed separately (noted in Phase 3). The only change there is removing
  `import_qualifying.php`'s old `?token=` shim (2.2).

---

## Phase 1: catch-up logic with a per-race "sent" marker

### 1.1 Migration: `database/add_race_notification_tracking.sql` (new)

```sql
-- Tracks whether the betting-open and closing-soon notifications have been sent for each race,
-- so notifications.php can catch up after a late or missed cron run instead of relying on
-- hitting a 1-hour window. NULL = not sent yet. Additive, safe to run once per environment.

ALTER TABLE races
    ADD COLUMN open_notified_at    DATETIME NULL DEFAULT NULL,
    ADD COLUMN closing_notified_at DATETIME NULL DEFAULT NULL;

-- Backfill: every race that has already started or has a result counts as notified, so the
-- first run after deploy doesn't send emails for old races. Day precision is enough because
-- the deploy happens outside any open window (see 1.6).
UPDATE races
   SET open_notified_at = NOW(), closing_notified_at = NOW()
 WHERE result_p1 IS NOT NULL OR race_date < CURDATE();
```

Why the backfill compares dates, not exact times: race times are stored as Danish local time and
compared in PHP. MySQL's `NOW()` on Simply.com may be UTC. A date comparison plus the deploy-timing
rule in 1.6 avoids that time-zone trap.

### 1.2 Register the migration

- `database/schema.sql`: add the two columns to `CREATE TABLE races`, so fresh installs and the
  disaster-recovery restore get them.
- `database/migrations.json`: add
  `{ "migration": "add_race_notification_tracking.sql", "table": "races", "columns": ["open_notified_at", "closing_notified_at"] }`
  so `deploy.js`'s schema check fails loudly if the SQL wasn't run.

### 1.3 New send rules in `public/cron/notifications.php`

Replace the two time-window `if` blocks with:

```text
raceStart    = race_date + race_time
bettingOpens = raceStart − betting_window_hours
closingFrom  = raceStart − 3 h
(races already filtered: result_p1 IS NULL)

if now >= raceStart: skip the race (betting closed; nothing to send)

OPEN, when open_notified_at IS NULL and now >= bettingOpens:
    if now < closingFrom:
        claim "open" (see 1.4) → send open emails + pool reminders
    else:
        mark "open" as sent without sending (closing soon covers it; avoids two emails at once)

CLOSING, when closing_notified_at IS NULL and closingFrom <= now < raceStart:
    claim "closing" → send closing emails to users who haven't bet
```

The rule "skip open if we're already inside the closing window" stops a very late run (or the
first run after a long outage) from sending "betting is open" and "closes soon" in the same minute.

**Decided 2026-10-20 (Djarnis): keep the 3 h window** and fix the trigger in Phase 2 so runs are
hourly again. Rejected: widening to ~6 h, or a "skip if < 30 min left" floor. With ~5 runs a day
a "closing soon" email could arrive minutes before the race or be missed; reliable hourly runs
are the fix for that.

### 1.4 Claim before sending, so two runs can't double-send

Use an atomic claim per race and per kind:

```php
$claim = $db->prepare("UPDATE races SET open_notified_at = ? WHERE id = ? AND open_notified_at IS NULL");
$claim->execute([date('Y-m-d H:i:s'), $race['id']]);
if ($claim->rowCount() !== 1) continue; // another run got there first
// ... send ...
```

- Timestamp from PHP (`date()`), not MySQL `NOW()`, for the same time-zone reason as 1.1.
- **At most once, by design.** If a send fails for one user, it is not retried on the next run.
  That user's failure is still logged (`[FAIL]` in `mail.log` and `FAILED …` in the cron output).
  Retrying per user would need a per-user table; not worth it for 5–10 players.
- In **test mode** (`?test=true` / `--test`) skip the claim entirely. Test mode must stay read-only,
  otherwise the e2e test-mode run would mark the race and the real-send test that follows would
  find nothing to send.

### 1.5 Better logging

Today the cron only echoes to the HTTP response (visible in the GitHub Actions log). Also write the
summary to `cron_notifications.log` via `logMessage()`:

- `Betting opened for: <race> (sent N, opened Xh Ym ago)`: the lateness shows at a glance
  whether the trigger is running often enough.
- `Betting closing soon for: <race> (sent N, starts in Xh Ym)`
- `Open notification skipped for: <race> (already inside closing window)`

No recipient addresses in the log file (they're already in `mail.log`).

### 1.6 Rescheduled races

If an admin changes a race's date or time (`public/admin.php`, `UPDATE races SET … race_date = ?,
race_time = ?`), reset both markers to `NULL` **only when the date or time actually changed**.
Otherwise a race moved a week later would never get its "open" email.

Edge cases to accept:
- If a race is moved to an earlier time and "open" was already sent, a reset means a second "open"
  email. That is correct (the dates in the first email are now wrong).
- Changing `betting_window_hours` in settings does not reset anything. The next race uses the new
  window.

### 1.7 Deploy timing rule

Deploy (and run the migration) when **no race is between "betting opened" and "race start"**, e.g.
the Monday/Tuesday after a race weekend. Then the backfill in 1.1 is exact: every past race is
marked, and the next race starts unmarked.

If a deploy has to happen inside an open window, first check in Proton Sent whether "Betting
åbent" for that race already went out. If it did, set `open_notified_at` by hand for that race
before the first cron run. If not, leave it NULL and the next run sends it (that's the fix
working).

---

## Phase 1 tests (`tests/e2e/07-cron.spec.js` + `public/tools/test-seed.php`)

The existing seeds still apply: `seed_notification_open` puts the race 47 h 30 m away (opened 30
min ago) and `seed_notification_close` puts it 2 h 30 m away. New columns default to NULL, so the
seeds need no change for the existing tests.

### New seed actions

| Action | Race placed at | Purpose |
| --- | --- | --- |
| `seed_notification_open_late` | 43 h from now (opened 5 h ago, outside the old 1 h window) | Regression test for this bug |
| `seed_notification_open_in_closing` | 2 h 30 m from now, `open_notified_at` NULL | Open must be skipped, closing sent |
| matching `cleanup_*` actions | — | Same cleanup style as the existing ones |

They reuse the existing `e2e_notify_*_f1+test@formula-1.dk` fixture users (same safety guards).

### New and changed test cases

| # | Test | Expected |
| --- | --- | --- |
| T1 | **Late run still sends** (`open_late`, test mode) | Output contains `Betting opened for: E2E Notify Open Late Race` and `Sent open notification to: <fixture>`. Fails on today's code: proves the bug and the fix. |
| T2 | **Exactly once** (`open`, real send, run the cron twice) | 1st run: `Sent open notification to: <fixture>`. 2nd run: no `Betting opened for: E2E Notify Open Race` line. |
| T3 | **Test mode is read-only** (`open`: test-mode run, then real run) | The real run still sends. |
| T4 | **Closing exactly once** (`close`, real send, twice) | 1st run sends closing to the unbetted user; 2nd run doesn't. Existing "skip user who already bet" assertion kept. |
| T5 | **No double email when very late** (`open_in_closing`, real send) | Contains `Betting closing soon for:` and `Open notification skipped for:`; does **not** contain `Betting opened for:` for that race. |
| T6 | **Pool reminders follow "open"** (`open_late`) | Pool reminder sent to the non-competing user and pending invite, once. |
| T7 | Existing access-control and "completes cleanly" tests | Unchanged, still pass. |

Optional (nice to have): an admin test in `tests/e2e/admin/10-content.spec.js` that moving a race's
date resets the markers (check via a small `test-seed.php` read action).

### How to run

```bash
npm run deploy:test          # after the migration SQL has been run on test via phpMyAdmin
DEPLOY_ENV=test npx playwright test tests/e2e/07-cron.spec.js --config tests/playwright.config.js
npm run test:e2e:test        # full suite, before asking for the live deploy
```

---

## Phase 2: a reliable trigger (Simply.com cron + per-job URL token, GitHub as backup)

**Decided 2026-10-20 (Djarnis):** trigger `notifications.php` from **Simply.com's control-panel
cron** (the site's own host), with **GitHub Actions kept as a backup**, and remove the GitHub
schedule later once Simply's cron has proven itself.

Why Simply.com: it triggered the notifications until 2026-07-09, and in that period every race got
its "Betting åbent" email (Monaco, Barcelona, Austrian, British). No new account or provider.

Rejected:
- **cron-job.org**: would work (it supports headers), but adds an outside service holding a secret.
- **Gigahost.dk webhotel cron**: same limit as Simply (no custom headers) and on a different host,
  so no advantage.

**The constraint:** Simply's cron (and Gigahost's) can only send a plain GET. No headers, so the
secret must be in the URL (`?token=…`). That is what F6 (`security-findings-remaining.md`) removed,
because a URL ends up in access logs and the control panel. Today there is one `CRON_SECRET` for
every cron endpoint, so leaking it would expose all of them (challenge purge, qualifying import,
session GC, …).

**The answer: a separate secret per URL-triggered job.** Each job that a header-less cron calls
gets its own token, accepted **only** by that one endpoint and **only** as `?token=`. If it leaks,
the worst case is that someone runs that one job early. After Phase 1, the notification job only
sends what is already due, and only once, so an extra run does nothing.

### 2.1 Per-job token: `NOTIFY_CRON_TOKEN`

- New constant in `config.test.php` and `config.live.php`, **different** values, 64 hex chars
  (`php -r "echo bin2hex(random_bytes(32));"`). Djarnis adds them by hand; Claude can't read or
  write these files.
- `config.example.php`: add a commented example under `// ── CRON ──`, explaining that it is the
  URL token for the header-less Simply.com cron and works for `notifications.php` only.
- `public/includes/functions.php`: a small helper next to `getBearerToken()`, reusable for any
  future per-job token:

  ```php
  // Per-job URL token for header-less cron triggers (Simply.com control-panel cron).
  // Accepted only by the one endpoint that names the constant, never as a Bearer token.
  function cronUrlTokenValid(string $const): bool {
      if (!defined($const) || strlen((string)constant($const)) < 32) return false;
      $given = $_GET['token'] ?? null;
      return is_string($given) && hash_equals(constant($const), $given);
  }
  ```

  A missing or short constant means "not configured", so the URL route is simply off.
- `public/cron/notifications.php`, HTTP branch:
  - accept `Authorization: Bearer <CRON_SECRET>` (GitHub backup, manual runs), **or**
    `cronUrlTokenValid('NOTIFY_CRON_TOKEN')` (Simply cron);
  - **remove** the legacy `?token=<CRON_SECRET>` shim (the "F6 TEMPORARY SHIM" block). From now on
    the shared secret is never accepted in a URL;
  - `NOTIFY_CRON_TOKEN` sent as a Bearer header is **not** accepted (one token, one route);
  - log which route triggered the run: `Run triggered by: github-bearer | simply-url-token | cli`
    in `cron_notifications.log`, next to Phase 1.5's lines. That makes it visible which trigger
    actually sent each race, which is the evidence needed for 2.5. The token itself is never logged.

### 2.2 F6 clean-up for the other cron script

`public/cron/import_qualifying.php` still has the same `?token=<CRON_SECRET>` shim, and it's only
triggered by GitHub with the Bearer header. Remove the shim there too, so the shared secret is
accepted in URLs nowhere. If the qualifying import later moves to Simply's cron, it gets its own
`QUALIFYING_CRON_TOKEN` with the same helper.

Update F6 in `security-findings-remaining.md`: shared-secret URL tokens removed everywhere; the one
documented exception is the per-job `NOTIFY_CRON_TOKEN`, with the reason above.

### 2.3 Set up the Simply.com cron (Djarnis, in Simply's control panel)

Only after Phase 1 and 2.1 are deployed to that environment. One job per environment:

| Field | Live | Test |
| --- | --- | --- |
| URL | `https://www.formula-1.dk/cron/notifications.php?token=<NOTIFY_CRON_TOKEN from config.live.php>` | `https://www.formula-1.helvegpovlsen.dk/cron/notifications.php?token=<NOTIFY_CRON_TOKEN from config.test.php>` |
| Interval | every hour | every hour |
| Minute (if the panel lets you choose) | about `:53`, so it lands ~30 min away from GitHub's `:23` | same |

Always `www` (non-www 301-redirects). Check afterwards: within an hour `cron_notifications.log`
shows `Run triggered by: simply-url-token`.

Simply's cron probably doesn't email on failure or keep responses. Covered by: the GitHub backup
(2.4), and the log lines from 1.5 and 2.1. A later nice-to-have (not in this plan): a "last
notification run" line in the nightly report.

### 2.4 GitHub Actions as backup (`cron-notifications.yml`)

**Decided 2026-10-20 (Djarnis): keep the schedule as a backup**, moved from minute `1` to `23`
(GitHub drops more runs near the top of the hour). Both triggers run; Phase 1's claim (1.4) makes
double sends impossible, and if Simply's cron stops, emails still go out (later) via GitHub. The
workflow keeps using `Authorization: Bearer CRON_SECRET`. `workflow_dispatch` (manual run, incl.
dry run) stays.

Side note: since ~Aug 27 the repo also runs `cron-warm-actions-cache.yml` every 5 minutes and
`cron-session-gc.yml` hourly at `:00`. I can't tell from the shallow clone whether these coincide
with the drop, and GitHub doesn't document per-repo schedule throttling. Worth a look, not
assumed to be the cause.

### 2.5 Later: remove the GitHub schedule

For simplicity (one trigger), once Simply's cron has proven itself. Criterion: about a month /
4 race weekends where `cron_notifications.log` shows `Run triggered by: simply-url-token` every
hour, and each race's `Betting opened for:` line came from a Simply run. Then remove `schedule:`
from `cron-notifications.yml` (keep `workflow_dispatch`) and update the docs. Tracked in
[Djarnisdrengen/formula-1.dk#204](https://github.com/Djarnisdrengen/formula-1.dk/issues/204).

### 2.6 Nøgler & Rotation

Add `NOTIFY_CRON_TOKEN` as a **record-only** entry (like `RESEND_API_KEY`) in
`public/includes/admin-dashboards/nogler-rotation-lib.php` and `docs/admin-dashboards.md`.
Rotation is manual: new value in `config.<env>.php`, deploy, then paste the new URL into Simply's
cron for that environment. `CRON_SECRET`'s existing auto-rotation is unchanged (it is no longer
used in any URL).

### Phase 2 tests (`tests/e2e/07-cron.spec.js`, "notifications — access control")

`build-deploy/php-config.js` reads `NOTIFY_CRON_TOKEN` and `tests/playwright.config.js` exposes it
as `process.env.NOTIFY_CRON_TOKEN`, like `CRON_SECRET` today.

| # | Request | Expected |
| --- | --- | --- |
| A1 | `?token=<NOTIFY_CRON_TOKEN>` | `Notification check complete` |
| A2 | `?token=<CRON_SECRET>` (old shim) | `Unauthorized access` |
| A3 | `?token=wrong` | `Unauthorized access` |
| A4 | `Authorization: Bearer <NOTIFY_CRON_TOKEN>` | `Unauthorized access` |
| A5 | `Authorization: Bearer <CRON_SECRET>` | `Notification check complete` (existing test) |
| A6 | `import_qualifying.php?token=<CRON_SECRET>` | `Unauthorized access` (2.2) |

---

## Phase 3: docs

- `docs/cron-jobs.md`: the triggers are now Simply.com cron (URL + `NOTIFY_CRON_TOKEN`) with
  GitHub as backup; the "temporary `?token=` shim" text goes away; a new "Per-job URL tokens"
  paragraph explains the rule (one token per header-less job, accepted only by that endpoint);
  and § 2 Email Notifications describes the new catch-up rules, the markers, the
  "skip open inside closing window" rule, and that test mode never writes.
- `docs/github-actions.md`: the `cron-notifications.yml` entry is now the backup trigger at `:23`.
- `docs/gotchas.md`, new entries:
  - **Header-less crons (Simply.com, Gigahost) need a per-job URL token**, never the shared
    `CRON_SECRET`.
  - **GitHub Actions schedules are best-effort.** A job that only acts inside a narrow time window
    will silently skip. Use "has it been done yet?" markers instead of "is it exactly time now?".
    Includes this incident's numbers.
  - **Microsoft 365 drops mail whose links point to another domain than the sender** (from the
    Robinsonklubben handoff, its gotcha #40). Live is fine (`formula-1.dk` → `formula-1.dk`).
    Test is mismatched (`info@formula-1.dk` → `formula-1.helvegpovlsen.dk`), so on test use
    Gmail/private addresses and test company inboxes from live only. Note that this incident
    looked like that problem and wasn't.
- Follow-up note (not done here): review `import_qualifying.php` for the same narrow-window
  pattern.

---

## Order of work and gates

1. Djarnis approves this plan. Decided 2026-10-20: 1.3 keep the 3 h window; Phase 2 Simply.com
   cron with a per-job token; GitHub as backup at `:23`; remove GitHub later (#204).
2. Djarnis adds `NOTIFY_CRON_TOKEN` to `config.test.php` (and `config.live.php`, different value).
3. Phase 1 + Phase 2 code, tests and Phase 3 docs on the working branch.
4. Run `add_race_notification_tracking.sql` on **test** via phpMyAdmin → `npm run deploy:test`
   (schema check must pass) → run the cron spec, then the full e2e suite.
5. Djarnis creates the **test** Simply cron job (2.3). Check `Run triggered by: simply-url-token`
   in test's `cron_notifications.log`.
6. Djarnis picks a live deploy slot per 1.7 → run the SQL on **live** → `npm run deploy:live` (only
   on Djarnis's go) → `npm run schema:check:live` → create the **live** Simply cron job (2.3).
7. Watch the next race weekend: `cron_notifications.log` shows `Betting opened for: …` exactly
   once, with its lateness and which trigger sent it. Check Proton Sent for one player.
8. After about a month / 4 race weekends of clean Simply runs: do #204 (remove the GitHub
   schedule).

## Rollback

- Trigger: if Simply's cron misbehaves, delete the job in Simply's panel; the GitHub backup keeps
  running. Note that rolling back the code also brings back the old `?token=<CRON_SECRET>` shim.
- Code: `node build-deploy/rollback.js` (or redeploy the previous commit). `deploy:live` also
  rolls back by itself if its tests fail. The old code ignores the new columns.
- DB: the columns can stay; they're harmless to the old code. To remove them:
  `ALTER TABLE races DROP COLUMN open_notified_at, DROP COLUMN closing_notified_at;` and remove the
  `migrations.json` entry, otherwise the schema check fails.

## Files touched (summary)

| File | Change |
| --- | --- |
| `database/add_race_notification_tracking.sql` | new migration + backfill |
| `database/schema.sql` | two columns on `races` |
| `database/migrations.json` | register the columns |
| `public/cron/notifications.php` | catch-up rules, claim, test-mode read-only, logging; auth: Bearer `CRON_SECRET` or `?token=NOTIFY_CRON_TOKEN`, old shim removed |
| `public/cron/import_qualifying.php` | remove the `?token=CRON_SECRET` shim (2.2) |
| `public/includes/functions.php` | `cronUrlTokenValid()` helper |
| `config.example.php` | commented `NOTIFY_CRON_TOKEN` example |
| `build-deploy/php-config.js`, `tests/playwright.config.js` | expose `NOTIFY_CRON_TOKEN` to tests |
| `public/admin.php` | reset markers when a race's date/time changes |
| `public/tools/test-seed.php` | 2 seed + 2 cleanup actions |
| `tests/e2e/07-cron.spec.js` | T1–T6, A1–A6 |
| `.github/workflows/cron-notifications.yml` | minute `1` → `23` (backup trigger, 2.4) |
| `public/includes/admin-dashboards/nogler-rotation-lib.php`, `docs/admin-dashboards.md` | record-only `NOTIFY_CRON_TOKEN` entry (2.6) |
| `security-findings-remaining.md` | F6: shim gone, per-job token exception documented |
| `docs/cron-jobs.md`, `docs/gotchas.md`, `docs/github-actions.md` | Phase 3 |
| Not in git (Djarnis) | `NOTIFY_CRON_TOKEN` in `config.test.php` / `config.live.php`; Simply cron jobs |
