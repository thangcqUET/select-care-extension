/**
 * Google Tag Manager Analytics Service
 * Centralized tracking for user interactions across the extension
 */

// Event Categories
export enum EventCategory {
  SELECTION = 'selection',
  POPUP = 'popup',
  FORM = 'form',
  NOTE = 'note',
  SIDEBAR = 'sidebar',
  EXPORT = 'export',
  LEARN = 'learn',
}

// Event Actions
export enum EventAction {
  // Selection events
  TEXT_SELECTED = 'text_selected',
  
  // Popup events
  SAVE_TO_LEARN_CLICKED = 'save_to_learn_clicked',
  SAVE_NOTE_CLICKED = 'save_note_clicked',
  
  // Form events
  TRANSLATE_REQUESTED = 'translate_requested',
  DEFINITION_REQUESTED = 'definition_requested',
  MARK_TO_SAVE = 'mark_to_save',
  SAVE_TO_LEARN_SUBMIT = 'save_to_learn_submit',
  
  // Note events
  ADD_TAG = 'add_tag',
  ADD_COMMENT = 'add_comment',
  SAVE_NOTE = 'save_note',
  
  // Sidebar events
  SIDEBAR_OPENED = 'sidebar_opened',
  FILTER_APPLIED = 'filter_applied',
  SEARCH_PERFORMED = 'search_performed',
  EDIT_NOTE_ITEM = 'edit_note_item',
  EDIT_LEARN_ITEM = 'edit_learn_item',
  DELETE_ITEM = 'delete_item',
  
  // Export events
  EXPORT_NOTE = 'export_note',
  EXPORT_LEARN = 'export_learn',
  EXPORT_APP_SELECTED = 'export_app_selected',
}

// GTM Event interface
export interface GTMEvent {
  event: string;
  eventCategory: EventCategory;
  eventAction: EventAction;
  eventLabel?: string;
  eventValue?: number;
  userId?: string;
  timestamp?: number;
  customData?: Record<string, any>;
}

// DataLayer type
declare global {
  interface Window {
    dataLayer?: Array<any>;
  }
}

/**
 * Analytics class for tracking events with Google Tag Manager
 */
class Analytics {
  private isEnabled: boolean = true;
  private debugMode: boolean = false;

  constructor() {
    this.initializeDataLayer();
  }
  
  /**
   * Set debug mode (automatically enabled in development)
   */
  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }

  /**
   * Initialize the dataLayer array if it doesn't exist
   */
  private initializeDataLayer() {
    if (typeof window !== 'undefined' && !window.dataLayer) {
      window.dataLayer = [];
    }
  }

  /**
   * Enable or disable analytics tracking
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Check if analytics is enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Push event to GTM dataLayer
   */
  private pushToDataLayer(data: any) {
    if (!this.isEnabled) {
      if (this.debugMode) {
        console.debug('[Analytics] Tracking disabled, skipping event:', data);
      }
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push(data);
        if (this.debugMode) {
          console.log('[Analytics] ✅ Event tracked:', data);
        }
      } else {
        // In service worker or content script context, send to background
        this.sendToBackground(data);
      }
    } catch (error) {
      console.error('[Analytics] ❌ Error pushing to dataLayer:', error);
    }
  }

  /**
   * Send tracking event to background script for processing
   */
  private sendToBackground(data: any) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'trackAnalytics',
          data: data
        }).catch(error => {
          console.debug('[Analytics] Failed to send to background:', error);
        });
      }
    } catch (error) {
      console.debug('[Analytics] Error sending to background:', error);
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(
    category: EventCategory,
    action: EventAction,
    label?: string,
    value?: number,
    customData?: Record<string, any>
  ) {
    const event: GTMEvent = {
      event: 'custom_event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      timestamp: Date.now(),
      customData: customData,
    };

    this.pushToDataLayer(event);
  }

  /**
   * Track text selection event
   */
  trackTextSelection(textLength: number, sourceUrl?: string) {
    this.trackEvent(
      EventCategory.SELECTION,
      EventAction.TEXT_SELECTED,
      sourceUrl,
      textLength,
      { textLength, sourceUrl }
    );
  }

  /**
   * Track popup button clicks
   */
  trackPopupClick(buttonType: 'learn' | 'note') {
    const action = buttonType === 'learn' 
      ? EventAction.SAVE_TO_LEARN_CLICKED 
      : EventAction.SAVE_NOTE_CLICKED;
    
    this.trackEvent(
      EventCategory.POPUP,
      action,
      buttonType
    );
  }

  /**
   * Track form actions
   */
  trackFormAction(
    action: EventAction.TRANSLATE_REQUESTED | EventAction.DEFINITION_REQUESTED | EventAction.MARK_TO_SAVE | EventAction.SAVE_TO_LEARN_SUBMIT,
    details?: Record<string, any>
  ) {
    this.trackEvent(
      EventCategory.FORM,
      action,
      undefined,
      undefined,
      details
    );
  }

  /**
   * Track note actions
   */
  trackNoteAction(
    action: EventAction.ADD_TAG | EventAction.ADD_COMMENT | EventAction.SAVE_NOTE,
    details?: Record<string, any>
  ) {
    this.trackEvent(
      EventCategory.NOTE,
      action,
      undefined,
      undefined,
      details
    );
  }

  /**
   * Track sidebar actions
   */
  trackSidebarAction(
    action: EventAction,
    details?: Record<string, any>
  ) {
    this.trackEvent(
      EventCategory.SIDEBAR,
      action,
      undefined,
      undefined,
      details
    );
  }

  /**
   * Track export actions
   */
  trackExportAction(
    action: EventAction.EXPORT_NOTE | EventAction.EXPORT_LEARN | EventAction.EXPORT_APP_SELECTED,
    exportType?: string,
    details?: Record<string, any>
  ) {
    this.trackEvent(
      EventCategory.EXPORT,
      action,
      exportType,
      undefined,
      details
    );
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, pagePath?: string) {
    this.pushToDataLayer({
      event: 'page_view',
      pageName,
      pagePath: pagePath || window.location.pathname,
      timestamp: Date.now(),
    });
  }

  /**
   * Track timing event (e.g., how long an operation takes)
   */
  trackTiming(
    category: string,
    variable: string,
    time: number,
    label?: string
  ) {
    this.pushToDataLayer({
      event: 'timing_complete',
      timingCategory: category,
      timingVariable: variable,
      timingValue: time,
      timingLabel: label,
      timestamp: Date.now(),
    });
  }

  /**
   * Track error events
   */
  trackError(
    errorDescription: string,
    errorCategory?: string,
    fatal: boolean = false
  ) {
    this.pushToDataLayer({
      event: 'error',
      errorDescription,
      errorCategory: errorCategory || 'general',
      errorFatal: fatal,
      timestamp: Date.now(),
    });
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string) {
    this.pushToDataLayer({
      event: 'set_user_id',
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear user ID
   */
  clearUserId() {
    this.pushToDataLayer({
      event: 'clear_user_id',
      userId: null,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Helper function to inject GTM script
export function injectGTMScript(gtmId: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  // Inject GTM script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  console.log('[Analytics] GTM script injected:', gtmId);
}

export default analytics;
