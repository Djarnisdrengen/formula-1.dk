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
