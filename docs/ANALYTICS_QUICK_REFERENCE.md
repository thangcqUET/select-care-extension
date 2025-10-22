# Analytics Quick Reference

Quick reference for all tracked events in the Select Care extension.

## Configuration

Replace `GTM-XXXXXXX` with your actual GTM Container ID in:
- `src/dashboard/main.tsx`
- `src/extension_popup/main.tsx`
- `src/lib/analytics.ts`

## Event Categories

| Category | Description |
|----------|-------------|
| `selection` | Text selection on webpages |
| `popup` | Quick action popup interactions |
| `form` | Form popup interactions (Learn/Note) |
| `note` | Note-specific actions |
| `sidebar` | Dashboard/sidebar interactions |
| `export` | Export feature actions |
| `learn` | Learning feature actions |

## All Tracked Events

### Selection Events
| Action | Location | When Triggered |
|--------|----------|----------------|
| `text_selected` | content.ts | User selects text on page |

### Popup Events
| Action | Location | When Triggered |
|--------|----------|----------------|
| `save_to_learn_clicked` | SelectPopup.ts | User clicks 🔡 button |
| `save_note_clicked` | SelectPopup.ts | User clicks 📝 button |

### Form Events
| Action | Location | When Triggered |
|--------|----------|----------------|
| `translate_requested` | LearnInput.tsx | Translation API called |
| `definition_requested` | LearnInput.tsx | Dictionary lookup performed |
| `mark_to_save` | LearnInput.tsx | User marks definition for saving |
| `save_to_learn_submit` | FormPopup.ts | Learn form submitted |

### Note Events
| Action | Location | When Triggered |
|--------|----------|----------------|
| `add_tag` | NoteInput.ts | User adds tag to note |
| `add_comment` | NoteInput.ts | User types comment |
| `save_note` | FormPopup.ts | Note form submitted |

### Sidebar Events
| Action | Location | When Triggered |
|--------|----------|----------------|
| `sidebar_opened` | Dashboard.tsx | Dashboard loads |
| `filter_applied` | Dashboard.tsx | User applies tag/type filter |
| `search_performed` | Dashboard.tsx | User searches selections |
| `edit_note_item` | Dashboard.tsx | User edits note item |
| `edit_learn_item` | Dashboard.tsx | User edits learn item |
| `delete_item` | Dashboard.tsx | User deletes item |

### Export Events
| Action | Location | When Triggered |
|--------|----------|----------------|
| `export_app_selected` | ExportView.tsx | User selects export target app |
| `export_note` | ExportView.tsx | User exports notes |
| `export_learn` | ExportView.tsx | User exports learning items |

## Custom Data Structure

Each event can include customData with relevant context:

### Text Selection
```javascript
{ textLength: number, sourceUrl: string }
```

### Translation Request
```javascript
{ text: string, sourceLang: string, targetLang: string }
```

### Definition Request
```javascript
{ text: string, sourceLang: string, targetLang: string, resultCount: number }
```

### Mark to Save
```javascript
{ partOfSpeech: string, meaningIndex: number, hasDefinition: boolean }
```

### Save to Learn
```javascript
{ textLength: number, sourceUrl: string, hasPieces: boolean }
```

### Add Tag
```javascript
{ tagCount: number, newTag: string }
```

### Add Comment
```javascript
{ commentLength: number }
```

### Save Note
```javascript
{ textLength: number, sourceUrl: string, tagCount: number, hasComment: boolean }
```

### Filter Applied
```javascript
{ filterType: 'tag' | 'actionType', tag?: string, actionType?: string, action?: 'add' | 'remove', totalTags?: number, resultCount?: number }
```

### Search Performed
```javascript
{ query: string, resultCount: number }
```

### Edit Item
```javascript
{ itemType: string, itemId: string, hasComment: boolean, tagCount: number }
```

### Delete Item
```javascript
{ itemType: string, itemId: string }
```

### Export
```javascript
{ method: 'file' | 'copy' | 'api', itemCount: number, format?: string, exportType?: 'learning' | 'note' }
```

## Testing Checklist

- [ ] Replace GTM-XXXXXXX with actual container ID
- [ ] Verify GTM script loads in Network tab
- [ ] Test text selection tracking
- [ ] Test popup button clicks
- [ ] Test translation/definition requests
- [ ] Test mark to save
- [ ] Test form submissions
- [ ] Test tag/comment additions
- [ ] Test sidebar open
- [ ] Test filter/search
- [ ] Test edit/delete items
- [ ] Test export actions
- [ ] Enable GTM Preview Mode for detailed testing

## Debug Commands

```javascript
// Check if analytics is enabled
analytics.getEnabled()

// Disable analytics (for testing)
analytics.setEnabled(false)

// Enable analytics
analytics.setEnabled(true)

// Manual event tracking
analytics.trackEvent(
  EventCategory.SELECTION,
  EventAction.TEXT_SELECTED,
  'label',
  123,
  { custom: 'data' }
)
```

## GTM Variable Setup

Create these Data Layer Variables in GTM:

1. `eventCategory` → Type: Data Layer Variable → Name: `eventCategory`
2. `eventAction` → Type: Data Layer Variable → Name: `eventAction`
3. `eventLabel` → Type: Data Layer Variable → Name: `eventLabel`
4. `eventValue` → Type: Data Layer Variable → Name: `eventValue`
5. `timestamp` → Type: Data Layer Variable → Name: `timestamp`
6. `customData` → Type: Data Layer Variable → Name: `customData`

## GTM Trigger Setup

### Universal Trigger
- Type: Custom Event
- Event name: `custom_event`
- This trigger fires: All Custom Events

### Specific Triggers (Optional)
Create triggers for high-value events:
- `save_to_learn_submit`
- `save_note`
- `export_learn`
- `export_note`

Filter: eventAction equals [action name]

## Common Issues

### Events Not Firing
1. Check browser console for `[Analytics]` logs
2. Verify GTM container ID is correct
3. Check Network tab for GTM script load

### Events Not Showing in GTM
1. Enable GTM Preview Mode
2. Verify triggers are properly configured
3. Check that variables are created

### Content Script Events
Content script events are forwarded through background script. Check background script console for `[Analytics] Received tracking event` logs.

## Privacy Notes

- No personal text content is tracked
- No sensitive URLs logged
- Only interaction patterns and counts
- Implement user consent before enabling
- Respect Do Not Track preferences

## Support Files

- Full documentation: `docs/ANALYTICS_IMPLEMENTATION.md`
- Analytics service: `src/lib/analytics.ts`
- Event definitions: `src/lib/analytics.ts` (EventAction enum)
