/**
 * Shared styles for popup components
 * Contains reusable CSS styles to avoid duplication
 */

export class PopupStyles {
  /**
   * Base popup styles shared by all popup components
   */
  static getBaseStyles(): string {
    return `
      /* Base popup container */
      .popup-base {
        position: fixed;
        border-radius: 12px;
        padding: 5px;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(63, 63, 63, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #000;
        opacity: 0;
        transition: opacity 0.25s ease, transform 0.25s ease;
        pointer-events: auto;
      }

      .popup-base.visible {
        opacity: 1;
      }

      /* Form inputs */
      .form-input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid rgba(63, 63, 63, 0.2);
        border-radius: 8px;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(5px);
        color: #000;
        margin-bottom: 8px;
        box-sizing: border-box;
        font-family: inherit;
      }

      .form-input::placeholder {
        color: rgba(0, 0, 0, 0.5);
      }

      .form-input:focus {
        outline: none;
        border-color: rgba(63, 63, 63, 0.4);
        background: rgba(255, 255, 255, 0.8);
      }

      /* Buttons */
      .btn-base {
        border: none;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(5px);
        font-family: inherit;
        user-select: none;
      }

      .btn-base:active {
        transform: scale(0.98);
      }

      .btn-icon {
        width: 30px;
        height: 30px;
        background: rgba(255, 255, 255, 0.15);
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-icon:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .btn-primary {
        background: rgba(255, 255, 255, 0.8);
        color: #000;
        border: 1px solid rgba(63, 63, 63, 0.3);
        font-weight: 600;
        padding: 8px 12px;
      }

      .btn-primary:hover {
        background: rgba(255, 255, 255, 0.95);
        transform: scale(1.02);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.3);
        color: #000;
        border: 1px solid rgba(63, 63, 63, 0.2);
        padding: 8px 12px;
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.5);
        transform: scale(1.02);
      }

      .btn-accent {
        padding: 4px 8px;
        border: 1px solid rgba(59, 130, 246, 0.3);
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
        font-size: 12px;
      }

      .btn-accent:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.5);
        transform: scale(1.02);
      }
    `;
  }

  /**
   * Animation styles for popup entrance/exit
   */
  static getAnimationStyles(): string {
    return `
      /* Scale animations */
      .scale-enter {
        transform: translate(-50%, -50%) scale(0.8);
      }

      .scale-enter.visible {
        transform: translate(-50%, -50%) scale(1);
      }

      .scale-form-enter {
        transform: scale(0.3) translate(-50%, 0);
      }

      .scale-form-enter.visible {
        transform: scale(1) translate(-50%, 0);
      }

      /* Bounce animation for buttons */
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

      .bounce-in {
        animation: bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      }

      /* Staggered button animations */
      .btn-icon:nth-child(1) { animation-delay: 0.1s; }
      .btn-icon:nth-child(2) { animation-delay: 0.15s; }
      .btn-icon:nth-child(3) { animation-delay: 0.2s; }
    `;
  }

  /**
   * Layout styles for popup content
   */
  static getLayoutStyles(): string {
    return `
      /* Flex layouts */
      .popup-row {
        display: flex;
        flex-direction: row;
        gap: 8px;
        align-items: center;
      }

      .popup-column {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .popup-actions {
        display: flex;
        gap: 6px;
        margin-top: 4px;
      }

      .popup-actions .btn-base {
        flex: 1;
      }

      /* Headers */
      .popup-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .popup-icon {
        font-size: 16px;
      }

      /* Text display */
      .selected-text-display {
        background: rgba(255, 255, 255, 0.3);
        border: 1px solid rgba(63, 63, 63, 0.2);
        border-radius: 8px;
        padding: 8px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        margin-bottom: 8px;
        max-height: 60px;
        overflow-y: auto;
        word-break: break-word;
        backdrop-filter: blur(5px);
      }

      /* Form sections */
      .form-section {
        margin-bottom: 8px;
      }

      .form-label {
        font-size: 12px;
        font-weight: 600;
        color: #000;
        display: block;
        margin-bottom: 4px;
      }
    `;
  }

  /**
   * Get all styles combined
   */
  static getAllStyles(): string {
    return [
      this.getBaseStyles(),
      this.getAnimationStyles(),
      this.getLayoutStyles(),
    ].join('\n');
  }
}
