import { isUserTyping, throttle } from './utils';
import { SelectPopup } from './components/SelectPopup';
import { SelectionState } from './SelectionState';

// Listen for authentication messages from web app
window.addEventListener('message', (event) => {
  // Only accept messages from our web app domains
  const allowedOrigins = ['http://localhost:3001', 'https://your-domain.com'];
  if (!allowedOrigins.includes(event.origin)) return;
  
  if (event.data.type === 'SELECTCARE_AUTH' && event.data.action === 'authenticate') {
    console.log('Received authentication message from web app:', event.data);
    
    // Forward the authentication data to the background script
    chrome.runtime.sendMessage({
      action: 'authenticate',
      token: event.data.token,
      userEmail: event.data.userEmail,
      state: event.data.state
    }).then((response) => {
      console.log('Authentication forwarded to background script:', response);
    }).catch((error) => {
      console.error('Error forwarding authentication:', error);
    });
  }
});


// Side panel toggle removed: feature disabled until sidePanel close API is available.

const SELECTION_CHANGE_DELAY = 10;
const MOUSEUP_DELAY = SELECTION_CHANGE_DELAY+1;



// listen select text event
document.addEventListener('selectionchange', throttle(() => {
  const rawText = document.getSelection()?.toString();
  let selectedText = rawText?.trim(); // Trim whitespace
  let selectionPosition: DOMRect | undefined;
  //position of selection
  const selection = document.getSelection();
  if (selection && selection.rangeCount > 0) {
    const selectionRange = selection.getRangeAt(0);
    const rect = selectionRange.getBoundingClientRect();
    selectionPosition = rect;
  }

  SelectionState.getInstance().updateSelection(selectedText, selectionPosition);
  // console.log('Selected text:', selectedText);
  // if (selectedText) {
  //   // show a popup beside the mouse with a emoji and the selected text
  //   console.log(`${selectedText}`);
  // }
}, SELECTION_CHANGE_DELAY));

//listen mouse down event
// document.addEventListener('mousedown', (event: MouseEvent) => {
//   console.log('Mouse down at:', event.clientX, event.clientY);
// });

//listen mouse up event
document.addEventListener('mouseup', () => {
  
  // Don't show popup if user is typing in an input field
  if (isUserTyping()) {
    console.debug('User is typing, skipping popup');
    return;
  }
  
  // Only show popup if there's actual trimmed text content
  setTimeout(() => {
    const selectedText = SelectionState.getInstance().selectedText;
    if (selectedText && selectedText.length > 0) {
      showPopup();
      SelectionState.getInstance().saveSelection();
    }
  }, MOUSEUP_DELAY);
    // selectedText = undefined;
});





// Global popup instances
let popupInstance: SelectPopup | null = null;

// function to show a popup with 3 clickable icons
function showPopup() {
  console.log("show popup!!");
  // Double-check that we have valid selection position and text
  const { selectionPosition, selectedText } = SelectionState.getInstance();
  if (!selectionPosition || !selectedText || selectedText.trim().length === 0) {
    return;
  }

  // Do not show when blocked by recent select action
  if (SelectPopup.isBlocked()) {
    console.log('SelectPopup is currently blocked; skipping showPopup');
    return;
  }

  // Hide existing popup if any
  if (popupInstance) {
    popupInstance.hide();
  }

  // Create new popup instance
  popupInstance = new SelectPopup();
  popupInstance.show(selectionPosition);
}