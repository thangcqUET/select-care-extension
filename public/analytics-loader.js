// analytics-loader.js
// Minimal loader that intercepts window.dataLayer pushes and forwards them
// to the extension background for processing. This avoids loading remote GTM
// scripts and keeps everything inside the extension CSP.

(async function () {
  try {
    if (typeof window === 'undefined') return;

    // Check storage to see if analytics forwarding is disabled
    let analyticsDisabled = false;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && chrome.storage.local.get) {
        const stored = await chrome.storage.local.get(['analytics_disabled']);
        analyticsDisabled = !!stored?.analytics_disabled;
      }
    } catch (e) {
      // ignore storage errors and default to forwarding enabled
    }

    window.dataLayer = window.dataLayer || [];

    // Capture existing items
    const existing = Array.prototype.slice.call(window.dataLayer || []);

    // Wrap push to intercept future pushes
    const originalPush = window.dataLayer.push.bind(window.dataLayer);

    window.dataLayer.push = function () {
      try {
        const args = Array.prototype.slice.call(arguments || []);
        const payload = args[0];
        if (!analyticsDisabled && payload && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          // Fire-and-forget to background
          try {
            chrome.runtime.sendMessage({ action: 'trackAnalytics', data: payload });
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        // ignore
      }

      // call original push
      return originalPush.apply(null, arguments);
    };

    // Send existing items to background as well (if forwarding enabled)
    try {
      if (!analyticsDisabled) {
        existing.forEach(item => {
          if (item && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            try {
              chrome.runtime.sendMessage({ action: 'trackAnalytics', data: item });
            } catch (e) {
              // ignore
            }
          }
        });
      }
    } catch (e) {
      // ignore
    }
  } catch (error) {
    // prevent loader from breaking the page
    console.error('[analytics-loader] initialization error', error);
  }
})();
