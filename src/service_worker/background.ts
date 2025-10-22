import { selectionDB } from "./database";
import { detectLanguage } from './api/detectApi';
import { translateDriver } from './api/translation';
import { fetchDictionary as backgroundFetchDictionary } from './api/dictionary';
import { initGA4, trackEvent, trackCustomEvent } from './ga4';
import { isDebugMode, logEnvironmentInfo } from '../lib/environment';

// Background service worker for Chrome extension
console.log('Select Care Extension background script loaded');

// Log environment information
logEnvironmentInfo();

// Initialize GA4 Analytics (using secure server-side proxy)
// No API secrets in extension - they're kept safe on the server
try {
  initGA4(isDebugMode());
  console.log('[GA4] Analytics initialized');
} catch (error) {
  console.error('[GA4] Failed to initialize analytics:', error);
}

// Function to broadcast data updates to all tabs/contexts
function broadcastDataUpdate() {
  console.log('Broadcasting data update to all contexts...');
  chrome.runtime.sendMessage({ action: 'dataUpdated' }).catch(() => {
    // Ignore errors if no listeners are available
  });
}

// Authentication token management
class TokenManager {
  private static readonly TOKEN_KEY = 'selectcare_token';
  private static readonly USER_EMAIL_KEY = 'selectcare_user_email';
  private static readonly AUTH_STATE_KEY = 'auth_state';
  
  static async setToken(token: string, userEmail: string): Promise<void> {
    await chrome.storage.local.set({ 
      [this.TOKEN_KEY]: token,
      [this.USER_EMAIL_KEY]: userEmail
    });
    console.log('Authentication token stored');
  }
  
  static async getToken(): Promise<string | null> {
    const result = await chrome.storage.local.get([this.TOKEN_KEY]);
    return result[this.TOKEN_KEY] || null;
  }
  
  static async removeToken(): Promise<void> {
    await chrome.storage.local.remove([this.TOKEN_KEY, this.USER_EMAIL_KEY, this.AUTH_STATE_KEY]);
    console.log('Authentication token removed');
  }

  static async setAuthState(state: string): Promise<void> {
    await chrome.storage.local.set({ [this.AUTH_STATE_KEY]: state });
  }

  static async getAuthState(): Promise<string | null> {
    const result = await chrome.storage.local.get([this.AUTH_STATE_KEY]);
    return result[this.AUTH_STATE_KEY] || null;
  }
}

// Listen for messages from web app
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('Received external message:', message, 'from:', sender.origin);
  
  if (message.action === 'authenticate') {
    handleAuthentication(message, sender, sendResponse);
    return true; // Keep the message channel open for async response
  }
});

async function handleAuthentication(message: any, sender: chrome.runtime.MessageSender, sendResponse: Function) {
  try {
    // If it's an external message, verify the sender is our web app
    if (sender.origin) {
      const allowedOrigins = ['http://localhost:3001', 'https://main.djfc0uq2bj5xw.amplifyapp.com'];
      if (!allowedOrigins.includes(sender.origin)) {
        console.error('Authentication request from unauthorized origin:', sender.origin);
        sendResponse({ success: false, error: 'Unauthorized origin' });
        return;
      }
    }

    // Verify the state parameter
    const storedState = await TokenManager.getAuthState();
    if (!storedState || storedState !== message.state) {
      console.error('Invalid or missing state parameter');
      sendResponse({ success: false, error: 'Invalid state parameter' });
      return;
    }

    // Store the authentication token and user info
    await TokenManager.setToken(message.token, message.userEmail);
    
    // Clean up the state
    await chrome.storage.local.remove(['auth_state']);
    
    console.log('Authentication successful for user:', message.userEmail);
    sendResponse({ success: true });
    
    // Broadcast authentication update to all extension contexts
    chrome.runtime.sendMessage({ action: 'authenticationUpdated', authenticated: true }).catch(() => {
      // Ignore errors if no listeners are available
    });
    
  } catch (error) {
    console.error('Authentication handling error:', error);
    sendResponse({ success: false, error: 'Authentication failed' });
  }
}

