import { createSelection } from "./types";

// Background service worker for Chrome extension
console.log('Select Care Extension background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Select Care Extension installed');
});

// Example: Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'note') {
    const selection = createSelection(message.data);
    console.log('Received note selection:', selection);
    // Handle background actions here
    sendResponse({ success: true });
  }
});

// Example: Handle extension icon click (if no popup)
// chrome.action.onClicked.addListener((tab) => {
//   console.log('Extension icon clicked', tab);
// });
