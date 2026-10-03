# Email Sending & Test-Data Email Addressing — handoff to Robinsonklubben

Prepared from the `formula-1.dk` repo, 2026-09-22, for a same-developer sibling project
(Robinsonklubben / robinsonklubben.dk). Not an automated cross-repo change, and not placed in that
repo either — Djarnis does the actual handover himself; this is the prepared reference for him to
copy across. Source: Phase 9b of the *Test site domain migration* epic (`epics/Test site domain
migration/plan.md`, commits around 2026-09-21).

## In short

Robinsonklubben's `public/includes/smtp.php` already mirrors this repo's shape closely — same
`SMTPMailer` class, same SMTP-then-Resend fallback, same "real delivery is the test-env default,
interception is opt-in via a `sys_get_temp_dir()` flag file" architecture (confirmed by reading it
during this write-up). **This is not a sending-mechanics handoff.** It's about where **test-data
email addresses** (synced live users + e2e fixtures) actually land — a question Robinsonklubben's
own code has already answered differently than formula-1.dk settled on this week — and comparing
the two surfaced what looks like two live, currently-unnoticed issues in Robinsonklubben's own
`public/tools/sync-from-live.php`, worth a second look regardless of whether the addressing pattern
below gets adopted there.

## 1. The constraint that drove this (confirmed 2026-09-21, applies to both apps)

Djarnis confirmed directly this week, while formula-1.dk was deciding where test-data mail should
land after its test site moved to `formula-1.helvegpovlsen.dk`: **Simply.com does not support
email addresses on a subdomain** — only the registrable apex domain can have a mailbox or
catch-all forwarding rule. This is the same hosting product Robinsonklubben sits on (both repos'
own docs independently confirm Simply.com), so the constraint applies there too, not just here. It
hadn't been written down anywhere before either project hit it.

## 2. Finding — real family invite emails are copied into test unrewritten

**This is the one worth Robinsonklubben checking first, independent of anything else in this doc.**

