/**
 * Google Analytics 4 (GA4) Service
 * Centralized tracking for user interactions across the extension
 * Uses GA4 Measurement Protocol via service worker (Manifest V3 compliant)
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

// Analytics Event interface
export interface AnalyticsEvent {
  event: string;
  eventCategory: EventCategory;
  eventAction: EventAction;
  eventLabel?: string;
  eventValue?: number;
  userId?: string;
  timestamp?: number;
  customData?: Record<string, any>;
}

/**
 * Analytics class for tracking events with GA4
 * All events are sent to the service worker which forwards them to GA4
 */
class Analytics {
  private isEnabled: boolean = true;
  private debugMode: boolean = false;
  
  /**
   * Set debug mode (automatically enabled in development)
   */
  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
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
   * Send tracking event to background script for GA4 processing
   */
  private sendToBackground(data: any) {
    if (!this.isEnabled) {
      if (this.debugMode) {
        console.debug('[Analytics] Tracking disabled, skipping event:', data);
      }
      return;
    }

    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'trackAnalytics',
          data: data
        }).catch(error => {
          console.debug('[Analytics] Failed to send to background:', error);
        });
        
        if (this.debugMode) {
          console.log('[Analytics] ✅ Event sent to background:', data);
        }
      }
    } catch (error) {
      console.error('[Analytics] ❌ Error sending to background:', error);
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
    const event: AnalyticsEvent = {
      event: 'custom_event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      timestamp: Date.now(),
      customData: customData,
    };

    this.sendToBackground(event);
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
    this.sendToBackground({
      event: 'page_view',
      pageName,
      pagePath: pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/'),
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
    this.sendToBackground({
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
    this.sendToBackground({
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
    this.sendToBackground({
      event: 'set_user_id',
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear user ID
   */
  clearUserId() {
    this.sendToBackground({
      event: 'clear_user_id',
      userId: null,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

export default analytics;
