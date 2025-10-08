/**
 * TagInput Component
 * A reusable tag input component with visual chips, editing, and keyboard navigation
 */

export interface TagInputOptions {
  placeholder?: string;
  initialTags?: string[];
  maxTags?: number;
  allowDuplicates?: boolean;
  onTagsChange?: (tags: string[]) => void;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string, index: number) => void;
  onInputChange?: (value: string) => void;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  onEnterEmpty?: () => void; // Called when Enter is pressed with empty input but tags exist
}

export class TagInput {
  private container!: HTMLElement;
  private shadowRoot!: ShadowRoot;
  private tags: string[] = [];
  private editingTagIndex: number = -1;
  private options: TagInputOptions;
  private hiddenInput!: HTMLInputElement;
  private textInput!: HTMLInputElement;

  constructor(options: TagInputOptions = {}) {
    this.options = {
      placeholder: 'Type tag and press Enter...',
      initialTags: [],
      maxTags: 20,
      allowDuplicates: false,
      ...options
    };

    this.tags = [...(this.options.initialTags || [])];
    this.createComponent();
    this.setupStyles();
    this.setupEventListeners();
    this.renderTags();
  }

  private createComponent() {
    this.container = document.createElement('div');
    this.container.className = 'tag-input-container';
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });

    // Hidden input to store tag values
    this.hiddenInput = document.createElement('input');
    this.hiddenInput.type = 'hidden';
    this.hiddenInput.className = 'tags-value';

    // Text input for typing new tags
    this.textInput = document.createElement('input');
    this.textInput.className = 'tag-input-field';
    this.textInput.placeholder = this.options.placeholder || '';

    const wrapper = document.createElement('div');
    wrapper.className = 'tag-input-wrapper';
    wrapper.appendChild(this.hiddenInput);
    wrapper.appendChild(this.textInput);

    this.shadowRoot.appendChild(wrapper);
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .tag-input-wrapper {
        position: relative;
        width: 100%;
        min-height: 32px;
        border: 1px solid rgba(63, 63, 63, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(5px);
        padding: 4px 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
        box-sizing: border-box;
        cursor: text;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .tag-input-wrapper:focus-within {
        border-color: rgba(63, 63, 63, 0.4);
        background: rgba(255, 255, 255, 0.8);
      }

      .tag-chip {
        display: inline-flex;
        align-items: center;
        background: rgba(54, 162, 235, 0.8);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        max-width: 120px;
        position: relative;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(54, 162, 235, 0.3);
        animation: slideIn 0.2s ease-out;
      }

      .tag-chip.editing {
        background: rgba(255, 193, 7, 0.8);
        border-color: rgba(255, 193, 7, 0.3);
      }

      .tag-text {
        max-width: 90px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
      }

      .tag-text:hover {
        text-decoration: underline;
      }

      .tag-remove {
        margin-left: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 10px;
        opacity: 0.7;
        width: 12px;
        height: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.15s ease;
      }

      .tag-remove:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .tag-input-field {
        border: none;
        outline: none;
        background: transparent;
        flex: 1;
        min-width: 80px;
        font-size: 13px;
        color: #000;
        font-family: inherit;
        padding: 2px 4px;
      }

      .tag-input-field::placeholder {
        color: rgba(0, 0, 0, 0.5);
      }

      .tag-edit-input {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 193, 7, 0.8);
        border-radius: 10px;
        padding: 1px 6px;
        font-size: 11px;
        color: #000;
        outline: none;
        min-width: 40px;
        max-width: 100px;
        font-family: inherit;
      }

      .tags-value {
        display: none;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .tag-chip.removing {
        animation: slideOut 0.2s ease-in forwards;
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.8);
        }
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  private setupEventListeners() {
    // Text input events
    this.textInput.addEventListener('keydown', this.handleKeydown.bind(this));
    this.textInput.addEventListener('input', this.handleInput.bind(this));
    this.textInput.addEventListener('focus', this.handleFocus.bind(this));
    this.textInput.addEventListener('blur', this.handleBlur.bind(this));

    // Custom event listener for synthesized keyboard events
    this.container.addEventListener('tag-input-keydown', (event: Event) => {
      this.handleCustomKeydown(event as CustomEvent);
    });

    // Container click to focus input
    const wrapper = this.shadowRoot.querySelector('.tag-input-wrapper') as HTMLElement;
    wrapper.addEventListener('click', (e) => {
      if (e.target === wrapper) {
        this.textInput.focus();
      }
    });
  }

  private handleKeydown(event: KeyboardEvent) {
    console.log("handle key down on tag input");
    
    // Prevent single key shortcuts from reaching the webpage
    const isSingleKeyShortcut = event.key.length === 1 && 
                              !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
    if (isSingleKeyShortcut) {
      event.stopPropagation(); // Prevent webpage shortcuts
    }
    
    this.processKeyEvent(event);
  }

  private handleCustomKeydown(event: CustomEvent) {
    console.log("handle custom key down on tag input", event.detail);
    
    // Process the synthesized keyboard event
    this.processKeyEvent(event.detail);
  }

  private processKeyEvent(keyData: { key: string, ctrlKey?: boolean, metaKey?: boolean, altKey?: boolean, shiftKey?: boolean } | KeyboardEvent) {
    const input = this.textInput;
    const value = input.value; // Don't trim here to preserve spaces in tags
    
    // Extract key information
    const key = keyData.key;
    const ctrlKey = 'ctrlKey' in keyData ? keyData.ctrlKey : false;
    const metaKey = 'metaKey' in keyData ? keyData.metaKey : false;
    const altKey = 'altKey' in keyData ? keyData.altKey : false;

    if (key === 'Enter') {
      if (keyData instanceof KeyboardEvent) {
        keyData.preventDefault();
      }
      // Create tag from any non-empty text
      const tagText = value.trim();
      if (tagText.length > 0) {
        this.addTag(tagText);
        input.value = '';
        this.options.onInputChange?.(''); // Notify input cleared
      } else if (this.tags.length > 0) {
        // If input is empty but we have tags, trigger the onEnterEmpty callback
        this.options.onEnterEmpty?.();
      }
      return;
    }

    if (key === 'Backspace') {
      if (value.length === 0 && this.tags.length > 0) {
        if (keyData instanceof KeyboardEvent) {
          keyData.preventDefault();
        }
        this.removeTag(this.tags.length - 1);
      }
      return;
    }

    if (key === 'Escape') {
      if (this.editingTagIndex !== -1) {
        if (keyData instanceof KeyboardEvent) {
          keyData.preventDefault();
        }
        this.editingTagIndex = -1;
        this.renderTags();
      }
      return;
    }

    // For custom events, we need to manually add the character to the input
    if (!(keyData instanceof KeyboardEvent) && key.length === 1 && !ctrlKey && !metaKey && !altKey) {
      input.value += key;
    //   this.options.onInputChange?.(input.value);
    }
  }

  private handleInput(event: Event) {
    const input = event.target as HTMLInputElement;

    // No automatic space-based tag creation since we want to preserve spaces in tags
    // Tags are only created when user presses Enter after typing #tag
    
    // Trigger input change callback
    this.options.onInputChange?.(input.value);
  }

  private handleFocus() {
    console.log('TagInput focused');
    this.options.onInputFocus?.();
  }

  private handleBlur() {
    console.log('TagInput blurred');
    this.options.onInputBlur?.();
  }

  private addTag(tagText: string): boolean {
    const cleanTag = tagText.trim();
    
    // Validation
    if (cleanTag.length === 0) return false;
    if (this.tags.length >= (this.options.maxTags || 20)) return false;
    if (!this.options.allowDuplicates && this.tags.includes(cleanTag)) return false;

    this.tags.push(cleanTag);
    this.renderTags();
    this.updateHiddenInput();
    
    // Trigger callbacks
    this.options.onTagAdd?.(cleanTag);
    this.options.onTagsChange?.(this.tags);
    
    return true;
  }

  private removeTag(index: number): boolean {
    if (index < 0 || index >= this.tags.length) return false;

    const removedTag = this.tags[index];
    
    // Add animation class before removing
    const chip = this.shadowRoot.querySelectorAll('.tag-chip')[index] as HTMLElement;
    if (chip) {
      chip.classList.add('removing');
      setTimeout(() => {
        this.tags.splice(index, 1);
        this.renderTags();
        this.updateHiddenInput();
        
        // Trigger callbacks
        this.options.onTagRemove?.(removedTag, index);
        this.options.onTagsChange?.(this.tags);
      }, 200);
    } else {
      this.tags.splice(index, 1);
      this.renderTags();
      this.updateHiddenInput();
      
      // Trigger callbacks
      this.options.onTagRemove?.(removedTag, index);
      this.options.onTagsChange?.(this.tags);
    }
    
    return true;
  }

  private editTag(index: number) {
    if (index < 0 || index >= this.tags.length) return;
    this.editingTagIndex = index;
    this.renderTags();
  }

  private finishEditTag(index: number, newValue: string) {
    const cleanValue = newValue.trim();
    
    if (cleanValue.length > 0 && 
        (this.options.allowDuplicates || !this.tags.includes(cleanValue) || this.tags[index] === cleanValue)) {
      this.tags[index] = cleanValue;
    }
    
    this.editingTagIndex = -1;
    this.renderTags();
    this.updateHiddenInput();
    this.options.onTagsChange?.(this.tags);
  }

  private renderTags() {
    const wrapper = this.shadowRoot.querySelector('.tag-input-wrapper') as HTMLElement;
    if (!wrapper) return;

    // Clear existing chips (keep inputs)
    const existingChips = wrapper.querySelectorAll('.tag-chip');
    existingChips.forEach(chip => chip.remove());

    // Add tag chips before the text input
    this.tags.forEach((tag, index) => {
      const chip = document.createElement('div');
      chip.className = `tag-chip ${index === this.editingTagIndex ? 'editing' : ''}`;

      if (index === this.editingTagIndex) {
        // Create edit input
        const editInput = document.createElement('input');
        editInput.className = 'tag-edit-input';
        editInput.value = tag;
        editInput.addEventListener('blur', () => this.finishEditTag(index, editInput.value));
        editInput.addEventListener('keydown', (e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            this.finishEditTag(index, editInput.value);
          } else if (e.key === 'Escape') {
            this.editingTagIndex = -1;
            this.renderTags();
          }
        });

        chip.appendChild(editInput);
        
        // Focus the edit input after rendering
        setTimeout(() => {
          editInput.focus();
          editInput.select();
        }, 0);
      } else {
        // Create normal tag display
        const tagText = document.createElement('span');
        tagText.className = 'tag-text';
        tagText.textContent = tag;
        tagText.title = `Click to edit "${tag}"`;
        tagText.addEventListener('click', () => this.editTag(index));

        const removeBtn = document.createElement('span');
        removeBtn.className = 'tag-remove';
        removeBtn.textContent = '×';
        removeBtn.title = `Remove "${tag}"`;
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeTag(index);
        });

        chip.appendChild(tagText);
        chip.appendChild(removeBtn);
      }

      wrapper.insertBefore(chip, this.textInput);
    });
  }

  private updateHiddenInput() {
    this.hiddenInput.value = this.tags.join(',');
  }

  // Public API
  public getTags(): string[] {
    return [...this.tags];
  }

  public setTags(tags: string[]) {
    this.tags = [...tags];
    this.renderTags();
    this.updateHiddenInput();
    this.options.onTagsChange?.(this.tags);
  }

  public addTagProgrammatically(tag: string): boolean {
    return this.addTag(tag);
  }

  public removeTagProgrammatically(index: number): boolean {
    return this.removeTag(index);
  }

  public clearTags() {
    this.tags = [];
    this.renderTags();
    this.updateHiddenInput();
    this.options.onTagsChange?.(this.tags);
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public getValue(): string {
    return this.hiddenInput.value;
  }

  /**
   * Send a synthesized keyboard event to the TagInput
   * This allows the parent to trigger keyboard events without them being intercepted by event.preventDefault()
   */
  public dispatchKeyEvent(key: string, options: { ctrlKey?: boolean, metaKey?: boolean, altKey?: boolean, shiftKey?: boolean } = {}) {
    const customEvent = new CustomEvent('tag-input-keydown', {
      detail: { key, ...options }
    });
    this.container.dispatchEvent(customEvent);
  }

  /**
   * Get current input value for debugging
   */
  public getCurrentInputValue(): string {
    return this.textInput.value;
  }

  public focus() {
    this.textInput.focus();
  }

  public isFocused(): boolean {
    return this.shadowRoot.activeElement === this.textInput;
  }

  public setPlaceholder(placeholder: string) {
    this.textInput.placeholder = placeholder;
  }

  public destroy() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
