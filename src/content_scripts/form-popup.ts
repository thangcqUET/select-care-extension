/**
 * Form popup component for detailed input collection
 * Provides specialized forms for each action type (learn, note, chat)
 */

import { BasePopup, PopupOptions } from './base-popup';
import { ACTION_TYPES, Z_INDEX, TIMING } from './constants';
import { TextProcessor } from './text-processor';
import { SelectionDataCollector } from './data-collector';
import { SelectionActionHandler } from './action-handler';
import { TagInput } from './components/TagInput';
import { InputDetector } from './input-detector';

export interface FormPopupCallbacks {
  onSave?: (actionType: string, data: any) => void;
  onCancel?: () => void;
}

export class FormPopup extends BasePopup {
  private actionType: string;
  private selectedText: string;
  private tagInput?: TagInput;
  private dataCollector: SelectionDataCollector;
  private actionHandler: SelectionActionHandler;
  private callbacks: FormPopupCallbacks;

  constructor(
    actionType: string, 
    selectedText: string, 
    callbacks: FormPopupCallbacks = {},
    options: PopupOptions = {}
  ) {
    super({
      className: 'select-care-form-container',
      zIndex: Z_INDEX.FORM_POPUP,
      hideOnOutsideClick: true,
      ...options,
    });

    this.actionType = actionType;
    this.selectedText = selectedText;
    this.callbacks = callbacks;
    this.dataCollector = new SelectionDataCollector();
    this.actionHandler = new SelectionActionHandler();
  }

  protected setupContent(): void {
    const popup = document.createElement('div');
    popup.className = 'popup-base popup-column scale-form-enter';
    popup.style.minWidth = '280px';
    popup.style.maxWidth = '320px';
    popup.style.padding = '12px';

    // Add keyboard event listener for shortcuts
    popup.addEventListener("keydown", this.handleKeyDown.bind(this), true);

    // Build popup content
    popup.appendChild(this.createHeader());
    popup.appendChild(this.createTextDisplay());
    popup.appendChild(this.createInputSection());
    popup.appendChild(this.createActions());

    this.shadowRoot.appendChild(popup);
  }

  protected getComponentStyles(): string {
    return `
      .form-popup {
        z-index: ${Z_INDEX.FORM_POPUP};
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .form-popup.visible {
        transform: scale(1) translate(-50%, 0);
      }

      #commentSection {
        transition: all 0.2s ease;
      }
    `;
  }

  protected getPopupElement(): HTMLElement | null {
    return this.shadowRoot.querySelector('.popup-base');
  }

  /**
   * Create the popup header with icon and title
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'popup-header';

    const icon = document.createElement('span');
    icon.className = 'popup-icon';
    
    const title = document.createElement('span');

    const config = this.getActionConfig();
    icon.textContent = config.icon;
    title.textContent = config.title;

    header.appendChild(icon);
    header.appendChild(title);
    return header;
  }

  /**
   * Create the selected text display
   */
  private createTextDisplay(): HTMLElement {
    const textDisplay = document.createElement('div');
    textDisplay.className = 'selected-text-display';
    textDisplay.textContent = TextProcessor.truncateText(this.selectedText, 100);
    return textDisplay;
  }

  /**
   * Create the input section based on action type
   */
  private createInputSection(): HTMLElement {
    if (this.actionType === ACTION_TYPES.NOTE) {
      return this.createNoteInputSection();
    }
    return this.createSimpleInputSection();
  }

  /**
   * Create simple input for learn/chat actions
   */
  private createSimpleInputSection(): HTMLElement {
    const input = document.createElement('input');
    input.className = 'form-input';
    input.id = 'mainInput';

    const config = this.getActionConfig();
    input.placeholder = config.placeholder;
    if (config.defaultValue) {
      input.value = config.defaultValue;
    }

    return input;
  }

  /**
   * Create complex note input with tags and comment
   */
  private createNoteInputSection(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'mainInput';
    
    // Tags section
    const tagsSection = this.createTagsSection();
    
    // Comment section (initially hidden)
    const commentSection = this.createCommentSection();
    
    // Add comment button
    const addCommentButton = this.createAddCommentButton(commentSection);
    
    container.appendChild(tagsSection);
    container.appendChild(addCommentButton);
    container.appendChild(commentSection);
    
    return container;
  }

  /**
   * Create tags input section
   */
  private createTagsSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'form-section';
    
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = 'Tags:';
    
    this.tagInput = new TagInput({
      placeholder: 'Type tag name and press Enter...',
      maxTags: 10,
      allowDuplicates: false,
      onTagsChange: (tags) => {
        console.log('Tags changed:', tags);
      },
      onInputChange: (value) => {
        console.log('Input value changed:', value);
      },
      onInputFocus: () => {
        console.log('TagInput focused - user started typing');
      },
      onInputBlur: () => {
        console.log('TagInput lost focus');
      },
      onEnterEmpty: () => {
        this.handleAutoSave();
      }
    });
    
