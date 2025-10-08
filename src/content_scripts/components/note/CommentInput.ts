/**
 * CommentInput Component
 * A reusable comment input component with expandable textarea and save shortcuts
 */

export interface CommentInputOptions {
  placeholder?: string;
  initialValue?: string;
  minHeight?: string;
  onCommentChange?: (value: string) => void;
  onCommentFocus?: () => void;
  onCommentBlur?: () => void;
  onSave?: () => void; // Called when Ctrl+Enter is pressed
  showButton?: boolean; // Whether to show "Add Comment" button initially
  buttonText?: string;
}

export class CommentInput {
  private container!: HTMLElement;
  private shadowRoot!: ShadowRoot;
  private options: CommentInputOptions;
  private commentSection!: HTMLElement;
  private commentTextarea!: HTMLTextAreaElement;
  private addCommentButton!: HTMLButtonElement;
  private isExpanded: boolean = false;

  constructor(options: CommentInputOptions = {}) {
    this.options = {
      placeholder: 'Add your notes or comments here...',
      initialValue: '',
      minHeight: '60px',
      showButton: true,
      buttonText: '+ Add Comment',
      ...options
    };

    this.createComponent();
    this.setupStyles();
    this.setupEventListeners();
    
    // Show expanded view immediately if there's initial value or showButton is false
    if (!this.options.showButton || this.options.initialValue) {
      this.expand();
    }
  }

