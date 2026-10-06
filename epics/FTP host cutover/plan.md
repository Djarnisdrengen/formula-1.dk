# FTP host cutover: `linux350.unoeuro.com` → `ftp.simply.com`

**Status:** done in this repo 2026-10-06 (cert SAN covers `*.simply.com`; `deploy:test` and
`backup.js` green; docs updated). Remaining: the other machine's `.env`, and the two handoffs.
**Date:** 2026-10-06

## Why

Commit `22fb85f` switched deploy/backup/rollback to explicit FTPS (`secure: true`) with
certificate validation on. Using Simply.com's own hostname, `ftp.simply.com`, instead of the
per-server name `linux350.unoeuro.com` keeps the deploy working if Simply moves the account to
another server, and it is the hostname Simply documents.

## What is affected (this repo)

| Where | Holds the host? | Change |
| --- | --- | --- |
| `build-deploy/.env` (local, not in git, **on both desktop and laptop**) | yes, `FTP_HOST` | Djarnis edits it by hand. Claude can't read it (secret-file hook) |
| `build-deploy/deploy.js`, `backup.js`, `rollback.js` | no, they read `process.env.FTP_HOST` | none |
| `.github/workflows/*` | no FTP use | none |
| `build-deploy/.env.example`, `DEPLOYMENT.md` | placeholder only | set the example to `FTP_HOST=ftp.simply.com` |
| `docs/gotchas.md` | — | add one line: FTP host is `ftp.simply.com`, FTPS required |
| `epics/Test site domain migration/*` mentions of `linux350` | historical | leave as they are (they record history) |

FTP user, password and the roots (`FTP_ROOT_TEST=/test.formula-1.dk`, `FTP_ROOT_LIVE`) stay
the same. Only the host changes.

## Steps

1. **Check the certificate before switching** (no change yet). In a terminal:
   ```bash
   openssl s_client -connect ftp.simply.com:21 -starttls ftp -servername ftp.simply.com </dev/null 2>/dev/null \
     | openssl x509 -noout -subject -ext subjectAltName
   ```
   The SAN must cover `ftp.simply.com`. If it only covers `*.unoeuro.com`, **stop**: FTPS with
   validation would fail, and we keep `linux350.unoeuro.com`.
2. **Edit `build-deploy/.env`** on this machine: `FTP_HOST=ftp.simply.com`.
3. **Check on test:** `npm run deploy:test`. It must log in, upload, pass the schema check and
   the smoke tests. Also run `node build-deploy/backup.js` once. It downloads from **live**, but
   only reads, so it is a safe way to check the new host for the live root as well.
4. **Update the docs** (`.env.example`, `DEPLOYMENT.md` env block, `docs/gotchas.md`). Commit
   only when Djarnis asks.
5. **Edit the other machine's `build-deploy/.env`** (laptop/desktop). That file is not synced
   through git.
6. **Live:** nothing to do on its own. The next `deploy:live` uses the new host. It runs only when
   Djarnis says so (live-deploy gate).
7. **Hand off** to the sibling repos with the two copy/paste blocks below. Djarnis pastes each one
   into a Claude session opened in that repo.

## Rollback

Put `FTP_HOST=linux350.unoeuro.com` back in `build-deploy/.env`. Nothing else depends on the host.

## Risk

- Low. The only thing that can break is the TLS name match (step 1 catches it) or a login that is
  tied to the server name (step 3 catches it on test before live is touched).

---

## Handoff 1 — robinsonklubben.dk (copy/paste into a session in `~/github/robinsonklubben.dk`)

```text
Handoff from the formula-1.dk session (2026-10-06). Applies to THIS repo only (robinsonklubben.dk).

Task: change the FTP host used by deploy, backup and rollback from the per-server Simply.com name
(linuxNNN.unoeuro.com) to ftp.simply.com. Make a plan first and wait for my OK before changing anything.

Context from formula-1.dk, where this was done first:
- There, FTP_HOST lives in build-deploy/.env (not in git); deploy.js, backup.js and rollback.js only
  read process.env.FTP_HOST. Check how this repo does it. Also check GitHub Actions secrets and
  workflows for any FTP host, and any Rejsekrukken / ture.helvegpovlsen.dk deploy target.
- formula-1.dk uses explicit FTPS (basic-ftp `secure: true`, certificate validated). If this repo
  uses plain FTP, propose switching to FTPS as a separate, optional step.
- Before switching, check the certificate:
    openssl s_client -connect ftp.simply.com:21 -starttls ftp -servername ftp.simply.com </dev/null 2>/dev/null | openssl x509 -noout -subject -ext subjectAltName
  The SAN must cover ftp.simply.com, otherwise keep the old host.
- Only the host changes. User, password and remote roots stay the same.
- Verify with a test deploy first. A live deploy needs my explicit go-ahead.
- .env files are per machine (desktop and laptop). Remind me to update the other machine.
- Update .env.example and the deploy docs. Leave historical mentions of linuxNNN in epics/plans alone.
- Rollback: put the old host back in the .env.
```

## Handoff 2 — helvegpovlsen.dk (copy/paste into a session in `~/github/helvegpovlsen.dk`)

```text
Handoff from the formula-1.dk session (2026-10-06). Applies to THIS repo only (helvegpovlsen.dk).

Task: change the FTP host used to deploy this site from the per-server Simply.com name
(linuxNNN.unoeuro.com) to ftp.simply.com. Make a plan first and wait for my OK before changing anything.

Context from formula-1.dk, where this was done first:
- There, FTP_HOST lives in build-deploy/.env (not in git) and the deploy scripts only read
  process.env.FTP_HOST. Find where this repo keeps its FTP host (build-deploy/, .env, package.json
  scripts, GitHub Actions secrets/workflows).
- formula-1.dk uses explicit FTPS (basic-ftp `secure: true`, certificate validated). If this repo
  uses plain FTP, propose switching to FTPS as a separate, optional step.
- Before switching, check the certificate:
    openssl s_client -connect ftp.simply.com:21 -starttls ftp -servername ftp.simply.com </dev/null 2>/dev/null | openssl x509 -noout -subject -ext subjectAltName
  The SAN must cover ftp.simply.com, otherwise keep the old host.
- Only the host changes. User, password and remote root stay the same.
- This is a static site with no test environment. Verify with a dry run or a directory listing over
  the new host before a real upload, and only deploy with my explicit go-ahead.
- .env files are per machine (desktop and laptop). Remind me to update the other machine.
- Update any .env.example/docs. Rollback: put the old host back in the .env.
```
