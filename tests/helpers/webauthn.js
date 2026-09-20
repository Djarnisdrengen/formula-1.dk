'use strict';

// Stubs conditional-mediation feature-detection off by default so a background
// login_options/get() call never races a test's own explicit login steps — Chromium's CDP
// virtual authenticator ignores the spec's real-gesture requirement and auto-resolves any
// pending conditional get() the instant a matching resident credential exists (see epic.md).
// Call before any page.goto().
async function disableConditionalMediation(page) {
    await page.addInitScript(() => {
        if (window.PublicKeyCredential && window.PublicKeyCredential.isConditionalMediationAvailable) {
            window.PublicKeyCredential.isConditionalMediationAvailable = () => Promise.resolve(false);
        }
    });
}

module.exports = { disableConditionalMediation };
