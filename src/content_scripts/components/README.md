# TagInput Component

A reusable, standalone tag input component with visual chips, editing capabilities, and keyboard navigation.

## Features

- 🏷️ **Visual Tag Chips** - Each tag appears as a styled chip with glassmorphism effect
- ⌨️ **Smart Input Recognition** - Recognizes tags starting with `#` or plain text
- ✏️ **Inline Editing** - Click any tag to edit it directly
- 🗑️ **Easy Removal** - Click the × button or use backspace to remove tags
- 🎨 **Consistent Styling** - Matches the form popup design language
- 🔒 **Encapsulated** - Uses Shadow DOM for style isolation

## Usage

```typescript
import { TagInput } from './components/TagInput';

// Create tag input with options
const tagInput = new TagInput({
  placeholder: 'Type #tag and press space...',
  maxTags: 10,
  allowDuplicates: false,
  initialTags: ['work', 'important'],
  onTagsChange: (tags) => {
    console.log('Tags updated:', tags);
  },
  onTagAdd: (tag) => {
    console.log('Tag added:', tag);
  },
  onTagRemove: (tag, index) => {
    console.log('Tag removed:', tag, 'at index', index);
  }
});

// Add to DOM
container.appendChild(tagInput.getElement());

// Focus the input
tagInput.focus();

// Get current tags
const currentTags = tagInput.getTags();

// Set tags programmatically
tagInput.setTags(['new', 'tags', 'array']);

// Add a tag programmatically
tagInput.addTagProgrammatically('urgent');

// Remove tag by index
tagInput.removeTagProgrammatically(0);

// Clear all tags
tagInput.clearTags();

// Get comma-separated value
const value = tagInput.getValue(); // "tag1,tag2,tag3"

// Cleanup
tagInput.destroy();
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placeholder` | `string` | `'Type #tag and press space...'` | Placeholder text for input field |
| `initialTags` | `string[]` | `[]` | Tags to show initially |
| `maxTags` | `number` | `20` | Maximum number of tags allowed |
| `allowDuplicates` | `boolean` | `false` | Whether to allow duplicate tags |
| `onTagsChange` | `(tags: string[]) => void` | `undefined` | Called when tags array changes |
| `onTagAdd` | `(tag: string) => void` | `undefined` | Called when a tag is added |
| `onTagRemove` | `(tag: string, index: number) => void` | `undefined` | Called when a tag is removed |

## Keyboard Shortcuts

- **Type `#tag` + Space/Enter** → Creates tag
- **Type `text` + Space/Enter** → Creates tag (without # prefix)
- **Backspace** (empty input) → Removes last tag
- **Click tag text** → Enters edit mode
- **Enter** (while editing) → Saves changes
- **Escape** (while editing) → Cancels editing
- **Click outside** (while editing) → Saves changes

## Styling

The component uses Shadow DOM with built-in glassmorphism styling that matches the extension's design system. Tags appear as blue chips with smooth animations.

## Integration with FormPopup

The TagInput component is automatically used in the FormPopup when `actionType === 'note'`:

```typescript
// In FormPopup class
private createTagInputComponent(): HTMLElement {
  this.tagInput = new TagInput({
    placeholder: 'Type #tag and press space...',
    maxTags: 10,
    allowDuplicates: false,
    onTagsChange: (tags) => {
      console.log('Tags changed:', tags);
    }
  });

  const container = document.createElement('div');
  container.appendChild(this.tagInput.getElement());
  return container;
}
```

## Data Collection

Tags are collected in the `collectFormData()` method:

```typescript
if (this.actionType === 'note' && this.tagInput) {
  const tags = this.tagInput.getTags();
  data.tags = tags.length > 0 ? tags : ['general'];
  data.tagCount = tags.length;
}
```

This ensures clean separation of concerns and makes the tag functionality easily reusable across different parts of the extension.
