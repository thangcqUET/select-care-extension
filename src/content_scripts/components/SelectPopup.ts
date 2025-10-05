import { SelectionState } from "../SelectionState";
import { FormPopup } from "./FormPopup";

// Virtual DOM component for the popup
export class SelectPopup {
  // static timestamp (ms) until which new select popups should be suppressed
  private static blockUntil: number = 0;
  static blockFor(ms: number) {
    SelectPopup.blockUntil = Date.now() + ms;
  }

  static isBlocked() {
    return Date.now() < SelectPopup.blockUntil;
  }
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
        
        padding: 5px;
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
        font-size: 14px;
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
      console.log("mouse enter");
      this.isHovering = true;
      this.clearHideTimeout();
    });

    popup.addEventListener('mouseleave', () => {
      console.log("mouse leave");
      this.isHovering = false;
      this.scheduleHide();
    });

    const icons = [
      { emoji: '🌏', action: 'learn', title: 'Learn it' },
      { emoji: '📝', action: 'note', title: 'Save as Note' },
      { emoji: '🤖', action: 'chat', title: 'Ask AI' }
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
    // console.log(`Action clicked: ${action} for text: "${savedSelectedText}"`);

    // Store the selected text before hiding popup
    const textToProcess = SelectionState.getInstance().savedSelectedText || '';
    // Hide the small select popup immediately
    this.hideImmediately();

    // Suppress immediate reopening of the select popup for a short window
    SelectPopup.blockFor(350);

    switch (action) {
      case 'learn':
        this.handleLearnAction(textToProcess);
        break;
      case 'note':
        this.handleNoteAction(textToProcess);
        break;
      case 'chat':
        this.handleAiAction(textToProcess);
        break;
    }
  }

  private handleLearnAction(text: string, position?: DOMRect) {
    // console.log('🌐 Opening learn form for:', text);
    const formPopup = new FormPopup('learn', text);
    const selectionPosition = position ?? SelectionState.getInstance().selectionPosition;
    if (selectionPosition) {
      formPopup.show(selectionPosition);
    }
  }

  private handleNoteAction(text: string, position?: DOMRect) {
    // console.log('📌 Opening note form for:', text);
    const formPopup = new FormPopup('note', text);
    const selectionPosition = position ?? SelectionState.getInstance().selectionPosition;
    if (selectionPosition) {
      formPopup.show(selectionPosition);
    }
  }

  private handleAiAction(text: string, position?: DOMRect) {
    // console.log('🤖 Opening AI form for:', text);
    const formPopup = new FormPopup('chat', text);
    const selectionPosition = position ?? SelectionState.getInstance().selectionPosition;
    if (selectionPosition) {
      formPopup.show(selectionPosition);
    }
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

  hideImmediately() {
    if (!this.isVisible) return;

    this.clearHideTimeout();

    if (this.container.parentNode) {
      // remove animation class immediately
      const popup = this.shadowRoot.querySelector('.popup') as HTMLElement;
      if (popup) {
        popup.classList.remove('visible');
      }
      // remove immediately without animation
      this.container.parentNode.removeChild(this.container);
    }

    document.removeEventListener('click', this.handleOutsideClick, true);
    this.isVisible = false;
    this.isHovering = false;
  }
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