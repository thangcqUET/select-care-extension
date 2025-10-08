import { TagInput } from './TagInput';
import { CommentInput } from './CommentInput';

export interface NoteInputConfig {
  onSave?: (data: NoteInputData) => void;
  initialTags?: string[];
  initialComment?: string;
}

export interface NoteInputData {
  tags: string[];
  comment: string;
  tagCount: number;
}

export class NoteInput {
  private container: HTMLElement;
  private tagInput!: TagInput;
  private commentInput!: CommentInput;
  private onSaveCallback?: (data: NoteInputData) => void;

  constructor(config?: NoteInputConfig) {
    this.onSaveCallback = config?.onSave;
    this.container = this.createContainer();
    
    // Initialize components
    const tagsSection = this.createTagsSection(config?.initialTags);
    const commentSection = this.createCommentSection(config?.initialComment);
    
    this.container.appendChild(tagsSection);
    this.container.appendChild(commentSection);
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'note-input-container';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    return container;
  }

  private createTagsSection(initialTags?: string[]): HTMLElement {
    const tagsSection = document.createElement('div');
    tagsSection.className = 'tags-section';
    tagsSection.style.marginBottom = '0';
    
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
        if (tags.length > 0 || commentText.length > 0) {
          this.handleSave();
        }
      }
    });

    // Set initial tags if provided
    if (initialTags && initialTags.length > 0) {
      this.tagInput.setTags(initialTags);
    }
    
    tagsSection.appendChild(sectionHeader);
    tagsSection.appendChild(this.tagInput.getElement());
    
    return tagsSection;
  }

  private createCommentSection(initialComment?: string): HTMLElement {
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

    // Set initial comment if provided
    if (initialComment) {
      this.commentInput.setValue(initialComment);
    }
    
    commentSection.appendChild(sectionHeader);
    commentSection.appendChild(this.commentInput.getElement());
    
    return commentSection;
  }

  private handleSave() {
    if (this.onSaveCallback) {
      this.onSaveCallback(this.getValue());
    }
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public getValue(): NoteInputData {
    const tags = this.tagInput?.getTags() || [];
    const comment = this.commentInput?.getValue()?.trim() || '';
    
    return {
      tags: tags.length > 0 ? tags : ['general'],
      comment,
      tagCount: tags.length
    };
  }

  public getTags(): string[] {
    return this.tagInput?.getTags() || [];
  }

  public getComment(): string {
    return this.commentInput?.getValue()?.trim() || '';
  }

  public focus() {
    this.tagInput?.focus();
  }

  public isFocused(): boolean {
    return (this.commentInput?.isFocused() || this.tagInput?.isFocused()) ?? false;
  }

  public dispatchKeyEvent(key: string, modifiers: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean }) {
    // Forward key events to the appropriate input based on focus
    if (this.commentInput?.isFocused()) {
      this.commentInput.dispatchKeyEvent(key, modifiers);
    }
    if (this.tagInput?.isFocused()) {
      this.tagInput.dispatchKeyEvent(key, modifiers);
    }
  }

  public destroy() {
    this.tagInput?.destroy();
    this.commentInput?.destroy();
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
