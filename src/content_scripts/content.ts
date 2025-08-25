import { throttle } from './utils';


let selectedText : string | undefined;
let selectionPosition: DOMRect | undefined;

// listen select text event
document.addEventListener('selectionchange', throttle(() => {
  const rawText = document.getSelection()?.toString();
  selectedText = rawText?.trim(); // Trim whitespace
  
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
  // Only show popup if there's actual trimmed text content
  if (selectedText && selectedText.length > 0) {
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
    console.log('🌐 Opening translate form for:', text);
    const formPopup = new FormPopup('translate', text);
    if (selectionPosition) {
      formPopup.show(selectionPosition);
    }
  }

  private handleNoteAction(text: string) {
    console.log('📌 Opening note form for:', text);
    const formPopup = new FormPopup('note', text);
    if (selectionPosition) {
      formPopup.show(selectionPosition);
    }
  }

  private handleAiAction(text: string) {
    console.log('🤖 Opening AI form for:', text);
    const formPopup = new FormPopup('ai', text);
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

// Form popup component for detailed input
class FormPopup {
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private isVisible: boolean = false;
  private actionType: string;
  private selectedText: string;

  constructor(actionType: string, text: string) {
    this.actionType = actionType;
    this.selectedText = text;
    this.container = document.createElement('div');
    this.container.className = 'select-care-form-container';
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    this.setupFormStyles();
    this.setupFormContent();
  }

  private setupFormStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .form-popup {
        position: fixed;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-radius: 12px;
        transform: scale(0.3) translate(-50%, 0);
        
        padding: 12px;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(63, 63, 63, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #000;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        
        z-index: 10001;
        pointer-events: auto;
        min-width: 280px;
        max-width: 320px;
      }

      .form-popup.visible {
        opacity: 1;
        transform: scale(1) translate(-50%, 0);
      }

      .form-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .form-icon {
        font-size: 16px;
      }

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
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .form-input::placeholder {
        color: rgba(0, 0, 0, 0.5);
      }

      .form-input:focus {
        outline: none;
        border-color: rgba(63, 63, 63, 0.4);
        background: rgba(255, 255, 255, 0.8);
      }

      .form-actions {
        display: flex;
        gap: 6px;
        margin-top: 4px;
      }

      .form-button {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(5px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .form-button.cancel {
        background: rgba(255, 255, 255, 0.3);
        color: #000;
        border: 1px solid rgba(63, 63, 63, 0.2);
      }

      .form-button.cancel:hover {
        background: rgba(255, 255, 255, 0.5);
        transform: scale(1.02);
      }

      .form-button.primary {
        background: rgba(255, 255, 255, 0.8);
        color: #000;
        border: 1px solid rgba(63, 63, 63, 0.3);
        font-weight: 600;
      }

      .form-button.primary:hover {
        background: rgba(255, 255, 255, 0.95);
        transform: scale(1.02);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .form-button:active {
        transform: scale(0.98);
      }

      .selected-text {
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
    `;
    this.shadowRoot.appendChild(style);
  }

  private setupFormContent() {
    const popup = document.createElement('div');
    popup.className = 'form-popup';

    // Header with icon and title
    const header = document.createElement('div');
    header.className = 'form-header';

    const icon = document.createElement('span');
    icon.className = 'form-icon';
    
    const title = document.createElement('span');

    switch (this.actionType) {
      case 'translate':
        icon.textContent = '🌐';
        title.textContent = 'Translate & Save';
        break;
      case 'note':
        icon.textContent = '📌';
        title.textContent = 'Save Note';
        break;
      case 'ai':
        icon.textContent = '🤖';
        title.textContent = 'Ask AI';
        break;
    }

    header.appendChild(icon);
    header.appendChild(title);

    // Selected text display (compact)
    const textDisplay = document.createElement('div');
    textDisplay.className = 'selected-text';
    textDisplay.textContent = this.selectedText.length > 100 
      ? this.selectedText.substring(0, 100) + '...' 
      : this.selectedText;

    // Single input field based on action type
    const inputField = this.createSimpleInput();

    // Actions
    const actions = document.createElement('div');
    actions.className = 'form-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'form-button cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.hide());

    const saveBtn = document.createElement('button');
    saveBtn.className = 'form-button primary';
    saveBtn.textContent = this.getSaveButtonText();
    saveBtn.addEventListener('click', () => this.handleSave());

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    // Assemble popup
    popup.appendChild(header);
    popup.appendChild(textDisplay);
    popup.appendChild(inputField);
    popup.appendChild(actions);

    this.shadowRoot.appendChild(popup);

    // Hide when clicking outside
    document.addEventListener('click', this.handleOutsideClick, true);
  }

  private createSimpleInput(): HTMLElement {
    const input = document.createElement('input');
    input.className = 'form-input';
    input.id = 'mainInput';

    switch (this.actionType) {
      case 'translate':
        input.placeholder = 'Target language (e.g., English, Spanish)';
        input.value = 'English';
        break;
      case 'note':
        input.placeholder = 'Note title or category';
        break;
      case 'ai':
        input.placeholder = 'What would you like to ask?';
        break;
    }

    return input;
  }

  private handleOutsideClick = (event: Event) => {
    if (!this.container.contains(event.target as Node)) {
      this.hide();
    }
  };

  private getSaveButtonText(): string {
    switch (this.actionType) {
      case 'translate':
        return 'Translate & Save';
      case 'note':
        return 'Save Note';
      case 'ai':
        return 'Ask AI';
      default:
        return 'Save';
    }
  }

  private handleSave() {
    const formData = this.collectFormData();
    console.log(`Saving ${this.actionType} data:`, formData);
    
    // TODO: Implement actual save logic based on action type
    switch (this.actionType) {
      case 'translate':
        this.saveTranslation(formData);
        break;
      case 'note':
        this.saveNote(formData);
        break;
      case 'ai':
        this.askAI(formData);
        break;
    }
    
    this.hide();
  }

  private collectFormData(): any {
    const data: any = {
      selectedText: this.selectedText,
      actionType: this.actionType,
      timestamp: new Date().toISOString(),
      sourceUrl: window.location.href
    };

    // Get the main input value
    const mainInput = this.shadowRoot.getElementById('mainInput') as HTMLInputElement;
    const inputValue = mainInput?.value || '';

    // Set data based on action type
    switch (this.actionType) {
      case 'translate':
        data.targetLanguage = inputValue || 'English';
        data.sourceLanguage = 'auto';
        break;
      case 'note':
        data.title = inputValue || 'Untitled Note';
        data.category = 'General';
        break;
      case 'ai':
        data.question = inputValue || 'Explain this text';
        break;
    }

    return data;
  }

  private saveTranslation(data: any) {
    console.log('💾 Saving translation:', data);
    // TODO: Implement translation API and storage
  }

  private saveNote(data: any) {
    console.log('💾 Saving note:', data);
    // TODO: Implement note storage
  }

  private askAI(data: any) {
    console.log('🤖 Asking AI:', data);
    // TODO: Implement AI API call
  }

  show(position: DOMRect) {
    if (this.isVisible) return;

    document.body.appendChild(this.container);
    
    const popup = this.shadowRoot.querySelector('.form-popup') as HTMLElement;
    if (popup) {
      // Position the popup below the selection, similar to the first popup
      popup.style.top = `${position.bottom + window.scrollY + 10}px`;
      popup.style.left = `${position.left + window.scrollX + position.width / 2}px`;
      
      // Trigger animation
      requestAnimationFrame(() => {
        popup.classList.add('visible');
      });
    }

    this.isVisible = true;

    // Focus the input
    setTimeout(() => {
      const input = this.shadowRoot.getElementById('mainInput') as HTMLElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  hide() {
    if (!this.isVisible) return;

    const popup = this.shadowRoot.querySelector('.form-popup') as HTMLElement;
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
  }
}

// Global popup instances
let popupInstance: SelectPopup | null = null;

// function to show a popup with 3 clickable icons
function showPopup() {
  // Double-check that we have valid selection position and text
  if (!selectionPosition || !selectedText || selectedText.trim().length === 0) {
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