// Background service worker for Chrome extension
console.log('Select Care Extension background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Select Care Extension installed');
});

// Example: Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'background-action') {
    // Handle background actions here
    sendResponse({ success: true });
  }
});

// Example: Handle extension icon click (if no popup)
// chrome.action.onClicked.addListener((tab) => {
//   console.log('Extension icon clicked', tab);
// });
