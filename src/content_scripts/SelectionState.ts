// 1. src/content_scripts/state/selectionState.ts
export class SelectionState {
  private static instance: SelectionState;
  
  selectedText?: string;
  selectionPosition?: DOMRect;
  savedSelectedText?: string;
  
  private constructor() {}
  
  static getInstance(): SelectionState {
    if (!SelectionState.instance) {
      SelectionState.instance = new SelectionState();
    }
    return SelectionState.instance;
  }
  
  updateSelection(text: string | undefined, position: DOMRect | undefined) {
    this.selectedText = text?.trim();
    this.selectionPosition = position;
  }
  
  saveSelection() {
    this.savedSelectedText = this.selectedText;
  }
  
  clear() {
    this.selectedText = undefined;
    this.selectionPosition = undefined;
  }
}