/**
 * Data collection and processing for form submissions
 * Handles the creation of selection data structures
 */

import { ACTION_TYPES, HIDDEN_TAGS } from './constants';
import { TextProcessor } from './text-processor';
import { TagInput } from './components/TagInput';

export interface FormDataCollector {
  collectFormData(
    actionType: string,
    selectedText: string,
    shadowRoot: ShadowRoot,
    tagInput?: TagInput
  ): any;
}

export class SelectionDataCollector implements FormDataCollector {
  /**
   * Collect form data based on action type
   */
  collectFormData(
    actionType: string,
    selectedText: string,
    shadowRoot: ShadowRoot,
    tagInput?: TagInput
  ): any {
    const baseData = this.createBaseData(selectedText, actionType);
    
    switch (actionType) {
      case ACTION_TYPES.LEARN:
        return this.collectLearnData(baseData, shadowRoot);
      case ACTION_TYPES.NOTE:
        return this.collectNoteData(baseData, shadowRoot, tagInput);
      case ACTION_TYPES.CHAT:
        return this.collectChatData(baseData, shadowRoot);
      default:
        return baseData;
    }
  }

  /**
   * Create base data structure common to all selection types
   */
  private createBaseData(selectedText: string, actionType: string): any {
    return {
      selectedText: TextProcessor.cleanText(selectedText),
      actionType,
      timestamp: new Date().toISOString(),
      sourceUrl: window.location.href,
    };
  }

  /**
   * Collect data specific to learn action
   */
  private collectLearnData(baseData: any, shadowRoot: ShadowRoot): any {
    const mainInput = shadowRoot.getElementById('mainInput') as HTMLInputElement;
    const targetLanguage = mainInput?.value || 'English';
    
    return {
      ...baseData,
      targetLanguage,
      sourceLanguage: 'auto',
      tags: [HIDDEN_TAGS.LEARN] as string[],
    };
  }

  /**
   * Collect data specific to note action
   */
  private collectNoteData(baseData: any, shadowRoot: ShadowRoot, tagInput?: TagInput): any {
    const commentTextarea = shadowRoot.getElementById('commentInput') as HTMLTextAreaElement;
    const comment = commentTextarea?.value?.trim() || '';
    
    let tags: string[] = [HIDDEN_TAGS.NOTE];
    let tagCount = 0;
    
    if (tagInput) {
      const userTags = tagInput.getTags();
      tags = [HIDDEN_TAGS.NOTE, ...(userTags.length > 0 ? userTags : ['general'])];
      tagCount = userTags.length;
    } else {
      tags = [HIDDEN_TAGS.NOTE, 'general'];
    }
    
    return {
      ...baseData,
      tags,
      tagCount,
      comment,
    };
  }

  /**
   * Collect data specific to chat action
   */
  private collectChatData(baseData: any, shadowRoot: ShadowRoot): any {
    const mainInput = shadowRoot.getElementById('mainInput') as HTMLInputElement;
    const question = mainInput?.value || 'Explain this text';
    
    return {
      ...baseData,
      question,
      tags: [HIDDEN_TAGS.CHAT] as string[],
    };
  }
}
