import { convertToSelection } from './data_mapper';
import { throttle } from './utils';
import { TagInput } from './components/TagInput';


let selectedText : string | undefined;
let selectionPosition: DOMRect | undefined;
let savedSelectedText: string | undefined;

// Function to check if user is currently typing in an input field
function isUserTyping(): boolean {
  const activeElement = document.activeElement;
  console.log(activeElement);
  if (!activeElement) return false;
  
  // Check if it's an input field, textarea, or content editable
  const isFormContainer = activeElement.classList.contains('select-care-form-container')
  const isTagInputField = activeElement.classList.contains('tag-input-field')
  
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true' ||
                           activeElement.getAttribute('contenteditable') === '';
  
  const isEditableDiv = activeElement.getAttribute('role') === 'textbox';
  
  // Check if it's a typing-related input type
  const inputType = (activeElement as HTMLInputElement).type;
  const isTypingInput = !inputType || 
                       ['text', 'email', 'password', 'search', 'url', 'tel'].includes(inputType);
  console.log({
    isFormContainer,
    isTagInputField,
    isContentEditable,
    isEditableDiv,
    isTypingInput
  })
  return (isFormContainer && isTypingInput) || isTagInputField || isContentEditable || isEditableDiv;
}

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
  // console.log('Selected text:', selectedText);
  // if (selectedText) {
  //   // show a popup beside the mouse with a emoji and the selected text
  //   console.log(`${selectedText}`);
  // }
}, 10));

//listen mouse down event
// document.addEventListener('mousedown', (event: MouseEvent) => {
//   console.log('Mouse down at:', event.clientX, event.clientY);
// });

