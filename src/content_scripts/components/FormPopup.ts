import { TagInput } from './TagInput';
import { CommentInput } from './CommentInput';
import { convertToSelection } from '../data_mapper';
import { isUserTyping, debounce } from '../utils';
import { populateLearnUI } from '../services/learnService';

export class FormPopup {
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private isVisible: boolean = false;
  // optional implementation hook set when the learn UI is created
  private _ensurePartsImpl?: (parts: string[]) => void;
  // Public API: ensure the popup has tabs/badges for the given parts
  public ensureParts(parts: string[]) {
    if (this._ensurePartsImpl) return this._ensurePartsImpl(parts);
    return;
  }
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
    // Create root container for learn UI
    const container = document.createElement('div');
    container.id = 'mainInput';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    // Use a shadow root to isolate styles
    const shadow = container.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
  .learn-root { max-width: 320px; width: 100%; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #000; overflow: visible; }
      .translate-controls { display:flex; gap:8px; align-items:center; }
      .translate-controls select { flex:1; padding:6px 8px; border-radius:8px; border:1px solid rgba(63,63,63,0.12); background: rgba(255,255,255,0.6); }
      .badges { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
      .badge { padding:6px 8px; border-radius:999px; background: rgba(0,0,0,0.04); cursor:pointer; font-size:12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; border: none; }
      .badge.active { border: 1px solid rgba(63,63,63,0.2); }
  .tabs { margin-top:8px; }
  .meanings-wrap { width: 100%; max-width: 100%; max-height: 230px; overflow-y: auto; padding-right: 6px; box-sizing: border-box; }
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
      /* shimmer animation */
      @keyframes shimmer {
        0% { transform: translateX(-150%) skewX(-20deg); }
        100% { transform: translateX(150%) skewX(-20deg); }
      }
      .learn-loading .skeleton-line.animated::after { animation: shimmer 1.1s linear infinite; }
      .no-results { margin-top:8px; padding:8px; border-radius:8px; background: rgba(255,255,255,0.2); border:1px dashed rgba(63,63,63,0.08); font-size:13px; color: rgba(0,0,0,0.6); }
    `;

    shadow.appendChild(style);

    const root = document.createElement('div');
    root.className = 'learn-root';

    // Helper to show an inline message inside the learn popup (reusable)
    const showInlineMessage = (msg: string, kind: 'info' | 'error' = 'info') => {
      // remove existing inline messages first
      const prev = root.querySelector('.inline-message');
      if (prev && prev.parentElement) prev.parentElement.removeChild(prev);
      const el = document.createElement('div');
      el.className = 'inline-message no-results';
      if (kind === 'error') {
        el.style.borderStyle = 'solid';
      }
      el.textContent = msg;
      root.appendChild(el);
      return el;
    };

    // Translate controls
    const controls = document.createElement('div');
    controls.className = 'translate-controls';

    // Current/source language (detect or set explicitly)
    const sourceSelect = document.createElement('select');
    sourceSelect.title = 'Current Language';
    ['auto', 'en'].forEach(code => {
      const o = document.createElement('option'); o.value = code; o.textContent = code; sourceSelect.appendChild(o);
    });

    // Target language (what to translate/learn into)
    const targetSelect = document.createElement('select');
    targetSelect.title = 'Target Language';
    ['vi','en'].forEach(code => {
      const o = document.createElement('option'); o.value = code; o.textContent = code; targetSelect.appendChild(o);
    });
    // Try to use browser locale as default
    const locale = navigator.language ? navigator.language.split('-')[0] : 'en';
    const defaultOption = Array.from(targetSelect.options).find((opt:any) => opt.value === locale);
    if (defaultOption) defaultOption.selected = true;

    controls.appendChild(sourceSelect);
    controls.appendChild(targetSelect);

    // Expose selects on the FormPopup instance so collectFormData can read them
    (this as any).__learnSourceSelect = sourceSelect;
    (this as any).__learnTargetSelect = targetSelect;

    root.appendChild(controls);

    // Badges for parts of speech (initially empty — populated by the service)
    const badgesWrap = document.createElement('div');
    badgesWrap.className = 'badges';
    root.appendChild(badgesWrap);

    // Tabs container
    const tabs = document.createElement('div');
    tabs.className = 'tabs';

    // Helper to create a sample tab
    const createPosTab = (pos: string) => {
      const tab = document.createElement('div');
      tab.className = 'tab';
      tab.setAttribute('data-pos', pos);
      if (pos === 'noun') tab.classList.add('active');

      // Meanings list
  const meaningsWrap = document.createElement('div');
  meaningsWrap.className = 'meanings-wrap';

      // Create few sample meanings (editable)
      // helper to produce a meaning element so initial items and custom definitions share the same structure
  const createMeaningElement = (pos:string, idx:number, opts?: {title?:string, expanded?:boolean, definition?:string, example?:string}) => {
        const meaning = document.createElement('div');
        meaning.className = 'meaning';

        const title = document.createElement('div');
        title.className = 'title';

  // Title now rendered as a non-editable heading; it updates from the definition textarea
  const titleText = document.createElement('div');
  titleText.style.fontWeight = '500';
  titleText.style.marginRight = '8px';
  titleText.style.fontSize = '12px';
  // If overflowing, use ellipsis
  titleText.style.whiteSpace = 'nowrap';
  titleText.style.overflow = 'hidden';
  titleText.style.textOverflow = 'ellipsis';
  titleText.title = opts?.title || opts?.definition || '';

  // prefer explicit title, otherwise derive from provided definition (first line or truncated)
  const deriveTitle = (text:string) => {
    if (!text) return '';
    const firstLine = text.split('\n')[0].trim();
    return firstLine.length > 60 ? firstLine.slice(0,60).trim() + '…' : firstLine;
  };
  titleText.textContent = opts?.title && opts.title.length ? opts.title : deriveTitle(opts?.definition || '');

        const toggle = document.createElement('span');
        toggle.setAttribute('aria-expanded', 'false');
        const toggleIcon = document.createElement('span'); toggleIcon.className = 'toggle-icon'; toggleIcon.textContent = '▾';
        toggle.appendChild(toggleIcon);
        toggle.addEventListener('click', () => {
          this.toggleMeaning(meaning);
        });

        const left = document.createElement('div'); left.className = 'left';
        
        // title toggle (expand/collapse)
        left.addEventListener('click', () => {
          this.toggleMeaning(meaning);
        });
        left.style.cursor = 'pointer';

        const right = document.createElement('div'); right.className = 'right';
        left.appendChild(titleText);

        // Mark button sits outside the collapsible body so it's always visible
        const markWrap = document.createElement('span'); markWrap.className='mark-wrap';
        const markCtrl = document.createElement('span');
        markCtrl.setAttribute('role','button'); markCtrl.tabIndex = 0;
        const check = document.createElement('span'); check.className = 'check'; check.textContent = '◯';
        markCtrl.appendChild(check);
        const tooltip = document.createElement('span'); tooltip.className='tooltip'; tooltip.textContent='Mark to Save';
        markWrap.appendChild(markCtrl);
        markWrap.appendChild(tooltip);

        // place mark left, toggle right
        right.appendChild(markWrap);
        right.appendChild(toggle);
        title.appendChild(left);
        title.appendChild(right);

  const body = document.createElement('div'); body.className = 'body';
  const fullDef = document.createElement('textarea'); fullDef.className = 'form-input'; fullDef.rows = 3; fullDef.value = opts?.definition || '';
  // Example field: show only when example value exists; otherwise provide a small 'Add example' action
  const examples = document.createElement('textarea'); examples.className = 'form-input'; examples.rows = 2; examples.value = opts?.example || '';
  const exampleLabel = document.createElement('div'); exampleLabel.className = 'small'; exampleLabel.textContent = 'Example';
  const addExampleBtn = document.createElement('button'); addExampleBtn.className = 'form-button small'; addExampleBtn.textContent = 'Add example';
    const actions = document.createElement('div'); actions.className = 'form-actions';

        const addImageBtn = document.createElement('button'); addImageBtn.className = 'form-button'; addImageBtn.textContent = 'Add Image';
        addImageBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.onchange = () => {
            const file = fileInput.files && fileInput.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                chrome.runtime.sendMessage({ action: 'attachImage', pos, index: idx, dataUrl: reader.result });
              };
              reader.readAsDataURL(file);
            }
          };
          fileInput.click();
        });

        const genImageBtn = document.createElement('button'); genImageBtn.className = 'form-button primary'; genImageBtn.textContent = 'Generate Image';
        genImageBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const payload = {
            action: 'generateImage',
            prompt: `${fullDef.value} ${examples.value}`,
            pos,
            index: idx
          };
          // remove reposition listeners and clear anchor
          if (this.repositionHandler) {
            window.removeEventListener('scroll', this.repositionHandler, true);
            this.repositionHandler = undefined;
          }
          if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = undefined;
          }
          chrome.runtime.sendMessage(payload);
        });

        actions.appendChild(addImageBtn); actions.appendChild(genImageBtn);
        // Append definition
        body.appendChild(fullDef);
        // Append example only if provided; otherwise show the 'Add example' button
        if (examples.value && examples.value.trim().length > 0) {
          body.appendChild(exampleLabel);
          body.appendChild(examples);
        } else {
          // show addExampleBtn which reveals the example input when clicked
          addExampleBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            // replace button with label+textarea and insert them before the meaning actions so they stay in-place
            if (addExampleBtn.parentElement) addExampleBtn.parentElement.removeChild(addExampleBtn);
            // insert before the actions block to ensure correct position
            body.insertBefore(exampleLabel, actions);
            body.insertBefore(examples, actions);
            // small delay to ensure appended then focus
            setTimeout(() => { examples.focus(); examples.scrollIntoView({ block: 'nearest' }); }, 10);
          });
          body.appendChild(addExampleBtn);
        }
        body.appendChild(actions);
        meaning.appendChild(title); meaning.appendChild(body);

        // mark/unmark handler (uses current DOM index when needed)
        const markHandler = () => {
          const isMarked = markCtrl.getAttribute('data-marked') === '1';
          const all = Array.from(meaningsWrap.querySelectorAll('.meaning'));
          const idxCurrent = all.indexOf(meaning);
          if (!isMarked) {
            const payload = { action: 'markSave', pos, index: idxCurrent, title: (titleText.textContent || ''), definition: fullDef.value, examples: examples.value };
            chrome.runtime.sendMessage(payload);
            markCtrl.setAttribute('data-marked','1');
            check.textContent = '🟢';//green circle
            markCtrl.classList.add('form-button-marked');
            tooltip.textContent = 'Marked';
          } else {
            const payload = { action: 'unmarkSave', pos, index: idxCurrent };
            chrome.runtime.sendMessage(payload);
            markCtrl.removeAttribute('data-marked');
            check.textContent = '◯';
            markCtrl.classList.remove('form-button-marked');
            tooltip.textContent = 'Mark to Save';
          }
        };
        markCtrl.addEventListener('click', markHandler);
        markCtrl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); markHandler(); } });

        // update title when definition textarea changes
        fullDef.addEventListener('input', () => {
          const t = deriveTitle(fullDef.value || '');
          titleText.textContent = t;
        });

        if (opts?.expanded) {
          meaning.classList.add('expanded');
          const bodyEl = meaning.querySelector('.body') as HTMLElement | null;
          if (bodyEl) bodyEl.style.display = 'block';
        }

        return meaning;
      };

      // No placeholder meanings here; the learn service will populate meanings based on API data.

      // Custom definition button
      const customBtn = document.createElement('button');
  customBtn.className = 'form-button';
  customBtn.textContent = 'Custom Definition';
  customBtn.style.marginTop = '6px';
      customBtn.addEventListener('click', () => {
        // Append an empty meaning item (user will fill contents). Mark as user-initiated
        const newIdx = meaningsWrap.querySelectorAll('.meaning').length;
        const evt = new CustomEvent('addMeaning', { detail: { pos, index: newIdx, title: '', definition: 'Define here...', example: '', userInitiated: true } });
        meaningsWrap.dispatchEvent(evt);
      });

        tab.appendChild(meaningsWrap);
        tab.appendChild(customBtn);

      // Listen for addMeaning events to create editable meaning
      meaningsWrap.addEventListener('addMeaning', (_ev:any) => {
        const detail = _ev?.detail || {};
        const userInitiated = !!detail.userInitiated;
        const newIdx = meaningsWrap.querySelectorAll('.meaning').length;
        // create collapsed by default
        const el = createMeaningElement(pos, newIdx, { title: detail.title || '', definition: detail.definition || '', example: detail.example || '' });
        meaningsWrap.appendChild(el);
        // Only focus/scroll when the addition was user-initiated (e.g., Custom Definition)
        if (userInitiated) {
          setTimeout(() => {
            const input = el.querySelector('.form-input') as HTMLElement | null;
            if (input) {
              try { (input as HTMLInputElement).focus?.(); } catch {}
              el.scrollIntoView({ block: 'nearest' });
            }
          }, 10);
        }
      });

      return tab;
    };

    // Tabs will be created dynamically when the service provides parts via
    // a CustomEvent('setParts', { detail: { parts: string[] } }).
    // Provide a helper to ensure a tab exists for a given POS.
    const ensureTabForPos = (pos: string, activate = false) => {
      let tab = tabs.querySelector(`[data-pos="${pos}"]`) as HTMLElement | null;
      if (!tab) {
        tab = createPosTab(pos);
        tabs.appendChild(tab);
      }
      if (activate) {
        tabs.querySelectorAll('.tab').forEach(t => (t as HTMLElement).classList.remove('active'));
        tab.classList.add('active');
      }
      return tab;
    };

    // Build parts helper used by the service. Attach it to the tabs element so
    // consumers can call it directly (preferred) or dispatch a 'setParts' event
    // (legacy fallback). Also expose a FormPopup instance method that forwards
    // to this implementation so callers can reuse it directly from the class.
    const buildParts = (parts: string[]) => {
      // Clear existing badges
      badgesWrap.innerHTML = '';
      parts.forEach((p, idx) => {
        const b = document.createElement('button');
        b.className = 'badge';
        if (idx === 0) b.classList.add('active');
        b.textContent = p;
        b.addEventListener('click', () => {
          // toggle active badge
          badgesWrap.querySelectorAll('.badge').forEach(el => el.classList.remove('active'));
          b.classList.add('active');
          // activate corresponding tab, falling back to first tab if missing
          tabs.querySelectorAll('.tab').forEach(t => (t as HTMLElement).classList.remove('active'));
          const tab = tabs.querySelector(`[data-pos="${p}"]`) as HTMLElement | null;
          if (tab) tab.classList.add('active');
          else {
            const firstTab = tabs.querySelector('.tab') as HTMLElement | null;
            if (firstTab) firstTab.classList.add('active');
          }
        });
        badgesWrap.appendChild(b);
        // Ensure the tab exists (but don't necessarily activate besides first)
        ensureTabForPos(p, idx === 0);
      });
    };

    // attach helper implementation to the instance so ensureParts() can call it
    this._ensurePartsImpl = buildParts;
    // also expose the helper directly on the tabs element for backward-compat
    (tabs as any).ensureParts = (p: string[]) => { this.ensureParts(p); };

    // legacy event-based API — still supported
    tabs.addEventListener('setParts', (ev: any) => {
      const parts: string[] = ev?.detail?.parts || [];
      buildParts(parts);
    });

    root.appendChild(tabs);

    // Global synonyms/antonyms area (not tied to partOfSpeech) — place at bottom of learn root
    const globalSynWrap = document.createElement('div');
    globalSynWrap.className = 'syn-list';
    // Build a collapsible block: header + content. Keep existing font sizes.
    const synHeader = document.createElement('div');
    synHeader.style.display = 'flex';
    synHeader.style.alignItems = 'center';
    synHeader.style.fontWeight = '600';
    synHeader.style.justifyContent = 'space-between';
    synHeader.style.cursor = 'pointer';
    synHeader.innerHTML = `<div class="small">Synonyms & Antonyms</div><div class="small">▾</div>`;

    const synContent = document.createElement('div');
    synContent.style.display = 'none'; // collapsed by default
    synContent.innerHTML = `<div class="small">Synonyms: <span data-syn></span></div><div class="small">Antonyms: <span data-ant></span></div>`;

    synHeader.addEventListener('click', () => {
      const expanded = synContent.style.display === 'block';
      synContent.style.display = expanded ? 'none' : 'block';
      // toggle icon
      const icon = synHeader.querySelectorAll('div')[1] as HTMLElement | null;
      if (icon) icon.textContent = expanded ? '▾' : '▴';
    });

  globalSynWrap.appendChild(synHeader);
  globalSynWrap.appendChild(synContent);
  // hide by default; the service will show it only when there is data
  globalSynWrap.style.display = 'none';
  root.appendChild(globalSynWrap);

    // If we have a selected text, show loading UI and delegate dictionary fetch + UI population to the service
    const selected = this.selectedText?.split('\n')[0]?.trim() || '';
    const loadingWrap = document.createElement('div');
    loadingWrap.className = 'learn-loading';
    loadingWrap.innerHTML = `
      <div class="skeleton-line long animated"></div>
      <div class="skeleton-line medium animated"></div>
      <div class="skeleton-line short animated"></div>
    `;
    // Insert loading placeholder into the first tab (noun fallback) so it's visible while fetching
    const firstTab = tabs.querySelector('.tab') as HTMLElement | null;
    const initialTarget = firstTab ? (firstTab.querySelector('.meanings-wrap') as HTMLElement | null) : null;
    if (initialTarget) {
      initialTarget.appendChild(loadingWrap);
    } else {
      // no tab exists yet — append to the tabs container so the skeleton is visible
      tabs.appendChild(loadingWrap);
    }

    if (selected.length > 0) {
      // If user set source language to 'auto', ask the background to detect language first
      const srcSel = (this as any).__learnSourceSelect as HTMLSelectElement | undefined;
      const srcValue = srcSel?.value || 'auto';

      const runPopulate = async () => {
        await populateLearnUI(selected, controls, badgesWrap, tabs, globalSynWrap);
        return true;
      };

      const tryDetectThenPopulate = async () => {
        if (srcValue === 'auto') {
          try {
            const resp = await new Promise<any>((resolve) => {
              chrome.runtime.sendMessage({ action: 'detectLanguage', text: selected }, (r:any) => resolve(r));
            });
            if (resp && resp.success && resp.result && resp.result.detectedLanguage) {
              const detected = resp.result.detectedLanguage.language;
              // If detected language is not English, show an inline message and don't run dictionary lookup
              if (detected && detected !== 'en') {
                showInlineMessage(`Detected language: ${detected}. Dictionary lookup (English) skipped.`, 'info');
                // still allow user to open the popup, but don't call populate
                return Promise.resolve(false);
              }
              // if English, proceed to populate
              return runPopulate();
            } else {
              // detection failed — fall back to populate
              return runPopulate();
            }
          } catch (err) {
            // on error, fall back to populate
            return runPopulate();
          }
        } else if (srcValue === 'en') {
          return runPopulate();
        } else {
          // unsupported source language for now — show inline message in the popup and skip lookup
          showInlineMessage(`Source language set to "${srcValue}". Dictionary lookup (English) skipped.`, 'info');
          return Promise.resolve(false);
        }
      };

      // call detection+populate and handle UI updates via promise callbacks
      tryDetectThenPopulate()
        .then((didRun: boolean) => {
          if (loadingWrap.parentElement) loadingWrap.parentElement.removeChild(loadingWrap);
          const anyMeaning = tabs.querySelector('.meanings-wrap .meaning');
          // Only show the 'no meanings' hint when we actually ran populate
          if (didRun && !anyMeaning) {
            // Ensure there's at least a default tab (noun) so users can add custom definitions
            const nounTab = ensureTabForPos('noun', true);
            const targetWrap = nounTab ? (nounTab.querySelector('.meanings-wrap') as HTMLElement | null) : null;
              if (targetWrap) {
              // remove any previous placeholder nodes
              const prevHint = targetWrap.querySelector('.no-results-hint');
              if (prevHint && prevHint.parentElement) prevHint.parentElement.removeChild(prevHint);
              // use reusable inline message helper so placement and styling are consistent
              const hintEl = showInlineMessage(`No dictionary meanings found for "${selected}". Use "Custom Definition" to add your own.`, 'info');
              hintEl.classList.add('small', 'no-results-hint');
              // ensure the hint is placed inside the meanings wrap for context
              targetWrap.appendChild(hintEl);
            } else {
              // fallback: append a small hint to the root
              const noResults = document.createElement('div');
              noResults.className = 'no-results';
              noResults.textContent = `No results for "${selected}"`;
              root.appendChild(noResults);
            }
          }
  })
  .catch((err) => {
          console.error('populateLearnUI error', err);
          if (loadingWrap.parentElement) loadingWrap.parentElement.removeChild(loadingWrap);
          const errEl = document.createElement('div');
          errEl.className = 'no-results';
          errEl.textContent = 'Failed to load dictionary data';
          root.appendChild(errEl);
        });
    } else {
      // No selected text — remove loading and show hint
      if (loadingWrap.parentElement) loadingWrap.parentElement.removeChild(loadingWrap);
      const hint = document.createElement('div');
      hint.className = 'no-results';
      hint.textContent = 'Select a word to look up meanings';
      root.appendChild(hint);
    }

    shadow.appendChild(root);

    // Return the container which holds the shadow DOM
    return container;
  }

  // Toggle expand/collapse for a meaning element and update aria/icon
  private toggleMeaning(meaning: HTMLElement, expand?: boolean) {
    if (!meaning) return;
    const shouldExpand = typeof expand === 'boolean' ? expand : !meaning.classList.contains('expanded');
    if (shouldExpand) {
      meaning.classList.add('expanded');
    } else {
      meaning.classList.remove('expanded');
    }
    const toggleEl = meaning.querySelector('span[aria-expanded]') as HTMLElement | null;
    if (toggleEl) {
      toggleEl.setAttribute('aria-expanded', shouldExpand ? 'true' : 'false');
      const icon = toggleEl.querySelector('.toggle-icon') as HTMLElement | null;
      if (icon) icon.textContent = shouldExpand ? '▴' : '▾';
    }
    const bodyEl = meaning.querySelector('.body') as HTMLElement | null;
    if (bodyEl) bodyEl.style.display = shouldExpand ? 'block' : 'none';
    // If expanded, ensure the entire meaning element is visible inside its scrollable parent (.meanings-wrap)
    if (shouldExpand) {
      // find nearest ancestor with class meanings-wrap
      let parent: HTMLElement | null = meaning.parentElement as HTMLElement | null;
      while (parent && !parent.classList.contains('meanings-wrap')) {
        parent = parent.parentElement as HTMLElement | null;
      }
      if (parent) {
        // get bounding rects
        const parentRect = parent.getBoundingClientRect();
        const meaningRect = meaning.getBoundingClientRect();
        // compute overflows relative to parent
        const topOverflow = meaningRect.top - parentRect.top;
        const bottomOverflow = meaningRect.bottom - parentRect.bottom;
        // compute desired new scrollTop value
        let desiredScrollTop = parent.scrollTop;
        if (topOverflow < 0) {
          desiredScrollTop = parent.scrollTop + topOverflow - 8; // small padding
        } else if (bottomOverflow > 0) {
          desiredScrollTop = parent.scrollTop + bottomOverflow + 8; // small padding
        }
        // Respect user preference for reduced motion
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (desiredScrollTop !== parent.scrollTop) {
          if (prefersReduced) {
            parent.scrollTop = desiredScrollTop;
          } else {
            try {
              parent.scrollTo({ top: desiredScrollTop, behavior: 'smooth' });
            } catch (e) {
              parent.scrollTop = desiredScrollTop;
            }
          }
        }
      }
    }
  }

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