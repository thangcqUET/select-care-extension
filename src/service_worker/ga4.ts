/**
 * GA4 Analytics - Server-Side Proxy Implementation
 * Compliant with Manifest V3 - No API secrets in extension code
 * 
 * This implementation forwards analytics to our secure Next.js API,
 * which then proxies events to GA4 with API secrets kept safe on the server.
 */

import { getConfig } from '../lib/environment';

interface GA4Event {
  name: string;
  params?: Record<string, any>;
}

class GA4Analytics {
  private clientIdPromise: Promise<string>;
  private sessionId: string;
  private apiEndpoint: string;
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.clientIdPromise = this.getOrCreateClientId();
    this.sessionId = this.generateSessionId();
    this.apiEndpoint = getConfig().apiEndpoint + '/api/analytics/track';
    this.debug = debug;
  }

  /**
   * Get or create a persistent client ID for this extension installation
   */
  private async getOrCreateClientId(): Promise<string> {
    try {
      const stored = await chrome.storage.local.get(['ga4_client_id']);
      
      if (stored.ga4_client_id) {
        return stored.ga4_client_id;
      }

      const clientId = crypto.randomUUID();
      await chrome.storage.local.set({ ga4_client_id: clientId });
      return clientId;
    } catch (error) {
      console.error('[GA4] Failed to get/create client ID:', error);
      return crypto.randomUUID();
    }
  }

  /**
   * Generate a new session ID (changes per session)
   */
  private generateSessionId(): string {
    return Date.now().toString();
  }

  /**
   * Get authentication token for API requests
   * Note: Currently disabled since sign-in is turned off
   */
  // private async getAuthToken(): Promise<string | null> {
  //   try {
  //     const result = await chrome.storage.local.get(['selectcare_token']);
  //     return result.selectcare_token || null;
  //   } catch (error) {
  //     console.error('[GA4] Failed to get auth token:', error);
  //     return null;
  //   }
  // }

  /**
   * Send an event to our secure server-side API
   * Note: Authentication temporarily disabled since sign-in is turned off
   */
  async trackEvent(event: GA4Event): Promise<boolean> {
    try {
      const clientId = await this.clientIdPromise;

      const payload = {
        event: event.name,
        params: {
          client_id: clientId,
          session_id: this.sessionId,
          engagement_time_msec: 100,
          timestamp_micros: Date.now() * 1000,
          ...event.params,
        },
      };
      console.log('[GA4] Tracking event:', payload);
      console.log('[GA4] apiEndpoint:', this.apiEndpoint);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (this.debug) {
        const result = await response.json();
        console.log('[GA4 Debug] Response:', result);
        console.log('[GA4 Debug] Event:', event);
      }

      if (!response.ok) {
        console.error('[GA4] API responded with error:', response.status);
        return false;
      }

      return true;
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

  /**
   * Track custom event with category, action, label pattern
   */
  async trackCustomEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    customData?: Record<string, any>
  ): Promise<boolean> {
    return this.trackEvent({
      name: action,
      params: {
        event_category: category,
        event_label: label,
        value: value,
        ...customData,
      },
    });
  }
}

// Singleton instance
let ga4Instance: GA4Analytics | null = null;

/**
 * Initialize GA4 analytics
 */
export function initGA4(debug: boolean = false): void {
  ga4Instance = new GA4Analytics(debug);
  console.log('[GA4] Initialized (using server-side proxy)');
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
 * Track an event (convenience function)
 */
export async function trackEvent(
  eventName: string,
  params?: Record<string, any>
): Promise<boolean> {
  try {
    const ga4 = getGA4();
    return await ga4.trackEvent({ name: eventName, params });
  } catch (error) {
    console.error('[GA4] Error tracking event:', error);
    return false;
  }
}

/**
 * Track a page view (convenience function)
 */
export async function trackPageView(
  pageTitle: string,
  pageLocation: string,
  pagePath?: string
): Promise<boolean> {
  try {
    const ga4 = getGA4();
    return await ga4.trackPageView({
      page_title: pageTitle,
      page_location: pageLocation,
      page_path: pagePath,
    });
  } catch (error) {
    console.error('[GA4] Error tracking page view:', error);
    return false;
  }
}

/**
 * Track custom event with legacy format (convenience function)
 */
export async function trackCustomEvent(
  category: string,
  action: string,
  label?: string,
  value?: number,
  customData?: Record<string, any>
): Promise<boolean> {
  try {
    const ga4 = getGA4();
    return await ga4.trackCustomEvent(category, action, label, value, customData);
  } catch (error) {
    console.error('[GA4] Error tracking custom event:', error);
    return false;
  }
}