    section.appendChild(label);
    section.appendChild(this.tagInput.getElement());
    return section;
  }

  /**
   * Create comment section
   */
  private createCommentSection(): HTMLElement {
    const section = document.createElement('div');
    section.id = 'commentSection';
    section.className = 'form-section';
    section.style.display = 'none';
    
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = 'Comment:';
    
    const textarea = document.createElement('textarea');
    textarea.id = 'commentInput';
    textarea.className = 'form-input';
    textarea.placeholder = 'Add your notes or comments here...';
    textarea.style.minHeight = '60px';
    textarea.style.resize = 'vertical';
    
    // Handle keyboard shortcuts
    textarea.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        console.log('Ctrl+Enter pressed in comment - auto-saving');
        this.handleSave();
      }
    });
    
    // Prevent input events from affecting TagInput
    textarea.addEventListener('input', (event) => {
      event.stopPropagation();
    });
    
    // Auto-hide if empty
    textarea.addEventListener('blur', () => {
      setTimeout(() => {
        if (!textarea.value.trim()) {
          section.style.display = 'none';
          const addButton = this.shadowRoot.getElementById('addCommentButton');
          if (addButton) {
            addButton.style.display = 'block';
          }
        }
      }, 100);
    });
    
    section.appendChild(label);
    section.appendChild(textarea);
    return section;
  }

  /**
   * Create add comment button
   */
  private createAddCommentButton(commentSection: HTMLElement): HTMLElement {
    const button = document.createElement('button');
    button.id = 'addCommentButton';
    button.textContent = '+ Add Comment';
    button.type = 'button';
    button.className = 'btn-base btn-accent';
    button.style.fontSize = '12px';
    button.style.marginTop = '8px';
    
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Show comment section
      commentSection.style.display = 'block';
      button.style.display = 'none';
      
      // Focus textarea
      const textarea = commentSection.querySelector('#commentInput') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    });
    
    return button;
  }

  /**
   * Create action buttons
   */
  private createActions(): HTMLElement {
    const actions = document.createElement('div');
    actions.className = 'popup-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-base btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.handleCancel());

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-base btn-primary';
    saveBtn.textContent = this.getActionConfig().saveText;
    saveBtn.addEventListener('click', () => this.handleSave());

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    return actions;
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Always check if user is typing first
    if (!InputDetector.isUserTyping()) {
      console.log("User is not typing, skipping shortcut check.");
      return;
    }
    
    console.log("User is typing, checking for shortcuts...", event.key);
    
    // Don't interfere with comment typing
    if (InputDetector.isTypingInComment(this.shadowRoot)) {
      console.log("User is typing in comment textarea, not forwarding to TagInput");
      return;
    }
    
    // Handle single key shortcuts
    const isSingleKeyShortcut = event.key.length === 1 && 
                              !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
    
    if (isSingleKeyShortcut) {
      console.log("Single key shortcut detected:", event.key);
      event.preventDefault();
      event.stopPropagation();
      
      // Forward to TagInput or regular input
      if (this.actionType === ACTION_TYPES.NOTE && this.tagInput) {
        this.tagInput.dispatchKeyEvent(event.key, {
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey
        });
      } else {
        const inputField = this.shadowRoot.getElementById('mainInput') as HTMLInputElement;
        if (inputField) {
          inputField.value += event.key;
        }
      }
    }
  }

  /**
   * Handle auto-save when conditions are met
   */
  private handleAutoSave(): void {
    if (this.actionType !== ACTION_TYPES.NOTE) return;
    
    const commentTextarea = this.shadowRoot.getElementById('commentInput') as HTMLTextAreaElement;
    const commentText = commentTextarea?.value?.trim() || '';
    const tags = this.tagInput?.getTags() || [];
    
    if (tags.length > 0 || commentText.length > 0) {
      console.log('Auto-saving note with tags/comment');
      this.handleSave();
    }
  }

  /**
   * Handle save action
   */
  private async handleSave(): Promise<void> {
    const formData = this.dataCollector.collectFormData(
      this.actionType,
      this.selectedText,
      this.shadowRoot,
      this.tagInput
    );
    
    console.log(`Saving ${this.actionType} data:`, formData);
    
    try {
      await this.actionHandler.handleAction(this.actionType, formData);
      this.callbacks.onSave?.(this.actionType, formData);
    } catch (error) {
      console.error('Failed to save:', error);
    }
    
    this.hide();
  }

  /**
   * Handle cancel action
   */
  private handleCancel(): void {
    this.callbacks.onCancel?.();
    this.hide();
  }

  /**
   * Get action configuration
   */
  private getActionConfig() {
    const configs = {
      [ACTION_TYPES.LEARN]: {
        icon: '🌐',
        title: 'Learn it',
        saveText: 'Learn it',
        placeholder: 'Target language (e.g., English, Spanish)',
        defaultValue: 'English',
      },
      [ACTION_TYPES.NOTE]: {
        icon: '📌',
        title: 'Save Note',
        saveText: 'Save Note',
        placeholder: '',
        defaultValue: '',
      },
      [ACTION_TYPES.CHAT]: {
        icon: '🤖',
        title: 'Ask AI',
        saveText: 'Ask AI',
        placeholder: 'What would you like to ask?',
        defaultValue: '',
      },
    };
    
    return configs[this.actionType as keyof typeof configs] || configs[ACTION_TYPES.NOTE];
  }

  /**
   * Focus the appropriate input when shown
   */
  protected onShow(): void {
    setTimeout(() => {
      if (this.actionType === ACTION_TYPES.NOTE && this.tagInput) {
        this.tagInput.focus();
      } else {
        const input = this.shadowRoot.getElementById('mainInput') as HTMLElement;
        if (input) {
          input.focus();
        }
      }
    }, TIMING.FOCUS_DELAY);
  }

  /**
   * Clean up resources when hidden
   */
  protected onHide(): void {
    if (this.tagInput) {
      this.tagInput.destroy();
      this.tagInput = undefined;
    }
  }
}