  private createComponent() {
    this.container = document.createElement('div');
    this.container.className = 'comment-input-container';
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });

    // Create comment section (textarea and label)
    this.commentSection = document.createElement('div');
    this.commentSection.className = 'comment-section';
    this.commentSection.style.display = this.options.showButton ? 'none' : 'block';

    const commentLabel = document.createElement('label');
    commentLabel.textContent = 'Comment:';
    commentLabel.className = 'comment-label';

    this.commentTextarea = document.createElement('textarea');
    this.commentTextarea.className = 'comment-textarea form-input';
    this.commentTextarea.placeholder = this.options.placeholder || '';
    this.commentTextarea.value = this.options.initialValue || '';
    this.commentTextarea.style.minHeight = this.options.minHeight || '60px';

    this.commentSection.appendChild(commentLabel);
    this.commentSection.appendChild(this.commentTextarea);

    // Create "Add Comment" button
    this.addCommentButton = document.createElement('button');
    this.addCommentButton.className = 'add-comment-button';
    this.addCommentButton.textContent = this.options.buttonText || '+ Add Comment';
    this.addCommentButton.type = 'button';
    this.addCommentButton.style.display = this.options.showButton ? 'block' : 'none';

    // Assemble the component
    this.shadowRoot.appendChild(this.commentSection);
    this.shadowRoot.appendChild(this.addCommentButton);
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .comment-input-container {
        width: 100%;
      }

      .comment-section {
        width: 100%;
      }

      .comment-label {
        font-size: 12px;
        font-weight: 600;
        color: #000;
        display: block;
        margin-bottom: 4px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .comment-textarea {
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
        resize: vertical;
        transition: all 0.2s ease;
      }

      .comment-textarea::placeholder {
        color: rgba(0, 0, 0, 0.5);
      }

      .comment-textarea:focus {
        outline: none;
        border-color: rgba(63, 63, 63, 0.4);
        background: rgba(255, 255, 255, 0.8);
      }

      .add-comment-button {
        padding: 4px 8px;
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 6px;
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        margin-top: 8px;
        display: block;
      }

      .add-comment-button:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.5);
        transform: scale(1.02);
      }

      .add-comment-button:active {
        transform: scale(0.98);
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  private setupEventListeners() {
    // Button click to expand
    this.addCommentButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.expand();
    });

    // Textarea events
    this.commentTextarea.addEventListener('keydown', this.handleKeydown.bind(this));
    this.commentTextarea.addEventListener('input', this.handleInput.bind(this));
    this.commentTextarea.addEventListener('focus', this.handleFocus.bind(this));
    this.commentTextarea.addEventListener('blur', this.handleBlur.bind(this));

    // Custom event listener for synthesized keyboard events
    this.container.addEventListener('comment-input-keydown', (event: Event) => {
      this.handleCustomKeydown(event as CustomEvent);
    });
  }

  private handleKeydown(event: KeyboardEvent) {
    console.log("handle key down on comment input");
    
    // Prevent single key shortcuts from reaching the webpage
    const isSingleKeyShortcut = event.key.length === 1 && 
                              !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
    if (isSingleKeyShortcut) {
      event.stopPropagation(); // Prevent webpage shortcuts
    }
    
    this.processKeyEvent(event);
  }

  private processKeyEvent(keyData: { key: string, ctrlKey?: boolean, metaKey?: boolean, altKey?: boolean, shiftKey?: boolean } | KeyboardEvent) {
    const textarea = this.commentTextarea;
    
    // Extract key information
    const key = keyData.key;
    const ctrlKey = 'ctrlKey' in keyData ? keyData.ctrlKey : false;
    const metaKey = 'metaKey' in keyData ? keyData.metaKey : false;
    const altKey = 'altKey' in keyData ? keyData.altKey : false;

    if (key === 'Enter' && (ctrlKey || metaKey)) {
      if (keyData instanceof KeyboardEvent) {
        keyData.preventDefault();
      }
      // Trigger save callback for Ctrl+Enter
      this.options.onSave?.();
      return;
    }

    // For custom events, insert the character at the caret/selection
    if (!(keyData instanceof KeyboardEvent) && key.length === 1 && !ctrlKey && !metaKey && !altKey) {
      try {
        const start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : textarea.value.length;
        const end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : start;
        const newVal = textarea.value.slice(0, start) + key + textarea.value.slice(end);
        textarea.value = newVal;
        // restore caret after insertion
        const caretPos = (start || 0) + key.length;
        try { textarea.focus(); textarea.selectionStart = textarea.selectionEnd = caretPos; } catch (e) { /* ignore */ }
        this.options.onCommentChange?.(textarea.value);
      } catch (e) {
        // fallback to append if anything goes wrong
        textarea.value += key;
        this.options.onCommentChange?.(textarea.value);
      }
    }
  }

  private handleCustomKeydown(event: CustomEvent) {
    console.log("handle custom key down on tag input", event.detail);
    
    // Process the synthesized keyboard event
    this.processKeyEvent(event.detail);
  }

  private handleInput(event: Event) {
    event.stopPropagation();
    this.options.onCommentChange?.(this.commentTextarea.value);
  }

  private handleFocus() {
    console.log('CommentInput focused');
    this.options.onCommentFocus?.();
  }
  
  private handleBlur() {
    console.log('CommentInput blurred');
    this.options.onCommentBlur?.();
    
    // Auto-collapse if empty and button was originally shown
    if (this.options.showButton && !this.commentTextarea.value.trim()) {
      setTimeout(() => {
        if (!this.commentTextarea.value.trim()) {
          this.collapse();
        }
      }, 100); // Small delay to allow for focus changes
    }
  }

  private expand() {
    this.isExpanded = true;
    this.commentSection.style.display = 'block';
    this.addCommentButton.style.display = 'none';
    
    // Focus the textarea
    setTimeout(() => {
      this.commentTextarea.focus();
    }, 0);
  }

  private collapse() {
    if (!this.options.showButton) return; // Don't collapse if button shouldn't be shown
    
    this.isExpanded = false;
    this.commentSection.style.display = 'none';
    this.addCommentButton.style.display = 'block';
  }

  // Public API
  public getValue(): string {
    return this.commentTextarea.value;
  }

  public setValue(value: string) {
    this.commentTextarea.value = value;
    this.options.onCommentChange?.(value);
    
    // Expand if value is set and button is shown
    if (value.trim() && this.options.showButton && !this.isExpanded) {
      this.expand();
    }
  }

  public focus() {
    if (!this.isExpanded) {
      this.expand();
    } else {
      this.commentTextarea.focus();
    }
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public clear() {
    this.commentTextarea.value = '';
    this.options.onCommentChange?.('');
    
    if (this.options.showButton) {
      this.collapse();
    }
  }

  public setPlaceholder(placeholder: string) {
    this.commentTextarea.placeholder = placeholder;
  }

  public isVisible(): boolean {
    return this.isExpanded || !this.options.showButton;
  }

  public isFocused(): boolean {
    return this.shadowRoot.activeElement === this.commentTextarea;
  }

  /**
   * Send a synthesized keyboard event to the CommentInput
   * This allows the parent to trigger keyboard events without them being intercepted by event.preventDefault()
   */
  public dispatchKeyEvent(key: string, options: { ctrlKey?: boolean, metaKey?: boolean, altKey?: boolean, shiftKey?: boolean } = {}) {
    const customEvent = new CustomEvent('comment-input-keydown', {
      detail: { key, ...options }
    });
    this.container.dispatchEvent(customEvent);
  }

  public destroy() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
