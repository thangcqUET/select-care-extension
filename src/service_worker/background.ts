import { selectionDB } from "./database";
import { detectLanguage } from './api/detectApi';
import { fetchDictionary as backgroundFetchDictionary } from './api/dictionary';

// Background service worker for Chrome extension
console.log('Select Care Extension background script loaded');

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
      const allowedOrigins = ['http://localhost:3001', 'https://your-domain.com'];
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
chrome.runtime.onInstalled.addListener(() => {
  console.log('Select Care Extension installed');
  // Initialize database on installation
  selectionDB.init().catch(error => {
    console.error('Failed to initialize IndexedDB on install:', error);
  });
});

// Handle sidebar panel availability
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup - side panel available');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle authentication messages from content scripts
  if (message.action === 'authenticate') {
    console.log('Received authentication message from content script:', message);
    handleAuthentication(message, sender, sendResponse);
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'note' || message.action === 'learn' || message.action === 'chat') {
    console.log('Received selection:', message.data);
    let selection_id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    // Create selection with new data structure
    const selection = {
      selection_id: selection_id,
      text: message.data.text,
      context: {
        sourceUrl: message.data.context.sourceUrl || 'unknown',
        // ...(message.data.targetLanguage && { targetLanguage: message.data.targetLanguage }),
        // ...(message.data.question && { question: message.data.question })
      },
      tags: message.data.tags || [],
      type: message.action,
      ...(message.data.comments && { comments: message.data.comments }), // Include comments if present
      metadata: {
        timestamp: new Date().toISOString()
      }
    };
    
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
