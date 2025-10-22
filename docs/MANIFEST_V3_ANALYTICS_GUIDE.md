# Manifest V3 Compliant Analytics Implementation Guide

## Overview

This guide explains how to implement Google Analytics 4 (GA4) tracking in a Manifest V3 Chrome extension without violating the "no remote code" policy.

## The Problem

Manifest V3 prohibits:
- Loading remote JavaScript files (like GTM/GA scripts)
- Using `eval()` or executing remote code
- Creating script tags that load from external URLs

Traditional GA4 implementation uses:
```javascript
// ❌ VIOLATES Manifest V3
const script = document.createElement('script');
script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXXX';
document.head.appendChild(script);
```

## The Solution: Measurement Protocol API

Use GA4's **Measurement Protocol** to send events directly from your service worker to Google Analytics servers via HTTP requests.

### Architecture

```
┌─────────────────┐
│  Content Script │
│   or UI Pages   │
└────────┬────────┘
         │ chrome.runtime.sendMessage()
         │
         ▼
┌─────────────────┐
│ Service Worker  │
│  (background)   │
└────────┬────────┘
         │ fetch() with Measurement Protocol
         │
         ▼
┌─────────────────┐
│  GA4 Servers    │
│  (Google)       │
└─────────────────┘
```

## Implementation Steps

### Step 1: Get Your GA4 Credentials

1. Go to your GA4 property
2. Get your **Measurement ID** (e.g., `G-XXXXXXXXXX`)
3. Generate an **API Secret** from Admin → Data Streams → Choose your stream → Measurement Protocol API secrets

### Step 2: Create GA4 Service in Service Worker

Create a new file: `src/service_worker/ga4.ts`

```typescript
/**
 * GA4 Measurement Protocol Implementation
 * Compliant with Manifest V3 - No remote code execution
 */

interface GA4Event {
  name: string;
  params?: Record<string, any>;
}

interface GA4Config {
  measurementId: string;
  apiSecret: string;
  debug?: boolean;
}

class GA4Analytics {
  private config: GA4Config;
  private clientId: string;
  private sessionId: string;
  private endpoint: string;

  constructor(config: GA4Config) {
    this.config = config;
    this.clientId = this.getOrCreateClientId();
    this.sessionId = this.generateSessionId();
    this.endpoint = config.debug
      ? 'https://www.google-analytics.com/debug/mp/collect'
      : 'https://www.google-analytics.com/mp/collect';
  }

  /**
   * Get or create a persistent client ID for this extension installation
   */
  private async getOrCreateClientId(): Promise<string> {
    const stored = await chrome.storage.local.get(['ga4_client_id']);
    
    if (stored.ga4_client_id) {
      return stored.ga4_client_id;
    }

    // Generate a UUID v4
    const clientId = crypto.randomUUID();
    await chrome.storage.local.set({ ga4_client_id: clientId });
    return clientId;
  }

  /**
   * Generate a new session ID (changes per session)
   */
  private generateSessionId(): string {
    return Date.now().toString();
  }

  /**
   * Send an event to GA4
   */
  async trackEvent(event: GA4Event): Promise<boolean> {
    try {
      const clientId = await this.clientId;
      const payload = {
        client_id: clientId,
        events: [
          {
            name: event.name,
            params: {
              session_id: this.sessionId,
              engagement_time_msec: 100,
              ...event.params,
            },
          },
        ],
      };

      const url = `${this.endpoint}?measurement_id=${this.config.measurementId}&api_secret=${this.config.apiSecret}`;

      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (this.config.debug) {
        const result = await response.json();
        console.log('[GA4 Debug]', result);
      }

      return response.ok;
    } catch (error) {
      console.error('[GA4] Failed to send event:', error);
      return false;
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(params: {
    page_title: string;
    page_location: string;
    page_path?: string;
  }): Promise<boolean> {
    return this.trackEvent({
      name: 'page_view',
      params,
    });
  }

  /**
   * Track user engagement
   */
  async trackEngagement(params: Record<string, any>): Promise<boolean> {
    return this.trackEvent({
      name: 'user_engagement',
      params,
    });
  }
}

// Singleton instance
let ga4Instance: GA4Analytics | null = null;

/**
 * Initialize GA4 analytics
 */
export function initGA4(config: GA4Config) {
  ga4Instance = new GA4Analytics(config);
}

/**
 * Get GA4 instance
 */
export function getGA4(): GA4Analytics {
  if (!ga4Instance) {
    throw new Error('GA4 not initialized. Call initGA4() first.');
  }
  return ga4Instance;
}

/**
 * Track an event
 */
export async function trackEvent(
  eventName: string,
  params?: Record<string, any>
): Promise<boolean> {
  const ga4 = getGA4();
  return ga4.trackEvent({ name: eventName, params });
}
```

### Step 3: Initialize in Service Worker

Update `src/service_worker/background.ts`:

```typescript
import { initGA4, trackEvent } from './ga4';

// Initialize GA4 on extension startup
chrome.runtime.onInstalled.addListener(() => {
  initGA4({
    measurementId: 'G-XXXXXXXXXX', // Your GA4 Measurement ID
    apiSecret: 'your_api_secret_here', // Your API Secret
    debug: process.env.NODE_ENV === 'development',
  });

  // Track installation
  trackEvent('extension_installed', {
    version: chrome.runtime.getManifest().version,
  });
});

// Handle analytics messages from content scripts and UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'trackAnalytics' && message.data) {
    const { event, eventCategory, eventAction, eventLabel, eventValue, customData } = message.data;

    // Convert your existing analytics format to GA4 event
    const eventName = eventAction || event || 'custom_event';
    const params = {
      event_category: eventCategory,
      event_label: eventLabel,
      value: eventValue,
      ...customData,
    };

    trackEvent(eventName, params)
      .then((success) => {
        sendResponse({ success });
      })
      .catch((error) => {
        console.error('[Analytics] Error:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }
});
```

### Step 4: Update Your Analytics Class

Update `src/lib/analytics.ts` to work with the new system:

```typescript
/**
 * Analytics class - Client side
 * Sends events to service worker which forwards to GA4
 */
class Analytics {
  private isEnabled: boolean = true;
  private debugMode: boolean = false;

  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Send tracking event to background script
   */
  private async sendToBackground(data: any): Promise<boolean> {
    if (!this.isEnabled) {
      if (this.debugMode) {
        console.debug('[Analytics] Tracking disabled, skipping event:', data);
      }
      return false;
    }

    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const response = await chrome.runtime.sendMessage({
          action: 'trackAnalytics',
          data: data,
        });
        
        if (this.debugMode) {
          console.log('[Analytics] ✅ Event tracked:', data);
        }
        
        return response?.success ?? false;
      }
    } catch (error) {
      console.debug('[Analytics] Error sending to background:', error);
      return false;
    }
    
    return false;
  }

  /**
   * Track a custom event
   */
  async trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    customData?: Record<string, any>
  ): Promise<boolean> {
    return this.sendToBackground({
      event: 'custom_event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      timestamp: Date.now(),
      customData: customData,
    });
  }

  // ... rest of your existing tracking methods
}

export const analytics = new Analytics();
export default analytics;
```

### Step 5: Environment Configuration

Update `src/lib/environment.ts` to include GA4 credentials:

```typescript
interface EnvironmentConfig {
  debug: boolean;
  apiEndpoint?: string;
  ga4: {
    measurementId: string;
    apiSecret: string;
  };
}

const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    debug: true,
    apiEndpoint: 'http://localhost:3001',
    ga4: {
      measurementId: 'G-XXXXXXXXXX', // Dev Measurement ID
      apiSecret: 'dev_api_secret',
    },
  },
  production: {
    debug: false,
    apiEndpoint: 'https://main.djfc0uq2bj5xw.amplifyapp.com',
    ga4: {
      measurementId: 'G-YYYYYYYYYY', // Prod Measurement ID
      apiSecret: 'prod_api_secret',
    },
  },
};
```

## Alternative Approach: Use Your Own Analytics Proxy

If you don't want to expose your GA4 API secret in the extension code, you can proxy through your own server:

### Architecture with Proxy

```
Extension → Your Server → GA4
```

### Implementation

```typescript
// In service worker
async function trackEventViaProxy(event: any): Promise<boolean> {
  try {
    const response = await fetch('https://your-api.com/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Analytics proxy error:', error);
    return false;
  }
}
```

On your server:
```javascript
// Node.js example
app.post('/analytics', async (req, res) => {
  const event = req.body;
  
  // Forward to GA4 Measurement Protocol
  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_ID}&api_secret=${GA4_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: event.clientId,
        events: [event],
      }),
    }
  );
  
  res.json({ success: true });
});
```

## Key Benefits

✅ **Fully Manifest V3 Compliant** - No remote code execution
✅ **Full Control** - You control what data is sent
✅ **Privacy Friendly** - No third-party scripts in your pages
✅ **Reliable** - Direct API calls, no script blocking issues
✅ **Debuggable** - Easy to test and debug in service worker

## Testing

### Debug Mode

Enable debug mode to see validation messages:

```typescript
initGA4({
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'your_secret',
  debug: true, // Use debug endpoint
});
```

### Chrome Extension Debug

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "service worker" link under your extension
4. Check console for GA4 debug messages

### GA4 Realtime Report

1. Go to GA4 → Reports → Realtime
2. Trigger events in your extension
3. See events appear in real-time (usually within 10-30 seconds)

## Common Event Names for Extensions

```typescript
// Installation & Updates
trackEvent('extension_installed', { version: '1.0.0' });
trackEvent('extension_updated', { from: '1.0.0', to: '1.1.0' });

// Feature Usage
trackEvent('text_selected', { length: 42, url: 'example.com' });
trackEvent('translation_requested', { from: 'en', to: 'es' });
trackEvent('note_saved', { has_tags: true, has_comment: true });

// Navigation
trackEvent('popup_opened');
trackEvent('dashboard_viewed', { section: 'learn' });
trackEvent('settings_changed', { setting: 'theme', value: 'dark' });

// Engagement
trackEvent('export_completed', { format: 'anki', items: 10 });
trackEvent('search_performed', { query_length: 5, results: 12 });
```

## Privacy Considerations

1. **User Consent** - Always get user permission before tracking
2. **Opt-out** - Provide a way to disable analytics
3. **No PII** - Don't send personally identifiable information
4. **Anonymous** - Use generated client IDs, not user emails/names
5. **Transparent** - Document what you track in your privacy policy

## Resources

- [GA4 Measurement Protocol Documentation](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/devguide/)