// Initialize database when extension loads
selectionDB.init().catch(error => {
  console.error('Failed to initialize IndexedDB:', error);
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Select Care Extension installed');
  
  // Initialize database on installation
  selectionDB.init().catch(error => {
    console.error('Failed to initialize IndexedDB on install:', error);
  });

  // Track installation or update with GA4
  try {
    const manifest = chrome.runtime.getManifest();
    
    if (details.reason === 'install') {
      await trackEvent('extension_installed', {
        version: manifest.version,
        manifest_version: manifest.manifest_version,
      });
      console.log('[GA4] Tracked extension installation');
    } else if (details.reason === 'update') {
      await trackEvent('extension_updated', {
        version: manifest.version,
        previous_version: details.previousVersion,
        manifest_version: manifest.manifest_version,
      });
      console.log('[GA4] Tracked extension update');
    }
  } catch (error) {
    console.error('[GA4] Failed to track installation event:', error);
  }
});

// Handle sidebar panel availability
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup - side panel available');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle analytics tracking from content scripts
  if (message.action === 'trackAnalytics') {
    console.log('[Analytics] Received tracking event:', message.data);
    
    // Handle analytics using GA4 Measurement Protocol (Manifest V3 compliant)
    (async () => {
      try {
        // Check if analytics is disabled
        const storedFlag = await chrome.storage.local.get(['analytics_disabled']);
        if (storedFlag && storedFlag.analytics_disabled) {
          console.log('[Analytics] Analytics disabled via storage flag');
          sendResponse({ success: false, error: 'analytics_disabled' });
          return;
        }

        // Extract event data
        const { eventCategory, eventAction, eventLabel, eventValue, customData } = message.data;
        
        // Track event with GA4
        const success = await trackCustomEvent(
          eventCategory || 'general',
          eventAction || 'custom_event',
          eventLabel,
          eventValue,
          {
            ...customData,
            timestamp: Date.now(),
          }
        );

        sendResponse({ success });
      } catch (err) {
        console.error('[Analytics] Failed to track event:', err);
        sendResponse({ success: false, error: String(err) });
      }
    })();
    
    return true; // Indicate async response
  }

  // Handle authentication messages from content scripts
  if (message.action === 'authenticate') {
    console.log('Received authentication message from content script:', message);
    handleAuthentication(message, sender, sendResponse);
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'note' || message.action === 'learn' || message.action === 'chat') {
    console.log('Received selection:', message.data);
    let selection_id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    // Build base selection fields common to all types
    const baseSelection: any = {
      selection_id: selection_id,
      text: message.data.text,
      context: {
        sourceUrl: (message.data.context && message.data.context.sourceUrl) || 'unknown'
      },
      tags: message.data.tags || [],
      type: message.action,
      ...(message.data.comments && { comments: message.data.comments }), // Include comments if present
      metadata: {
        timestamp: new Date().toISOString()
      }
    };

    // If this is a learn selection, include learn-specific fields following LearnSpecificData
    let selection: any;
    if (message.action === 'learn') {
      selection = {
        ...baseSelection,
        // ensure snake_case names as per LearnSpecificData
        source_language: message.data.source_language || message.data.sourceLanguage || 'auto',
        translation_context: (message.data.translation_context !== undefined) ? message.data.translation_context : (message.data.translationContext || null),
        pieces: Array.isArray(message.data.pieces) ? message.data.pieces.map((p: any) => ({
          target_language: p.target_language || p.targetLanguage || 'en',
          definition: (p.definition !== undefined) ? p.definition : null,
          translation: (p.translation !== undefined) ? p.translation : null,
          example: (p.example !== undefined) ? p.example : null,
          part_of_speech: p.part_of_speech || p.partOfSpeech || null,
          phonetics_text: p.phonetics_text || p.phoneticsText || null,
          phonetics_audio: p.phonetics_audio || p.phoneticsAudio || null,
          image_url: p.image_url || p.imageUrl || null
        })) : []
      };
    } else {
      // note/chat keep the previous, simpler shape
      selection = baseSelection;
    }
    
    // Save to IndexedDB
    selectionDB.saveSelection(selection).then(() => {
      console.log('Selection saved to IndexedDB successfully');
      sendResponse({ success: true, message: 'Selection saved successfully' });
      // Broadcast update to refresh dashboard
      broadcastDataUpdate();
    }).catch(error => {
      console.error('Failed to save selection to IndexedDB:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    // Return true to indicate async response
    return true;
  }

  // Language detection helper: content scripts can ask the background to detect language
  if (message.action === 'detectLanguage') {
    // message: { action: 'detectLanguage', text: string }
    (async () => {
      try {
        const text = message.text || '';
        if (!text) {
          sendResponse({ success: false, error: 'No text provided' });
          return;
        }
        const resp = await detectLanguage(text);
        if (!resp || !resp.success) {
          sendResponse({ success: false, error: resp?.error || 'detection failed' });
          return;
        }
        sendResponse({ success: true, result: resp.result });
      } catch (err) {
        console.error('detectLanguage failed', err);
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }

  // Dictionary fetch helper: run the dictionary lookup in the background
  if (message.action === 'fetchDictionary') {
    (async () => {
      try {
        const word = message.word || '';
        if (!word) {
          sendResponse({ success: false, error: 'No word provided' });
          return;
        }
        const data = await backgroundFetchDictionary(word);
        sendResponse({ success: true, data });
      } catch (err) {
        console.error('background fetchDictionary failed', err);
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }

  // Translate helper: content scripts can ask the background to translate a word
  if (message.action === 'translate') {
    // message: { action: 'translate', text: string, target: string, source?: string }
    (async () => {
      try {
        const text = message.text || '';
        if (!text) {
          sendResponse({ success: false, error: 'No text provided' });
          return;
        }
        const target = message.target || 'en';
        const source = message.source || 'auto';
        const resp = await translateDriver({ word: text, target, source, context: message.context });

        sendResponse({ success: true, result: resp });
      } catch (err) {
        console.error('background translate failed', err);
        sendResponse({ success: false, error: String(err) });
      }
    })();
    return true;
  }
  
  if (message.action === 'getAllSelections') {
    selectionDB.getAllSelections().then(selections => {
      sendResponse({ success: true, data: selections });
    }).catch(error => {
      console.error('Failed to get selections from IndexedDB:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    // Return true to indicate async response
    return true;
  }
  
  if (message.action === 'deleteSelection') {
    selectionDB.deleteSelection(message.data.id).then(() => {
      console.log('Selection deleted from IndexedDB');
      sendResponse({ success: true, message: 'Selection deleted successfully' });
      // Broadcast update to refresh dashboard
      broadcastDataUpdate();
    }).catch(error => {
      console.error('Failed to delete selection from IndexedDB:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    // Return true to indicate async response
    return true;
  }

  // Update an existing selection (overwrite by selection_id)
  if (message.action === 'updateSelection') {
    const selection = message.data?.selection;
    if (!selection || !selection.selection_id) {
      sendResponse({ success: false, error: 'Invalid selection data' });
      return;
    }

    selectionDB.saveSelection(selection).then(() => {
      console.log('Selection updated in IndexedDB:', selection.selection_id);
      sendResponse({ success: true, message: 'Selection updated successfully' });
      // Broadcast update to refresh dashboard
      broadcastDataUpdate();
    }).catch(error => {
      console.error('Failed to update selection:', error);
      sendResponse({ success: false, error: error.message });
    });

    return true;
  }
  
  if (message.action === 'searchSelections') {
    selectionDB.searchSelections(message.data.query).then(selections => {
      sendResponse({ success: true, data: selections });
    }).catch(error => {
      console.error('Failed to search selections in IndexedDB:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    // Return true to indicate async response
    return true;
  }
  
  
});

// Optional: Handle extension icon click to open sidebar (alternative to popup)
// chrome.action.onClicked.addListener(async (tab) => {
//   if (tab?.id) {
//     try {
//       await chrome.sidePanel.open({ tabId: tab.id });
//     } catch (error) {
//       console.error('Failed to open side panel:', error);
//     }
//   }
// });
