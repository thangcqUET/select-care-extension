import { TagInput } from './TagInput';
import { CommentInput } from './CommentInput';
import { convertToSelection } from '../data_mapper';
import { isUserTyping, debounce } from '../utils';
import React from 'react';
import { createRoot } from 'react-dom/client';
import LearnInput from './learn/LearnInput';

export class FormPopup {
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private isVisible: boolean = false;
  // React root for the learn UI so we can unmount later
  private _learnReactRoot?: ReturnType<typeof createRoot>;
  // optional implementation hook set when the learn UI is created
  // private _ensurePartsImpl?: (parts: string[]) => void;
  // Public API: ensure the popup has tabs/badges for the given parts
  // public ensureParts(parts: string[]) {
  //   if (this._ensurePartsImpl) return this._ensurePartsImpl(parts);
  //   return;
  // }
  // anchor point in document coordinates (pixels) used to position popup
  private anchorDocX?: number;
  private anchorDocY?: number;
  private repositionHandler?: () => void;
  private resizeHandler?: () => void;
  private actionType: string;
  private selectedText: string;
  private tagInput?: TagInput; // Tag input component instance
  private commentInput?: CommentInput; // Comment input component instance

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
        /* animate left/top for a gentle movement when repositioning; keep opacity and transform transitions for show/hide */
  transition: left 180ms ease, top 180ms ease, opacity 220ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: left, top, transform, opacity;
        /* utility class to set position or initial placement without transition */
        transition: left 180ms ease, top 180ms ease, opacity 220ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
        will-change: left, top, transform, opacity;
        /* ensure popup stays above page content and receives pointer events */
        z-index: 10001;
        pointer-events: auto;
        width: 320px;
        box-sizing: border-box;
        /* allow flex children to shrink below their content width */
        > * { min-width: 0; }
        /* ensure long words or data URLs don't expand the popup */
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      .form-popup.no-transition {
        transition: none !important;
      }

      .form-popup.visible {
        opacity: 1;
        transform: scale(1) translate(-50%, 0);
      }

