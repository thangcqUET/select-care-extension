import { throttle } from './utils';

let emojiList = ['😭', '😢', '😩', '😔', '😓', '😥', '😰', '😱', '😖', '😣', '😊', '😀', '😃', '😄', '😁', '😆', '🙂', '😌', '😍', '🥰'];

// // listen mouse position base on window
// let mousePosition = { clientX: 0, clientY: 0 };
// // save 10 lastest mouse position to caculate moving vector, to find the the place to draw
// let lastMousePositions = [{ clientX: 0, clientY: 0 }];

// //caculate base on last point and first point
// let mouseMovingVector = { x: 0, y: 0 };
// const throttledMouseMove = throttle((event: MouseEvent) => {
//   mousePosition = { clientX: event.clientX, clientY: event.clientY };
//   mouseMovingVector = {
//     x: mousePosition.clientX - lastMousePositions[0].clientX,
//     y: mousePosition.clientY - lastMousePositions[0].clientY,
//   };
//   lastMousePositions.unshift(mousePosition);
//   lastMousePositions = lastMousePositions.slice(0, 50);
// }, 10);

// document.addEventListener('mousemove', throttledMouseMove);

let selectedText : string | undefined;
// listen select text event
console.log('Content script loaded');
document.addEventListener('selectionchange', throttle(() => {
  selectedText = document.getSelection()?.toString();
  //position of selection
  const selectionRange = document.getSelection()?.getRangeAt(0);
  if (selectionRange) {
    const rect = selectionRange.getBoundingClientRect();
    console.log('Selection position:', rect);
  }
  console.log('Selected text:', selectedText);
  if (selectedText) {
    // show a popup beside the mouse with a emoji and the selected text
    console.log(`${selectedText}`);
  }
}, 10));

let firstMousePosition: { clientX: number; clientY: number } | undefined;
//listen mouse down event
document.addEventListener('mousedown', (event: MouseEvent) => {
  console.log('Mouse down at:', event.clientX, event.clientY);
  firstMousePosition = { clientX: event.clientX, clientY: event.clientY };
});

let lastMousePositions: { clientX: number; clientY: number } | undefined;
//listen mouse up event
document.addEventListener('mouseup', (event: MouseEvent) => {
  console.log('Mouse up at:', event.clientX, event.clientY);
  lastMousePositions = { clientX: event.clientX, clientY: event.clientY };
  if (selectedText) {
    //show random emoji
    const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
    showPopup(`${randomEmoji}`);
    selectedText = undefined;
  }
});

// function to show a popup beside the mouse with a emoji
function showPopup(text: string, position?: { clientX: number; clientY: number }) {
  const popup = document.createElement('div');
  popup.textContent = text;
  popup.style.fontSize = '32px';
  popup.style.zIndex = '9999';
  popup.style.position = 'fixed';
  popup.style.pointerEvents = 'none';

  //style an animation rotate around
  popup.style.animation = 'rotate 1s linear infinite';
  popup.style.transformOrigin = 'center';
  
  // Add keyframes if not already defined
  if (!document.querySelector('#rotate-keyframes')) {
    const style = document.createElement('style');
    style.id = 'rotate-keyframes';
    style.textContent = `
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Position the popup
  if (position) {
    popup.style.left = `${position.clientX}px`;
    popup.style.top = `${position.clientY}px`;
  } else {
    let mouseMovingVector = { x: 0, y: 0 };
    if (firstMousePosition && lastMousePositions) {
      mouseMovingVector = {
        x: lastMousePositions.clientX - firstMousePosition.clientX,
        y: lastMousePositions.clientY - firstMousePosition.clientY,
      };
      //if direction up, show at above of mouse, if direction down, show at below of mouse
      if (mouseMovingVector.y < 7) {
        popup.style.top = `${lastMousePositions.clientY - 16 - 32}px`;
      } else {
        popup.style.top = `${lastMousePositions.clientY + 16}px`;
      }
      // keep x
      popup.style.left = `${lastMousePositions.clientX}px`;
    }
  }
  
  document.body.appendChild(popup);


  setTimeout(() => {
    document.body.removeChild(popup);
  }, 2000);
}