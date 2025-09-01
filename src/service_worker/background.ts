import { selectionDB } from "./database";

// Background service worker for Chrome extension
console.log('Select Care Extension background script loaded');

// Function to broadcast data updates to all tabs/contexts
function broadcastDataUpdate() {
  console.log('Broadcasting data update to all contexts...');
  chrome.runtime.sendMessage({ action: 'dataUpdated' }).catch(() => {
    // Ignore errors if no listeners are available
  });
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
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
