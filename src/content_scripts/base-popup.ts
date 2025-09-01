/**
 * Base popup class providing common functionality
 * for all popup components in the content script
 */

import { TIMING } from './constants';
import { PopupStyles } from './popup-styles';

export interface PopupOptions {
  className?: string;
  zIndex?: number;
  hideOnOutsideClick?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export abstract class BasePopup {
  protected container: HTMLDivElement;
  protected shadowRoot: ShadowRoot;
  protected isVisible: boolean = false;
  protected isHovering: boolean = false;
  protected hideTimeout: number | null = null;
  protected options: PopupOptions;

  constructor(options: PopupOptions = {}) {
    this.options = {
      hideOnOutsideClick: true,
      autoHide: false,
      autoHideDelay: TIMING.POPUP_HIDE_DELAY,
      ...options,
    };

    this.container = this.createContainer();
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    this.setupStyles();
    this.setupContent();
    this.setupEventListeners();
  }

  /**
   * Create the main container element
   */
  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = this.options.className || 'popup-container';
    if (this.options.zIndex) {
      container.style.zIndex = this.options.zIndex.toString();
    }
    return container;
  }

  /**
   * Setup styles - includes base styles and component-specific styles
   */
  protected setupStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      ${PopupStyles.getAllStyles()}
      ${this.getComponentStyles()}
    `;
    this.shadowRoot.appendChild(style);
  }

  /**
   * Setup event listeners for hover and outside click
   */
  protected setupEventListeners(): void {
    if (this.options.autoHide) {
      this.setupHoverListeners();
    }
  }

  /**
   * Setup hover listeners for auto-hide functionality
   */
  private setupHoverListeners(): void {
    const popup = this.shadowRoot.querySelector('.popup-base') as HTMLElement;
    if (!popup) return;

    popup.addEventListener('mouseenter', () => {
      console.log('Popup mouse enter');
      this.isHovering = true;
      this.clearHideTimeout();
    });

    popup.addEventListener('mouseleave', () => {
      console.log('Popup mouse leave');
      this.isHovering = false;
      this.scheduleHide();
    });
  }

  /**
   * Position the popup relative to a DOM rectangle
   */
  protected positionPopup(position: DOMRect, element: HTMLElement): void {
    element.style.top = `${position.bottom + 10}px`;
    element.style.left = `${position.left + position.width / 2}px`;
  }

  /**
   * Show the popup with animation
   */
  show(position: DOMRect): void {
    if (this.isVisible) return;

    document.body.appendChild(this.container);
    const popup = this.getPopupElement();
    
    if (popup) {
      this.positionPopup(position, popup);
      this.triggerShowAnimation(popup);
    }

    this.isVisible = true;
    this.onShow();

    if (this.options.autoHide) {
      this.scheduleHide();
    }

    if (this.options.hideOnOutsideClick) {
      setTimeout(() => {
        document.addEventListener('click', this.handleOutsideClick, true);
      }, TIMING.OUTSIDE_CLICK_DELAY);
    }
  }

  /**
   * Hide the popup with animation
   */
  hide(): void {
    if (!this.isVisible) return;

    this.clearHideTimeout();
    const popup = this.getPopupElement();
    
    if (popup) {
      this.triggerHideAnimation(popup);
      
      setTimeout(() => {
        if (this.container.parentNode) {
          document.body.removeChild(this.container);
        }
        this.onHide();
      }, TIMING.ANIMATION_DELAY);
    }

    if (this.options.hideOnOutsideClick) {
      document.removeEventListener('click', this.handleOutsideClick, true);
    }

    this.isVisible = false;
    this.isHovering = false;
  }

  /**
   * Check if popup is currently visible
   */
  isPopupVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Clear the auto-hide timeout
   */
  protected clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  /**
   * Schedule auto-hide if not hovering
   */
  protected scheduleHide(): void {
    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => {
      if (this.isVisible && !this.isHovering) {
        this.hide();
      }
    }, this.options.autoHideDelay);
  }

  /**
   * Handle outside click to hide popup
   */
  private handleOutsideClick = (event: Event): void => {
    if (!this.container.contains(event.target as Node)) {
      this.hide();
    }
  };

  /**
   * Trigger show animation
   */
  protected triggerShowAnimation(popup: HTMLElement): void {
    requestAnimationFrame(() => {
      popup.classList.add('visible');
    });
  }

  /**
   * Trigger hide animation
   */
  protected triggerHideAnimation(popup: HTMLElement): void {
    popup.classList.remove('visible');
  }

  // Abstract methods to be implemented by subclasses
  protected abstract setupContent(): void;
  protected abstract getComponentStyles(): string;
  protected abstract getPopupElement(): HTMLElement | null;
  
  // Optional lifecycle hooks
  protected onShow(): void {}
  protected onHide(): void {}
}
