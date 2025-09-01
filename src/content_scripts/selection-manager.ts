/**
 * Selection state management
 * Handles text selection tracking and position management
 */

export interface SelectionState {
  text: string;
  position: DOMRect;
  savedText: string;
}

export class SelectionManager {
  private currentSelection: Partial<SelectionState> = {};

  /**
   * Get the current selected text (trimmed)
   */
  getSelectedText(): string | undefined {
    return this.currentSelection.text;
  }

  /**
   * Set the current selected text
   */
  setSelectedText(text: string): void {
    this.currentSelection.text = text?.trim();
  }

  /**
   * Get the selection position
   */
  getSelectionPosition(): DOMRect | undefined {
    return this.currentSelection.position;
  }

  /**
   * Set the selection position
   */
  setSelectionPosition(position: DOMRect): void {
    this.currentSelection.position = position;
  }

  /**
   * Get the saved selected text
   */
  getSavedText(): string | undefined {
    return this.currentSelection.savedText;
  }

  /**
   * Save the current selected text
   */
  saveSelectedText(): void {
    this.currentSelection.savedText = this.currentSelection.text;
  }

  /**
   * Clear all selection data
   */
  clear(): void {
    this.currentSelection = {};
  }

  /**
   * Check if we have valid selection data for showing popup
   */
  hasValidSelection(): boolean {
    return !!(
      this.currentSelection.position && 
      this.currentSelection.text && 
      this.currentSelection.text.length > 0
    );
  }

  /**
   * Update selection from DOM
   */
  updateFromDOM(): void {
    const selection = document.getSelection();
    if (!selection) return;

    // Update text
    const rawText = selection.toString();
    this.setSelectedText(rawText);

    // Update position
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      this.setSelectionPosition(rect);
    }
  }
}

// Global instance
export const selectionManager = new SelectionManager();
