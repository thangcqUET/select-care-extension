/**
 * Select popup component - the initial popup with action buttons
 * Shows when text is selected and provides quick action options
 */

import { BasePopup, PopupOptions } from './base-popup';
import { POPUP_ACTIONS, Z_INDEX } from './constants';

export interface SelectPopupCallbacks {
  onActionClick: (action: string, selectedText: string) => void;
}

export class SelectPopup extends BasePopup {
  private callbacks: SelectPopupCallbacks;

  constructor(callbacks: SelectPopupCallbacks, options: PopupOptions = {}) {
    super({
      className: 'select-care-popup-container',
      zIndex: Z_INDEX.SELECT_POPUP,
      autoHide: true,
      ...options,
    });
    
    this.callbacks = callbacks;
  }

  protected setupContent(): void {
    const popup = document.createElement('div');
    popup.className = 'popup popup-base popup-row scale-enter';

    POPUP_ACTIONS.forEach((iconConfig, index) => {
      const button = this.createActionButton(iconConfig, index);
      popup.appendChild(button);
    });

    this.shadowRoot.appendChild(popup);
  }

  protected getComponentStyles(): string {
    return `
      .popup {
        transform: translate(-50%, -50%) scale(0.8);
        z-index: ${Z_INDEX.SELECT_POPUP};
      }

      .popup.visible {
        transform: translate(-50%, -50%) scale(1);
      }

      .popup.visible .btn-icon {
        animation: bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      }
    `;
  }

  protected getPopupElement(): HTMLElement | null {
    return this.shadowRoot.querySelector('.popup');
  }

  /**
   * Create an action button for the popup
   */
  private createActionButton(iconConfig: (typeof POPUP_ACTIONS)[number], index: number): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'btn-base btn-icon';
    button.textContent = iconConfig.emoji;
    button.title = iconConfig.title;
    button.style.animationDelay = `${0.1 + (index * 0.05)}s`;
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleActionClick(iconConfig.action);
    });

    return button;
  }

  /**
   * Handle action button click
   */
  private handleActionClick(action: string): void {
    // Get the saved selected text from selection manager or similar
    // For now, we'll need to pass this through the callback
    this.callbacks.onActionClick(action, ''); // Text will be provided by parent
    this.hide();
  }
}
