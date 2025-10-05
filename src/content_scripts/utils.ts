
//implement throttle
export function throttle(callback: (...args: any[]) => void, delay: number) {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
}

export function debounce(func: (...args: any[]) => void, delay: number) {
  let timeout: number;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(window, args), delay);
  };
}

// Function to check if user is currently typing in an input field
export function isUserTyping(): boolean {
  const activeElement = document.activeElement;
  console.log(activeElement);
  if (!activeElement) return false;
  
  // Check if it's an input field, textarea, or content editable
  const isFormContainer = activeElement.classList.contains('select-care-form-container')
  const isTagInputField = activeElement.classList.contains('tag-input-field')
  
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true' ||
                           activeElement.getAttribute('contenteditable') === '';
  
  const isEditableDiv = activeElement.getAttribute('role') === 'textbox';
  
  // Check if it's a typing-related input type
  const inputType = (activeElement as HTMLInputElement).type;
  const isTypingInput = !inputType || 
                       ['text', 'email', 'password', 'search', 'url', 'tel'].includes(inputType);
  console.log({
    isFormContainer,
    isTagInputField,
    isContentEditable,
    isEditableDiv,
    isTypingInput
  })
  return (isFormContainer && isTypingInput) || isTagInputField || isContentEditable || isEditableDiv;
}