/**
 * Event handler manager for content script
 * Coordinates all event handling and popup management
 */

import { throttle } from './utils';
import { TIMING } from './constants';
import { selectionManager } from './selection-manager';
import { InputDetector } from './input-detector';
import { SelectPopup } from './select-popup';
import { FormPopup } from './form-popup';

export class ContentEventManager {
  private selectPopup: SelectPopup | null = null;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    this.setupSelectionChangeListener();
    this.setupMouseUpListener();
  }

  /**
   * Setup selection change event listener
   */
  private setupSelectionChangeListener(): void {
    document.addEventListener('selectionchange', throttle(() => {
      selectionManager.updateFromDOM();
    }, TIMING.SELECTION_CHANGE_DELAY));
  }

  /**
   * Setup mouse up event listener
   */
  private setupMouseUpListener(): void {
    document.addEventListener('mouseup', (event: MouseEvent) => {
      console.log('Mouse up at:', event.clientX, event.clientY);
      
      // Don't show popup if user is typing
      if (InputDetector.isUserTyping()) {
        console.log('User is typing, skipping popup');
        return;
      }
      
      // Show popup after a short delay to ensure selection is processed
      setTimeout(() => {
        if (selectionManager.hasValidSelection()) {
          this.showSelectPopup();
          selectionManager.saveSelectedText();
        }
      }, TIMING.MOUSEUP_DELAY);
    });
  }

  /**
   * Show the selection popup
   */
  private showSelectPopup(): void {
    console.log("Showing selection popup");
    
    const position = selectionManager.getSelectionPosition();
    if (!position) return;

    // Hide existing popup if any
    if (this.selectPopup) {
      this.selectPopup.hide();
    }

    // Create new popup instance
    this.selectPopup = new SelectPopup({
      onActionClick: this.handleActionClick.bind(this),
    });

    this.selectPopup.show(position);
  }

  /**
   * Handle action click from select popup
   */
  private handleActionClick(action: string, _selectedText: string): void {
    const savedText = selectionManager.getSavedText();
    const position = selectionManager.getSelectionPosition();
    
    if (!savedText || !position) {
      console.warn('No saved text or position available');
      return;
    }

    console.log(`Action clicked: ${action} for text: "${savedText}"`);
    
    // Show form popup for the selected action
    const formPopup = new FormPopup(action, savedText, {
      onSave: (actionType, data) => {
        console.log(`Form saved for ${actionType}:`, data);
      },
      onCancel: () => {
        console.log('Form cancelled');
      },
    });

    formPopup.show(position);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.selectPopup) {
      this.selectPopup.hide();
      this.selectPopup = null;
    }
  }
}

// Initialize the event manager when the content script loads
const eventManager = new ContentEventManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  eventManager.destroy();
});
