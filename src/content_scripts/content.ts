import { throttle } from './utils';


let selectedText : string | undefined;
let selectionPosition: DOMRect | undefined;

// listen select text event
document.addEventListener('selectionchange', throttle(() => {
  selectedText = document.getSelection()?.toString();
  //position of selection
  const selectionRange = document.getSelection()?.getRangeAt(0);
  if (selectionRange) {
    const rect = selectionRange.getBoundingClientRect();
    selectionPosition = rect;
  }
  console.log('Selected text:', selectedText);
  if (selectedText) {
    // show a popup beside the mouse with a emoji and the selected text
    console.log(`${selectedText}`);
  }
}, 10));

//listen mouse down event
document.addEventListener('mousedown', (event: MouseEvent) => {
  console.log('Mouse down at:', event.clientX, event.clientY);
});

//listen mouse up event
document.addEventListener('mouseup', (event: MouseEvent) => {
  console.log('Mouse up at:', event.clientX, event.clientY);
  if (selectedText) {
    showPopup(`😍`);
    selectedText = undefined;
  }
});

// function to show a popup beside the mouse with a emoji
function showPopup(text: string) {
  const popup = document.createElement('div');
  popup.textContent = text;
  popup.style.fontSize = '32px';
  popup.style.zIndex = '9999';
  popup.style.position = 'fixed';
  popup.style.pointerEvents = 'none';
  
  // Position the popup: put it under the selection and to the center of the selection
  if (selectionPosition) {
    popup.style.top = `${selectionPosition.bottom + window.scrollY}px`;
    popup.style.left = `${selectionPosition.left + window.scrollX + selectionPosition.width / 2}px`;
    // minus half of the popup width center it horizontally
    popup.style.transform = `translate(-50%, 0)`;
  }

  document.body.appendChild(popup);


  setTimeout(() => {
    document.body.removeChild(popup);
  }, 2000);
}