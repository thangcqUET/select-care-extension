/**
 * Constants used throughout the content script
 */

export const TIMING = {
  SELECTION_CHANGE_DELAY: 10,
  MOUSEUP_DELAY: 11, // SELECTION_CHANGE_DELAY + 1
  POPUP_HIDE_DELAY: 3000,
  ANIMATION_DELAY: 300,
  FOCUS_DELAY: 100,
  OUTSIDE_CLICK_DELAY: 100,
} as const;

export const Z_INDEX = {
  SELECT_POPUP: 10000,
  FORM_POPUP: 10001,
} as const;

export const CSS_CLASSES = {
  // Main containers
  POPUP_CONTAINER: 'select-care-popup-container',
  FORM_CONTAINER: 'select-care-form-container',
  
  // Input related
  TAG_INPUT_FIELD: 'tag-input-field',
  FORM_INPUT: 'form-input',
  
  // Interactive elements
  ICON_BUTTON: 'icon-button',
  FORM_BUTTON: 'form-button',
  BTN_SECONDARY: 'btn-secondary',
  
  // State classes
  VISIBLE: 'visible',
  SHOW: 'show',
} as const;

export const ACTION_TYPES = {
  LEARN: 'learn',
  NOTE: 'note', 
  CHAT: 'chat',
} as const;

export const POPUP_ACTIONS = [
  { emoji: '🌏', action: ACTION_TYPES.LEARN, title: 'Learn it' },
  { emoji: '📝', action: ACTION_TYPES.NOTE, title: 'Save as Note' },
  { emoji: '🤖', action: ACTION_TYPES.CHAT, title: 'Ask AI' },
] as const;

export const INPUT_TYPES_TYPING = [
  'text', 'email', 'password', 'search', 'url', 'tel'
] as const;

export const HIDDEN_TAGS = {
  LEARN: 'fn_learn',
  NOTE: 'fn_note', 
  CHAT: 'fn_ai',
} as const;