//listen mouse up event
document.addEventListener('mouseup', () => {
  // console.log('Mouse up at:', event.clientX, event.clientY);
  
  // Don't show popup if user is typing in an input field
  if (isUserTyping()) {
    console.log('User is typing, skipping popup');
    return;
  }
  
  // Only show popup if there's actual trimmed text content
  if (selectedText && selectedText.length > 0) {
    showPopup();
    savedSelectedText = selectedText;
    // selectedText = undefined;
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
    const textToProcess = savedSelectedText || '';

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
    this.hide();
  }

  private handleLearnAction(text: string) {
    // console.log('🌐 Opening learn form for:', text);
    const formPopup = new FormPopup('learn', text);
    if (selectionPosition) {
      formPopup.show(selectionPosition);
    }
  }

  private handleNoteAction(text: string) {
    // console.log('📌 Opening note form for:', text);
    const formPopup = new FormPopup('note', text);
    if (selectionPosition) {
      formPopup.show(selectionPosition);
    }
  }

  private handleAiAction(text: string) {
    // console.log('🤖 Opening AI form for:', text);
    const formPopup = new FormPopup('chat', text);
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
  private tagInput?: TagInput; // Tag input component instance

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
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        
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
      case 'learn':
        icon.textContent = '🌐';
        title.textContent = 'Learn it';
        break;
      case 'note':
        icon.textContent = '📌';
        title.textContent = 'Save Note';
        break;
      case 'chat':
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
    // Add keyboard event listener to prevent shortcuts when typing
    popup.addEventListener("keydown", (event: KeyboardEvent) => {
      // Always check if user is typing first
      if (!isUserTyping()) {
        console.log("User is not typing, skipping shortcut check.");
        return;
      }
      console.log("User is typing, checking for shortcuts...", event.key);
      
      // Check if this is a single shortcut
      const isSingleKeyShortcut = event.key.length === 1 && 
                                !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
      console.log("Single key shortcut detected:", event.key);
      if (isSingleKeyShortcut) {
        // Stop the event from reaching the webpage's shortcut handlers
        event.preventDefault();
        event.stopPropagation();
        
        // For tag input (note action), send custom event to TagInput component
        if (this.actionType === 'note' && this.tagInput) {
          this.tagInput.dispatchKeyEvent(event.key, {
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey
          });
        } else {
          // For regular input fields, add text directly
          const inputField = this.shadowRoot.getElementById('mainInput') as HTMLInputElement;
          if (inputField) {
            inputField.value += event.key;
          }
        }
      }
    }, true); // Use capture phase to catch events early
    // Hide when clicking outside
    document.addEventListener('click', this.handleOutsideClick, true);
  }

  private createSimpleInput(): HTMLElement {
    if (this.actionType === 'note') {
      return this.createTagInputComponent();
    }

    const input = document.createElement('input');
    input.className = 'form-input';
    input.id = 'mainInput';

    switch (this.actionType) {
      case 'learn':
        input.placeholder = 'Target language (e.g., English, Spanish)';
        input.value = 'English';
        break;
      case 'chat':
        input.placeholder = 'What would you like to ask?';
        break;
    }

    return input;
  }

  private createTagInputComponent(): HTMLElement {
    this.tagInput = new TagInput({
      placeholder: 'Type tag name and press Enter...',
      maxTags: 10,
      allowDuplicates: false,
      onTagsChange: (tags) => {
        console.log('Tags changed:', tags);
      },
      onInputChange: (value) => {
        console.log('Input value changed:', value);
        // Handle the input change - this means user is actively typing
        if (value.length > 0) {
          console.log('User is typing in TagInput:', value);
        }
      },
      onInputFocus: () => {
        console.log('TagInput focused - user started typing');
      },
      onInputBlur: () => {
        console.log('TagInput lost focus');
      }
    });

    const container = document.createElement('div');
    container.id = 'mainInput';
    container.appendChild(this.tagInput.getElement());

    return container;
  }

  private handleOutsideClick = (event: Event) => {
    if (!this.container.contains(event.target as Node)) {
      this.hide();
    }
  };

  private getSaveButtonText(): string {
    switch (this.actionType) {
      case 'learn':
        return 'Learn it';
      case 'note':
        return 'Save Note';
      case 'chat':
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
      case 'learn':
        this.saveLearn(formData);
        break;
      case 'note':
        this.saveNote(formData);
        break;
      case 'chat':
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
    let inputValue = '';
    if (this.actionType === 'note') {
      // For tags, get from TagInput component
      if (this.tagInput) {
        const tags = this.tagInput.getTags();
        // Add hidden function tag for note
        const allTags = ['fn_note', ...(tags.length > 0 ? tags : ['general'])];
        data.tags = allTags;
        data.tagCount = tags.length; // Don't count the hidden tag
      } else {
        data.tags = ['fn_note', 'general'];
        data.tagCount = 0;
      }
    } else {
      // For other inputs, get from main input
      const mainInput = this.shadowRoot.getElementById('mainInput') as HTMLInputElement;
      inputValue = mainInput?.value || '';
    }

    // Set data based on action type
    switch (this.actionType) {
      case 'learn':
        data.targetLanguage = inputValue || 'English';
        data.sourceLanguage = 'auto';
        // Add hidden function tag for learn
        data.tags = ['fn_learn'];
        break;
      case 'note':
        // Tags already handled above with fn_note
        break;
      case 'chat':
        data.question = inputValue || 'Explain this text';
        // Add hidden function tag for AI
        data.tags = ['fn_ai'];
        break;
    }

    return data;
  }

  private async saveLearn(data: any) {
    console.log('💾 Saving learn data:', data);
    // TODO: Implement learn API and storage
    let learnSelection = convertToSelection(data);
    console.log('Created learn selection:', learnSelection);
    const response = await chrome.runtime.sendMessage({
      action: 'learn',
      data: learnSelection
    });
    console.log('Response from background:', response);
  }

  private async saveNote(data: any) {
    console.log('💾 Saving note:', data);
    console.log('📋 Parsed tags:', data.tags);
    console.log('🏷️ Tag count:', data.tagCount);
    
    // TODO: Implement note storage
    let noteSelection = convertToSelection(data);
    console.log('Created note selection:', noteSelection);
    const response = await chrome.runtime.sendMessage({
      action: 'note',
      data: noteSelection
    });
    console.log('Response from background:', response);
  }

  private async askAI(data: any) {
    console.log('🤖 Asking AI:', data);
    // TODO: Implement AI API call
    let chatSelection = convertToSelection(data);
    const response = await chrome.runtime.sendMessage({
      action: 'chat',
      data: chatSelection
    });
    console.log('Response from background:', response);
  }

  show(position: DOMRect) {
    if (this.isVisible) return;
    document.body.appendChild(this.container);
    
    const popup = this.shadowRoot.querySelector('.form-popup') as HTMLElement;
    if (popup) {
      // Position the popup below the selection, similar to the first popup
      popup.style.top = `${position.bottom + 10}px`;
      popup.style.left = `${position.left + position.width / 2}px`;
      
      // Trigger animation
      requestAnimationFrame(() => {
        popup.classList.add('visible');
      });
    }

    this.isVisible = true;

    // Focus the input
    setTimeout(() => {
      if (this.actionType === 'note' && this.tagInput) {
        this.tagInput.focus();
      } else {
        const input = this.shadowRoot.getElementById('mainInput') as HTMLElement;
        if (input) {
          input.focus();
        }
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
        // Clean up TagInput component
        if (this.tagInput) {
          this.tagInput.destroy();
          this.tagInput = undefined;
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