`public/tools/sync-from-live.php`'s `$syncTables` list includes `robinson_invites`, copied
verbatim (`INSERT INTO robinson_invites SELECT * FROM {live}.robinson_invites`, no rewrite). The
one anonymization step that runs afterward —
```php
$db->prepare(
    "UPDATE robinson_users
     SET email = IF(email IS NULL, NULL, CONCAT(id, '@sync.robinsonklubben.dk')),
         password_hash = ?
     WHERE is_guest = 0"
)->execute([$syncPasswordHash]);
```
— only touches `robinson_users.email`. `robinson_invites.email` (`schema.sql`: `VARCHAR(255) NOT
NULL`, the invitee's real personal address, used to send them the actual invite link) is never
rewritten. Every pending, not-yet-accepted invite on live carries a real family member's real
email address straight into the test database on every `sync:live` run.

Robinsonklubben's own `docs/gotchas.md #4` already names the goal this misses — "must rewrite
member emails and reset passwords... never copy real family credentials into the test DB" — the
implementation just didn't reach `robinson_invites` when it covered `robinson_users`. Two concrete
risks, not just a hygiene nit: (1) test-env tooling now holds real PII it shouldn't, and (2) if any
admin/test action ever re-triggers an invite send against one of these rows (e.g. a "resend
invite" feature, if one exists or gets built — formula-1.dk has exactly this at `admin.php:513`),
it would send a real email to a real, unsuspecting family member *from the test environment*. Fix
is a one-line addition to the anonymization step: rewrite `robinson_invites.email` the same way
(or clear/skip unused invites entirely — a design choice, but *some* handling is needed).

## 3. Finding — the rewrite targets are unprovisioned subdomains

Two addresses Robinsonklubben already generates for test data:

- `sync-from-live.php`: `CONCAT(id, '@sync.robinsonklubben.dk')` for every synced `robinson_users`
  row.
- `test-seed.php:48`: `const E2E_EMAIL_DOMAIN = 'test.robinsonklubben.dk';`, used for every e2e
  fixture (`e2e_fam{N}_member{N}@test.robinsonklubben.dk`).

Both `sync.robinsonklubben.dk` and `test.robinsonklubben.dk` are subdomains of the apex
`robinsonklubben.dk`. Neither appears anywhere else in that repo (no DNS setup notes, no MX/mail
mention in `docs/architecture.md` or `docs/gotchas.md`) — they read as addresses invented at the
point they were written, not domains actually provisioned with a mailbox on Simply.com. Given §1's
confirmed constraint, they very likely can't be — Simply.com only supports mailboxes/catch-all at
the apex. The only Proton-side identity Robinsonklubben's own `config.example.php` confirms as
real is the apex itself: `SMTP_USER`/`SMTP_FROM_EMAIL = noreply@robinsonklubben.dk`.

Consequence: any time `SMTP_INTERCEPT`'s flag is off — which, per Robinsonklubben's own `smtp.php`
and `docs/testing.md`, mirrors formula-1.dk exactly and is the **default** state outside an active
E2E run — mail to a synced user or an e2e fixture almost certainly evaporates silently. There's no
way to eyeball an invite/reset email by hand against synced or fixture data the way manual testing
normally works, and this is easy to never notice: day-to-day interaction is either automated
(interception on, so delivery was never real to begin with) or doesn't happen to involve sending to
one of these addresses. formula-1.dk had exactly this problem with an equivalent
non-existent-domain fixture placeholder before this week's fix and only found it by deliberately
testing real delivery, not by inspection.

**Not verified in this session** (would require a real send from Robinsonklubben's own config, out
of scope for a read-only cross-repo comparison) — worth a two-minute check before trusting this:
send to `anything@test.robinsonklubben.dk` for real (flip interception off first) and see whether
it bounces/vanishes.

## 4. The pattern formula-1.dk landed on

Given §1's constraint, formula-1.dk rejected moving test-data addresses to a second domain
(`helvegpovlsen.dk`) for the same reason — no proof it even has catch-all, and it can't be a
subdomain-scoped address regardless. Instead:

**Test data (synced users + e2e fixtures) moved onto the one already-known-working apex,
using `+`-addressing off its existing catch-all — no manual mailbox provisioning needed.**

- Sending identity stayed exactly where it was (`info@formula-1.dk` — unrelated decision, no
  domain move).
- `sync-from-live.php`'s rewrite: `<original-local-part>` → `<original-local-part>+test@formula-1.dk`
  (e.g. `thomas@gmail.com` → `thomas+test@formula-1.dk`), with any pre-existing `+tag` stripped
  first so a live user whose *real* address is itself plus-addressed doesn't produce a compound
  result, and so **re-running the sync twice is idempotent** (no `+test+test` accumulation).
- e2e fixtures: `e2e_auth_f1@hpovlsen.dk` → `e2e_auth_f1+test@formula-1.dk` — same domain as
  synced users now, deliberately (one domain, one catch-all, nothing to provision).
- **Tag goes at the end, not the front** (`<original>+test@`, not `test+<original>@`) — chosen
  specifically because synced users and fixtures now share one domain, and existing safety-guard
  code that gated destructive test-only actions (`cleanup_passkeys`, `set_passkey_sign_count` —
  passkey-cleanup endpoints, `test-seed.php`) used to check `str_starts_with($email, 'e2e_')`
  alone. Once fixtures and real synced users share a domain, the domain half can no longer
  distinguish them, so those guards had to add a **second** check on the domain suffix
  (`str_ends_with($email, '+test@formula-1.dk')`) — putting the tag at the end kept the *existing*
  prefix check untouched, only the domain-suffix half needed updating.

## 5. Porting checklist, if the pattern above gets adopted at Robinsonklubben

1. **Confirm `robinsonklubben.dk` (the apex) has catch-all forwarding enabled** before relying on
   this — the same thing Djarnis confirmed directly for `formula-1.dk` before this was adopted
   there. Don't assume it from the SMTP identity alone; ask, or check Simply.com's control panel.
2. `sync-from-live.php`: change the `robinson_users` rewrite target from
   `CONCAT(id, '@sync.robinsonklubben.dk')` to `CONCAT(id, '+test@robinsonklubben.dk')` — the
   id-based local part is an intentional, orthogonal choice already made there for good reasons
   (that repo's own comment: "guaranteed unique, unlike a name-based rewrite") and doesn't need to
   change, only the domain half does. Also fix §2's `robinson_invites.email` gap in the same pass —
   they're the same category of problem (a real address landing where it can't be delivered to or
   shouldn't be copied at all) and touching this file once for both is cheaper than twice.
3. `test-seed.php:48`: change `E2E_EMAIL_DOMAIN` from `'test.robinsonklubben.dk'` to
   `'+test@robinsonklubben.dk'` and adjust the one call site
   (`"e2e_fam{$familyN}_member{$memberN}@" . E2E_EMAIL_DOMAIN` → drop the `@`, since the constant
   now carries it) so fixtures become `e2e_fam1_member2+test@robinsonklubben.dk`. Prefix
   (`e2e_`) stays at the front, same reasoning as §4.
4. **Once both land on the same domain, revisit the one guard that currently trusts domain
   alone**: `test-seed.php`'s `DELETE FROM robinson_invites WHERE email LIKE '%@' .
   E2E_EMAIL_DOMAIN` — after this change, a real synced invite could theoretically also match
   `%+test@robinsonklubben.dk` unless the query also requires the `e2e_` local-part prefix. Check
   for any other place that currently assumes "this domain suffix only ever means e2e fixture" once
   synced users share it too — formula-1.dk had exactly two such spots (both passkey-cleanup
   actions) and both needed the combined check.
5. Run whatever Robinsonklubben's equivalent of two consecutive `sync:live` runs + a DB spot-check
   is, to confirm the rewrite is idempotent before trusting it in daily use.
6. Update `docs/gotchas.md #4` once done — it currently only describes the "rewrite emails, reset
   passwords" goal in the abstract; worth naming the actual scheme once it's real, the way
   formula-1.dk's own gotcha #15 does.

## Reference (formula-1.dk side, for exact wording/diffs)

| File | What changed |
| --- | --- |
| `public/tools/sync-from-live.php` | rewrite target, idempotency strip of pre-existing `+tag` |
| `public/tools/test-seed.php` | ~35 fixture literals, `cleanup_passkeys`/`set_passkey_sign_count` guards |
| `docs/gotchas.md` | gotcha #15 (full rewrite), gotcha #14 (dedup note extended) |
| `docs/testing.md`, `docs/test-strategy.md`, `docs/commands.md` | fixture-address tables/examples |
| `epics/Test site domain migration/plan.md` | Phase 9b write-up — full decision rationale |