          /* no-transition removed: reposition now uses instant left/top placement via CSS transition change */

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
        word-break: break-word;
      }

      .tags-section {
        padding: 12px;
        background: rgba(54, 162, 235, 0.08);
        border: 1px solid rgba(54, 162, 235, 0.2);
        border-radius: 8px;
        backdrop-filter: blur(5px);
        position: relative;
      }

      .tags-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, rgba(54, 162, 235, 0.3), rgba(54, 162, 235, 0.1));
        border-radius: 8px 8px 0 0;
      }

      

      #learn input
      .learn-root { max-width: 320px; width: 100%; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #000; overflow: visible; }
.translate-controls { display:flex; gap:8px; align-items:center; }
.translate-controls select { flex:1; padding:6px 8px; border-radius:8px; border:1px solid rgba(63,63,63,0.12); background: rgba(255,255,255,0.6); }
.badges { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
.badge { padding:6px 8px; border-radius:999px; background: rgba(0,0,0,0.04); cursor:pointer; font-size:12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; border: none; }
.badge.active { border: 1px solid rgba(63,63,63,0.2); }
.tabs { margin-top:8px; }
.meanings-wrap { width: 100%; max-width: 100%; max-height: 250px; overflow-y: auto; padding-right: 6px; box-sizing: border-box; scroll-behavior: smooth; scroll-padding: 8px; }
/* hide native scrollbars while preserving scroll behavior */
.meanings-wrap::-webkit-scrollbar { width: 0; height: 0; }
.meanings-wrap { -ms-overflow-style: none; /* IE and Edge */ scrollbar-width: none; /* Firefox */ }
.meanings-wrap::-webkit-scrollbar-thumb { background: transparent; }
/* ensure flex children inside meanings don't force width expansion */
.meanings-wrap > .meaning { min-width: 0; }
.tab { display:none; }
.tab.active { display:block; }
.meaning { border:1px solid rgba(63,63,63,0.12); border-radius:12px; padding:8px; padding-top:6px; margin-bottom:8px; background: rgba(255,255,255,0.4); backdrop-filter: blur(5px); box-sizing:border-box; position: relative; }
.meaning .title { display:flex; gap:8px; align-items:center; cursor:default; justify-content:space-between; }
.meaning .title .left { display:flex; align-items:center; gap:8px; flex:1 1 auto; min-width:0; }
.meaning .title .right { display:flex; gap:6px; flex:0 0 auto; align-items:center; }
/* concise title text that truncates with ellipsis */
.title-text { font-weight: 500; margin-right: 8px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meaning .body { margin-top:8px; display:none; }
.meaning.expanded .body { display:block; }
.form-input { width:100%; max-width:100%; padding:6px 10px; border-radius:8px; border:1px solid rgba(63,63,63,0.2); background: rgba(255,255,255,0.6); margin-bottom:8px; box-sizing:border-box; font-size:13px; min-width:0; overflow-wrap:anywhere; }
/* Title input (shorter height, bold) */
.meaning .title .form-input { padding:8px 12px; font-weight:600; border-radius:10px; }
.form-input:focus { outline:none; border-color: rgba(63,63,63,0.36); background: rgba(255,255,255,0.8); }
.form-actions { display:flex; gap:8px; margin-top:6px; flex-wrap:wrap; }
.form-button { flex: 0 0 auto; padding:6px 10px; border-radius:8px; border:1px solid rgba(63,63,63,0.12); background: rgba(255,255,255,0.6); cursor:pointer; white-space:nowrap; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;}
.form-button.small { padding:6px 8px; font-size:12px; }
.form-button.primary { background: linear-gradient(90deg,#7c3aed,#06b6d4); color:#fff; border:none; }
.form-button-marked { color: white; border: none; }
.mark-wrap { position: relative; display: inline-flex; align-items: center; }
.mark-wrap .tooltip { display: none; position: absolute; top: 50%; left: auto; right: calc(100% + 8px); transform: translateY(-50%); background: rgba(0,0,0,0.85); color: #fff; padding:6px 8px; border-radius:6px; font-size:12px; white-space:nowrap; z-index:2147483647; pointer-events: none; }
.mark-wrap:hover .tooltip { display: block; }
.mark-wrap .check { font-size:14px; line-height:1; display:inline-block; }
.toggle-icon { font-size:14px; display:inline-block; }
.syn-list { margin-top:8px; font-size:13px; color:rgba(0,0,0,0.75); }
.small { font-size:12px; color:rgba(0,0,0,0.6); }
/* Loading / skeleton styles for async dictionary fetch */
.learn-loading { display:flex; flex-direction:column; gap:8px; padding:8px 0; }
.learn-loading .skeleton-line { height:12px; background:linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06)); border-radius:6px; position:relative; overflow:hidden; }
.learn-loading .skeleton-line::after { content: ''; position: absolute; top:0; left:-150%; height:100%; width:150%; background: linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.35), rgba(255,255,255,0.0)); transform: skewX(-20deg); }
.learn-loading .skeleton-line.short { width:35%; }
.learn-loading .skeleton-line.medium { width:60%; }
.learn-loading .skeleton-line.long { width:90%; }
@keyframes shimmer {
  0% { transform: translateX(-150%) skewX(-20deg); }
  100% { transform: translateX(150%) skewX(-20deg); }
}
.learn-loading .skeleton-line.animated::after { animation: shimmer 1.1s linear infinite; }
.no-results { margin-top:8px; padding:8px; border-radius:8px; background: rgba(255,255,255,0.2); border:1px dashed rgba(63,63,63,0.08); font-size:13px; color: rgba(0,0,0,0.6); }

@media (prefers-reduced-motion: reduce) {
  .meanings-wrap { scroll-behavior: auto; }
}






    </style>
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
      if (!isUserTyping()) return;

      // Check if the user is typing in comment input or tag input
      let typingIn = 0b00;
      const commentCode = 0b01;
      const tagCode = 0b10;
      if (this.commentInput && this.commentInput.isFocused()) {
        typingIn |= commentCode;
      }
      if (this.tagInput && this.tagInput.isFocused()) {
        typingIn |= tagCode;
      }

      // Check if this is a single character key (we handle these locally)
      const isSingleKeyShortcut = event.key.length === 1 && 
                                !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
      if (isSingleKeyShortcut) {
        // Stop the event from reaching the webpage's shortcut handlers
        event.preventDefault();
        event.stopPropagation();

        // Forward the keystroke to the appropriate input helper when relevant
        if (this.actionType === 'note' && this.tagInput && (typingIn & tagCode) === tagCode) {
          this.tagInput.dispatchKeyEvent(event.key, {
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey
          });
        } else if (this.actionType === 'note' && this.commentInput && (typingIn & commentCode) === commentCode) {
          this.commentInput.dispatchKeyEvent(event.key, {
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey
          });
        }
      }
    }, true); // Use capture phase to catch events early
    // Hide when clicking outside
    document.addEventListener('click', this.handleOutsideClick, true);
  }

  private createSimpleInput(): HTMLElement {
    if (this.actionType === 'note') {
      return this.createNoteInputComponent();
    }

    if (this.actionType === 'learn'){
      return this.createLearnInputComponent();
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

  private cleanText(text: string): string {
    // Remove excessive line breaks and empty lines, keeping only single line breaks
    return text
      // Replace multiple consecutive line breaks with single line break
      .replace(/\n{2,}/g, '\n')
      // Replace multiple consecutive spaces with single space
      .replace(/ {2,}/g, ' ')
      // Trim whitespace from start and end
      .trim();
  }

  private createNoteInputComponent(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'mainInput';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    
    // Create tags section
    const tagsSection = this.createTagsSection();
    
    // Create comment section
    const commentSection = this.createCommentSection();
    
    container.appendChild(tagsSection);
    container.appendChild(commentSection);
    
    return container;
  }

  private createLearnInputComponent(): HTMLElement {
    // Create root container for learn UI (no nested shadow; FormPopup already uses a shadow)
    const container = document.createElement('div');
    container.id = 'mainInput';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    // Create a host element where React will mount (direct child of container)
    const host = document.createElement('div');
    host.id = 'learn-root-host';
    container.appendChild(host);

    // Mount the React component into the host
    try {
      this._learnReactRoot = createRoot(host);
      this._learnReactRoot.render(
        React.createElement(LearnInput, {
          selectedText: this.selectedText,
          // onEnsureParts: (parts: string[]) => {
          //   try { this.ensureParts(parts); } catch (e) { /* ignore */ }
          // }
        })
      );
    } catch (err) {
      // If React mounting fails, fall back to a simple message so the UI remains usable
      const errEl = document.createElement('div');
      errEl.className = 'no-results';
      errEl.textContent = 'Failed to initialize learn UI.';
      container.appendChild(errEl);
    }

    return container;
  }

  // (learn UI moved to React) expand/collapse logic previously handled here

  private createTagsSection(): HTMLElement {
    const tagsSection = document.createElement('div');
    tagsSection.className = 'tags-section';
    tagsSection.style.marginBottom = '0'; // Remove margin since we use gap in container
    
    // Add section header
    const sectionHeader = document.createElement('div');
    sectionHeader.style.display = 'flex';
    sectionHeader.style.alignItems = 'center';
    sectionHeader.style.gap = '6px';
    sectionHeader.style.marginBottom = '8px';
    
    const sectionIcon = document.createElement('span');
    sectionIcon.textContent = '🏷️';
    sectionIcon.style.fontSize = '14px';
    
    const tagsLabel = document.createElement('label');
    tagsLabel.textContent = 'Tags';
    tagsLabel.style.fontSize = '12px';
    tagsLabel.style.fontWeight = '600';
    tagsLabel.style.color = '#000';
    tagsLabel.style.margin = '0';
    
    sectionHeader.appendChild(sectionIcon);
    sectionHeader.appendChild(tagsLabel);
    
    this.tagInput = new TagInput({
      placeholder: 'Type tag name and press Enter...',
      maxTags: 10,
      allowDuplicates: false,
  onTagsChange: () => {},
  onInputChange: () => {},
      onInputFocus: () => {},
      onInputBlur: () => {},
      onEnterEmpty: () => {
        // Check if there's comment text or tags before auto-saving
        const commentText = this.commentInput?.getValue()?.trim() || '';
        const tags = this.tagInput?.getTags() || [];
        if (tags.length > 0 || commentText.length > 0) this.handleSave();
      }
    });
    
    tagsSection.appendChild(sectionHeader);
    tagsSection.appendChild(this.tagInput.getElement());
    
    return tagsSection;
  }

  private createCommentSection(): HTMLElement {
    const commentSection = document.createElement('div');
    commentSection.className = 'comment-section';
    
    // Add section header
    const sectionHeader = document.createElement('div');
    sectionHeader.style.display = 'flex';
    sectionHeader.style.alignItems = 'center';
    sectionHeader.style.gap = '6px';
    sectionHeader.style.marginBottom = '8px';
    
    // Create comment input component
    this.commentInput = new CommentInput({
      placeholder: 'Add your notes or comments here...',
      showButton: true,
      buttonText: '+ Add Comment',
  onCommentChange: () => {},
      onCommentFocus: () => {},
      onCommentBlur: () => {},
      onSave: () => { this.handleSave(); }
    });
    
    commentSection.appendChild(sectionHeader);
    commentSection.appendChild(this.commentInput.getElement());
    
    return commentSection;
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
  // Saving form data
    
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
      selectedText: this.cleanText(this.selectedText),
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
      
      // Get comment text from CommentInput component
      data.comment = this.commentInput?.getValue()?.trim() || '';
    } else {
      // For other inputs, get from main input
      const mainInput = this.shadowRoot.getElementById('mainInput') as HTMLInputElement;
      inputValue = mainInput?.value || '';
    }

    // Set data based on action type
    switch (this.actionType) {
      case 'learn':
        // Prefer the selected values from the learn UI selects if available
        const srcSel = (this as any).__learnSourceSelect as HTMLSelectElement | undefined;
        const tgtSel = (this as any).__learnTargetSelect as HTMLSelectElement | undefined;
        data.targetLanguage = (tgtSel?.value && tgtSel.value !== 'auto') ? tgtSel.value : (inputValue || 'English');
        data.sourceLanguage = (srcSel?.value) ? srcSel.value : 'auto';
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
  // Saving learn data
    // TODO: Implement learn API and storage
    let learnSelection = convertToSelection(data);
    await chrome.runtime.sendMessage({ action: 'learn', data: learnSelection });
    // response handled by background
  }

  private async saveNote(data: any) {
  // Saving note
    
    // TODO: Implement note storage
    let noteSelection = convertToSelection(data);
    await chrome.runtime.sendMessage({ action: 'note', data: noteSelection });
    // response handled by background
  }

  private async askAI(data: any) {
  // Asking AI
    // TODO: Implement AI API call
    let chatSelection = convertToSelection(data);
    await chrome.runtime.sendMessage({ action: 'chat', data: chatSelection });
    // response handled by background
  }

  show(position: DOMRect) {
    if (this.isVisible) return;
    // Append to document
    document.body.appendChild(this.container);
    
    // remove reposition listeners and clear anchor
    if (this.repositionHandler) {
      window.removeEventListener('scroll', this.repositionHandler, true);
      window.removeEventListener('resize', this.repositionHandler);
      this.repositionHandler = undefined;
    }
    this.anchorDocX = undefined;
    this.anchorDocY = undefined;

    // Compute anchor in document coordinates so we can follow scroll
    this.anchorDocX = (position.left + position.width / 2) + window.scrollX;
    this.anchorDocY = (position.bottom) + window.scrollY; // anchor just below selection

    const popup = this.shadowRoot.querySelector('.form-popup') as HTMLElement;
    if (popup) {
  // initial positioning: place popup at anchor without transition so it doesn't animate from off-screen
  popup.classList.add('no-transition');
  this.reposition();
  // force a layout to ensure position applied
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  popup.offsetHeight;
  popup.classList.remove('no-transition');
      requestAnimationFrame(() => popup.classList.add('visible'));

//       // create throttled/debounced handlers and listen to scroll/resize to follow the anchor
//   this.repositionHandler = throttle(() => this.reposition(), 40);
//       // resize may change available space; debounce so we reposition after resize finishes
  this.resizeHandler = debounce(() => {
    console.log('resize - repositioning popup');
    this.reposition();
  }, 120);
//       window.addEventListener('scroll', this.repositionHandler, true);
      window.addEventListener('resize', this.resizeHandler);
      // not only window, when popup resizes due to content changes (e.g., learn API data), we should reposition
      const ro = new ResizeObserver(() => {
        this.reposition();
      });
      ro.observe(popup);
    }

    this.isVisible = true;

    // Focus the appropriate input (small delay to allow animation to start)
    setTimeout(() => {
      if (this.actionType === 'note' && this.tagInput) {
        this.tagInput.focus();
      } else {
        const input = this.shadowRoot.getElementById('mainInput') as HTMLElement;
        if (input) {
          input.focus();
        }
      }
    }, 120);
  }

  // Reposition the popup relative to the stored anchor (document coordinates).
  // Always apply flipping/clamping logic to keep the popup visible.
  private reposition() {
    const popup = this.shadowRoot.querySelector('.form-popup') as HTMLElement | null;
    if (!popup || this.anchorDocX === undefined || this.anchorDocY === undefined) return;

    // compute viewport coordinates for anchor
    const anchorViewportX = this.anchorDocX - window.scrollX;
    const anchorViewportY = this.anchorDocY - window.scrollY;

  // prefer placing below anchor with a small offset
  const margin = 10;
  const preferredTop = anchorViewportY + margin;
  // preferredLeft is the horizontal center (we use CSS translate(-50%) to center visually)
  const preferredLeft = anchorViewportX;

    // ensure popup is visible within viewport, measure popup size
    popup.style.left = '0px';
    popup.style.top = '0px';
    // force layout read to get size
    const pw = popup.offsetWidth;
    const ph = popup.offsetHeight;

    // Set left to the anchor center; CSS translate(-50%) will center the box.
    let finalLeft = Math.round(preferredLeft);
    let finalTop = Math.round(preferredTop);

    // horizontal clamp: move minimally so the popup is visible (don't change more than needed)
    {
      const minVisible = 8;
      const maxVisible = Math.max(8, window.innerWidth - 8);
      const minLeft = minVisible + Math.round(pw / 2);
      const maxLeft = maxVisible - Math.round(pw / 2);

      if (minLeft <= maxLeft) {
        if (finalLeft < minLeft) finalLeft = minLeft;
        if (finalLeft > maxLeft) finalLeft = maxLeft;
      } else {
        finalLeft = Math.round(window.innerWidth / 2);
      }

      // vertical adjust: prefer placing below anchor, but if it would overflow, move up just enough
      const bottomEdge = finalTop + ph;
      const viewportBottom = window.innerHeight - 8;
      if (bottomEdge > viewportBottom) {
        // try to move up so bottomEdge == viewportBottom
        const neededShift = bottomEdge - viewportBottom;
        finalTop = Math.round(finalTop - neededShift);
        // if moving up moves it above the top, clamp to top
        if (finalTop < 8) finalTop = 8;
      }
      // if still doesn't fit (popup taller than viewport), place at top with small padding
      if (ph > window.innerHeight - 16) {
        finalTop = 8;
      }
    }

    popup.style.left = `${finalLeft}px`;
    popup.style.top = `${finalTop}px`;
  }

  hide() {
    if (!this.isVisible) return;

    const popup = this.shadowRoot.querySelector('.form-popup') as HTMLElement;
    if (popup) {
      popup.classList.remove('visible');
      
      setTimeout(() => {
        if (this.container.parentNode) {
          // Unmount React learn root if mounted
          if (this._learnReactRoot) {
            try { this._learnReactRoot.unmount(); } catch (e) { /* ignore */ }
            this._learnReactRoot = undefined;
          }
          document.body.removeChild(this.container);
       }
       // Clean up components
       if (this.tagInput) {
         this.tagInput.destroy();
         this.tagInput = undefined;
       }
       if (this.commentInput) {
         this.commentInput.destroy();
         this.commentInput = undefined;
       }
     }, 300);
    }

    document.removeEventListener('click', this.handleOutsideClick, true);
    // remove scroll/resize listeners
    if (this.repositionHandler) {
      window.removeEventListener('scroll', this.repositionHandler, true);
      this.repositionHandler = undefined;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }
    this.isVisible = false;
  }
}