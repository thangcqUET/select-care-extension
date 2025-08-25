import { throttle } from './utils';


let selectedText : string | undefined;
let selectionPosition: DOMRect | undefined;

// listen select text event
document.addEventListener('selectionchange', throttle(() => {
  selectedText = document.getSelection()?.toString();
  //position of selection
  const selection = document.getSelection();
  if (selection && selection.rangeCount > 0) {
    const selectionRange = selection.getRangeAt(0);
    const rect = selectionRange.getBoundingClientRect();
    selectionPosition = rect;
  }
  console.log('Selected text:', selectedText);
  if (selectedText) {
    // show a popup beside the mouse with a emoji and the selected text
    console.log(`${selectedText}`);
  }
}, 10));

//listen mouse down event
document.addEventListener('mousedown', (event: MouseEvent) => {
  console.log('Mouse down at:', event.clientX, event.clientY);
});

//listen mouse up event
document.addEventListener('mouseup', (event: MouseEvent) => {
  console.log('Mouse up at:', event.clientX, event.clientY);
  if (selectedText) {
    showPopup();
    selectedText = undefined;
  }
});

// Virtual DOM component for the popup
class SelectPopup {
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private isVisible: boolean = false;
  private isHovering: boolean = false;
  private hideTimeout: number | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'select-care-popup-container';
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    this.setupStyles();
    this.setupContent();
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .popup {
        position: fixed;
        display: flex;
        flex-direction: row;
        gap: 8px;
        border-radius: 12px;
        transform: translate(-50%, -50%) scale(0.8);
        
        padding: 8px;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(63, 63, 63, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #000;
        opacity: 0;
        transition: opacity 0.25s ease, transform 0.25s ease;
        
        z-index: 10000;
        pointer-events: auto;
      }

      .popup.show {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }

      .popup .buttons {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .popup button.cancel:hover {
        background-color: rgba(142, 142, 147, 0.6);
      }


      .popup.visible {
        opacity: 1;
        transform: scale(1) translate(-50%, 0);
      }

      .icon-button {
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.15);
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        backdrop-filter: blur(5px);
        user-select: none;
      }

      .icon-button:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .icon-button:active {
        transform: scale(0.95);
      }

      .icon-button:nth-child(1) {
        animation-delay: 0.1s;
      }

      .icon-button:nth-child(2) {
        animation-delay: 0.15s;
      }

      .icon-button:nth-child(3) {
        animation-delay: 0.2s;
      }

      .popup.visible .icon-button {
        animation: bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      }

      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  private setupContent() {
    const popup = document.createElement('div');
    popup.className = 'popup';

    // Add hover event listeners to the popup
    popup.addEventListener('mouseenter', () => {
      this.isHovering = true;
      this.clearHideTimeout();
    });

    popup.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.scheduleHide();
    });

    const icons = [
      { emoji: '🌏', action: 'translate', title: 'Translate & Save Word' },
      { emoji: '📝', action: 'note', title: 'Save as Note' },
      { emoji: '🤖', action: 'ai', title: 'Ask AI' }
    ];

    icons.forEach(icon => {
      const button = document.createElement('button');
      button.className = 'icon-button';
      button.textContent = icon.emoji;
      button.title = icon.title;
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleIconClick(icon.action);
      });
      popup.appendChild(button);
    });

    this.shadowRoot.appendChild(popup);
  }

  private handleIconClick(action: string) {
    console.log(`Action clicked: ${action} for text: "${selectedText}"`);
    
    // Store the selected text before hiding popup
    const textToProcess = selectedText || '';
    
    switch (action) {
      case 'translate':
        this.handleTranslateAction(textToProcess);
        break;
      case 'note':
        this.handleNoteAction(textToProcess);
        break;
      case 'ai':
        this.handleAiAction(textToProcess);
        break;
    }
    this.hide();
  }

  private handleTranslateAction(text: string) {
    console.log('🌐 Translating and saving word:', text);
    // Recommended behavior:
    // 1. Detect source language automatically
    // 2. Translate to user's preferred language
    // 3. Save both original and translation to vocabulary list
    // 4. Show mini toast with translation result
    // 5. Add to spaced repetition system for learning
    
    // TODO: Implement translation API call
    // TODO: Save to local storage/database
    // TODO: Show translation toast notification
  }

  private handleNoteAction(text: string) {
    console.log('📌 Saving selection as note:', text);
    // Recommended behavior:
    // 1. Open a quick note editor overlay
    // 2. Pre-fill with selected text
    // 3. Allow user to add tags, categories
    // 4. Include source URL and timestamp
    // 5. Save to notes collection with search capability
    
    // TODO: Show note editor modal
    // TODO: Include metadata (URL, timestamp, context)
    // TODO: Save to notes database
    // TODO: Add tagging system
  }

  private handleAiAction(text: string) {
    console.log('🤖 Asking AI about:', text);
    // Recommended behavior:
    // 1. Show loading indicator
    // 2. Send text to AI service with context
    // 3. Display response in expandable dialog
    // 4. Allow follow-up questions
    // 5. Save conversation history
    
    // TODO: Show AI chat interface
    // TODO: Implement streaming response
    // TODO: Add context from surrounding text
    // TODO: Save chat history
  }

  private clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private scheduleHide() {
    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => {
      if (this.isVisible && !this.isHovering) {
        this.hide();
      }
    }, 3000); // Hide after 3 seconds if not hovering
  }

  show(position: DOMRect) {
    if (this.isVisible) return;

    document.body.appendChild(this.container);
    
    const popup = this.shadowRoot.querySelector('.popup') as HTMLElement;
    if (popup) {
      popup.style.top = `${position.bottom + 10}px`;
      popup.style.left = `${position.left + position.width / 2}px`;

      // Trigger animation
      requestAnimationFrame(() => {
        popup.classList.add('visible');
      });
    }

    this.isVisible = true;

    // Schedule auto-hide (will be cancelled if hovering)
    this.scheduleHide();

    // Hide when clicking outside, but need to wait about 100ms
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick, true);
    }, 100);
  }

  private handleOutsideClick = (event: Event) => {
    if (!this.container.contains(event.target as Node)) {
      this.hide();
    }
  };

  hide() {
    if (!this.isVisible) return;

    this.clearHideTimeout();

    const popup = this.shadowRoot.querySelector('.popup') as HTMLElement;
    if (popup) {
      popup.classList.remove('visible');
      
      setTimeout(() => {
        if (this.container.parentNode) {
          document.body.removeChild(this.container);
        }
      }, 300);
    }

    document.removeEventListener('click', this.handleOutsideClick, true);
    this.isVisible = false;
    this.isHovering = false;
  }
}

// Global popup instance
let popupInstance: SelectPopup | null = null;

// function to show a popup with 3 clickable icons
function showPopup() {
  if (!selectionPosition) return;

  // Hide existing popup if any
  if (popupInstance) {
    popupInstance.hide();
  }

  // Create new popup instance
  popupInstance = new SelectPopup();
  popupInstance.show(selectionPosition);
}