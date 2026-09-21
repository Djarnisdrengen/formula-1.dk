# Personal domain conventions

**Portable note** — this documents a personal convention that applies across Djarnis's projects,
not something specific to F1Betting/Paddock Picks. It lives in this repo for now (added
2026-09-21) but is written to stand on its own: nothing below assumes this repo's `CLAUDE.md`,
memory, or any other file is in context. Move it to a personal ops/notes location whenever
convenient — copying this file elsewhere shouldn't require rewriting it.

## Test-environment subdomain pattern

For every project that has a separate test/live split, the test environment's hostname is:

```
<project>.helvegpovlsen.dk
```

— a subdomain of the personal domain `helvegpovlsen.dk`, one label per project. Live stays on
that project's own production domain (e.g. `formula-1.dk`), untouched by this convention.

**Example:** F1Betting/Paddock Picks uses `formula-1.helvegpovlsen.dk` for test and `formula-1.dk`
for live.

**Rationale:**
- Keeps each project's test DNS, TLS, and mail-authentication records (SPF/DKIM/DMARC) cleanly
  separated per project, under a domain Djarnis owns outright — instead of reusing a domain that
  also serves another purpose.
- Note that SPF/DKIM/DMARC TXT records for a subdomain like this often need to live on the
  registrable **parent** domain (`helvegpovlsen.dk`), not the subdomain itself — check both when
  diagnosing mail-auth issues on a `<project>.helvegpovlsen.dk` test site.

**Origin:** established 2026-09 during F1Betting's test-site migration off `hpovlsen.dk`. If that
project's repo is still around, its full history and rationale is in
`epics/Test site domain migration/plan.md`.

## `hpovlsen.dk` is not decommissioned

`hpovlsen.dk` was F1Betting's old test-site hostname, retired in the migration above as a
*hosting* domain. Retiring it that way does **not** decommission the domain itself —
`hpovlsen.dk` keeps functioning as Djarnis's personal catch-all email domain: it has catch-all
alias forwarding enabled, and test tooling deliberately keeps reusing it (synced live-user
emails, E2E fixture addresses) so that mail sent during testing lands in a real, checkable inbox
instead of failing to deliver or leaking to an actual third party.

Only `hpovlsen.dk`'s file-hosting role and its old FTP directory were retired — its DNS/MX/email
setup stays exactly as it was.

If a future project considers reusing `hpovlsen.dk` for anything beyond this established
test-email pattern, treat that as a deliberate decision to make at the time, not a default to
assume.
