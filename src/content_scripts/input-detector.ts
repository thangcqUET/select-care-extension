/**
 * Input detection utilities
 * Handles detection of user typing in various input elements
 */

import { CSS_CLASSES, INPUT_TYPES_TYPING } from './constants';

export class InputDetector {
  /**
   * Check if user is currently typing in an input field
   */
  static isUserTyping(): boolean {
    const activeElement = document.activeElement;
    console.log('Active element:', activeElement);
    
    if (!activeElement) return false;
    
    const checks = {
      isFormContainer: activeElement.classList.contains(CSS_CLASSES.FORM_CONTAINER),
      isTagInputField: activeElement.classList.contains(CSS_CLASSES.TAG_INPUT_FIELD),
      isContentEditable: InputDetector.isContentEditable(activeElement),
      isEditableDiv: activeElement.getAttribute('role') === 'textbox',
      isTypingInput: InputDetector.isTypingInput(activeElement),
    };
    
    console.log('Input detection checks:', checks);
    
    return (checks.isFormContainer && checks.isTypingInput) || 
           checks.isTagInputField || 
           checks.isContentEditable || 
           checks.isEditableDiv;
  }

  /**
   * Check if element is content editable
   */
  private static isContentEditable(element: Element): boolean {
    const contentEditable = element.getAttribute('contenteditable');
    return contentEditable === 'true' || contentEditable === '';
  }

  /**
   * Check if element is a typing-related input
   */
  private static isTypingInput(element: Element): boolean {
    const inputType = (element as HTMLInputElement).type;
    
    // If no type specified, it defaults to text (typing input)
    if (!inputType) return true;
    
    return INPUT_TYPES_TYPING.includes(inputType as any);
  }

  /**
   * Check if the current active element is a specific input by ID
   */
  static isActiveElement(elementId: string, shadowRoot?: ShadowRoot): boolean {
    if (shadowRoot) {
      return shadowRoot.activeElement?.id === elementId;
    }
    return document.activeElement?.id === elementId;
  }

  /**
   * Check if user is typing in a comment textarea specifically
   */
  static isTypingInComment(shadowRoot: ShadowRoot): boolean {
    const commentTextarea = shadowRoot.getElementById('commentInput') as HTMLTextAreaElement;
    return commentTextarea && shadowRoot.activeElement === commentTextarea;
  }
}
