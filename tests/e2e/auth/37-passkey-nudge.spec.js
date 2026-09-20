'use strict';
const { test, expect } = require('@playwright/test');
const crypto = require('crypto');
const seed = require('../../helpers/seed');
const { disableConditionalMediation } = require('../../helpers/webauthn');

// One-time post-login enrollment nudge (Passkey autofire & the enrollment nudge epic,
// Phase 2). Branch-1 scope only: password-only login, zero active second factors — see
// epic.md's resolved Scope decision. NOT part of smoke.

// ── TOTP generator (same as 35-passkey.spec.js) — used only by NDG-04 ──
function base32Decode(s) {
    s = s.replace(/[^A-Za-z2-7]/g, '').toUpperCase();
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0, val = 0;
    const out = [];
    for (const ch of s) {
        val = (val << 5) | alpha.indexOf(ch);
        bits += 5;
        if (bits >= 8) { out.push((val >> (bits - 8)) & 0xff); bits -= 8; }
    }
    return Buffer.from(out);
}
function totp(secret, t = Math.floor(Date.now() / 1000)) {
    const key = base32Decode(secret);
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(Math.floor(t / 30)));
    const h = crypto.createHmac('sha1', key).update(buf).digest();
    const off = h[h.length - 1] & 0x0f;
    const bin = ((h[off] & 0x7f) << 24) | ((h[off + 1] & 0xff) << 16) | ((h[off + 2] & 0xff) << 8) | (h[off + 3] & 0xff);
    return String(bin % 1000000).padStart(6, '0');
}

async function login(page, email, password) {
    await page.goto('/login.php');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
}

// Attach a virtual authenticator to the page BEFORE any navigator.credentials call
// (mirrors 35-passkey.spec.js — see there for option rationale).
async function addVirtualAuthenticator(page) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('WebAuthn.enable');
    await cdp.send('WebAuthn.addVirtualAuthenticator', {
        options: {
            protocol: 'ctap2',
            transport: 'internal',
            hasResidentKey: true,
            hasUserVerification: true,
            isUserVerified: true,
            automaticPresenceSimulation: true,
        },
    });
}

async function registerPasskey(page) {
    await page.goto('/profile.php?tab=tab-security');
    await page.click('[data-testid="passkey-add"]');
    await expect(page.locator('[data-testid="passkey-row"]').first()).toBeVisible();
}

async function dismissRecoveryCodes(page) {
    const panel = page.locator('[data-testid="recovery-codes"]');
    if (await panel.count()) {
        await page.click('[data-testid="recovery-dismiss-btn"]');
        await expect(panel).toHaveCount(0);
    }
}

async function submitMfaCode(page, method, code) {
    const wrapper = page.locator(`[data-testid="mfa-form-${method}"]`);
    await wrapper.locator('[data-testid="mfa-otp-box"]').first().fill(code);
    await wrapper.locator('form').first().locator('button[type="submit"]').click();
}

test.describe('Passkey enrollment nudge', { tag: '@auth' }, () => {
    test.describe.configure({ mode: 'serial', timeout: 25000 });
    test.use({ storageState: { cookies: [], origins: [] } });

    let user;

    // Fresh user per test: no factors, no passkey rows. disableConditionalMediation() keeps
    // login.php's background conditional get() (fired unconditionally by passkey.js on every
    // page load) from interfering — same rationale as 35/36 (see tests/helpers/webauthn.js).
    test.beforeEach(async ({ page }) => {
        user = await seed.authUser();
        await disableConditionalMediation(page);
    });
    test.afterAll(async () => { await seed.cleanup.authUser(); });

    test('password-only login with zero passkeys shows the nudge once (NDG-01)', async ({ page }) => {
        await login(page, user.email, user.password);
        await page.waitForURL(/index\.php/);
        await expect(page.locator('[data-testid="passkey-nudge"]')).toBeVisible();

        await page.reload();
        await expect(page.locator('[data-testid="passkey-nudge"]')).toHaveCount(0); // single-read
    });

    test('dismissing the nudge removes it immediately (NDG-02)', async ({ page }) => {
        await login(page, user.email, user.password);
        await page.waitForURL(/index\.php/);
        const panel = page.locator('[data-testid="passkey-nudge"]');
        await expect(panel).toBeVisible();

        await page.click('[data-passkey-nudge-dismiss]');
        await expect(panel).toHaveCount(0); // no reload — pure client-side removal
    });

    test('a member with a passkey never sees the nudge, via the second-factor challenge (NDG-03)', async ({ page }) => {
        await addVirtualAuthenticator(page);
        await login(page, user.email, user.password);
        await page.waitForURL(/index\.php/);
        await registerPasskey(page);
        await dismissRecoveryCodes(page);
        await page.goto('/logout.php');

        // userHasActiveFactor() is now true (passkeyActive()) — this routes through the
        // MFA-pending/challenge branch, not branch 1, so the flag is never written.
        await login(page, user.email, user.password);
        await page.waitForURL(/mfa_challenge\.php/);
        await page.click('[data-testid="mfa-passkey-btn"]');
        await page.waitForURL(/index\.php/);
        await expect(page.locator('[data-testid="passkey-nudge"]')).toHaveCount(0);
    });

    test('a member who logs in via the passwordless button never sees the nudge (NDG-05)', async ({ page }) => {
        await addVirtualAuthenticator(page);
        await login(page, user.email, user.password);
        await page.waitForURL(/index\.php/);
        await registerPasskey(page);
        await dismissRecoveryCodes(page);
        await page.goto('/logout.php');

        // Different code path from NDG-03: webauthn.php's login_verify -> passkeyPromoteSession(),
        // which never writes $_SESSION['passkey_nudge'] either — no password typed at all.
        await page.goto('/login.php');
        const btn = page.locator('[data-testid="passkey-login"]');
        await expect(btn).toBeVisible();
        await btn.click();
        await page.waitForURL(/index\.php/);
        await expect(page.locator('[data-testid="passkey-nudge"]')).toHaveCount(0);
    });

    test('a 2FA member without a passkey does not see the nudge (NDG-04)', async ({ page }) => {
        await login(page, user.email, user.password);
        await page.waitForURL(/index\.php/);

        // Enroll TOTP only — no passkey. Locks in the epic's branch-2-out-of-scope decision
        // as a regression guard, not just documentation.
        await page.goto('/profile.php?tab=tab-security');
        await page.click('[data-testid="totp-setup-btn"]');
        await expect(page.locator('[data-testid="totp-enroll"]')).toBeVisible();
        const secret = (await page.locator('[data-testid="totp-secret"]').innerText()).replace(/\s/g, '');
        await page.fill('[data-testid="totp-confirm-input"]', totp(secret));
        await page.click('[data-testid="totp-confirm-btn"]');
        await expect(page.locator('[data-testid="totp-status"]')).toContainText(/Active|Aktiv/);
        await page.goto('/logout.php');

        await login(page, user.email, user.password);
        await page.waitForURL(/mfa_challenge\.php/);
        await submitMfaCode(page, 'totp', totp(secret));
        await page.waitForURL(/index\.php/);
        await expect(page.locator('[data-testid="passkey-nudge"]')).toHaveCount(0);
    });
});
