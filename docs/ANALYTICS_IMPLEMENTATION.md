# Google Tag Manager Analytics Implementation

This document describes the comprehensive analytics implementation for tracking user interactions across the Select Care extension.

## Overview

The extension now includes Google Tag Manager (GTM) integration to track all major user interactions, providing insights into user behavior and feature usage.

## Setup Instructions

### 1. Configure GTM Container IDs (Development & Production)

Edit `src/lib/environment.ts` and replace the placeholder GTM IDs:

```typescript
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    gtmId: 'GTM-DEV-XXXX', // Replace with your DEV GTM container ID
    debug: true,
  },
  production: {
    gtmId: 'GTM-PROD-XXXX', // Replace with your PROD GTM container ID
    debug: false,
  },
};
```

The extension automatically detects the environment and uses the appropriate GTM container.

**See:** `docs/ENVIRONMENT_SETUP.md` for detailed environment configuration.

### 2. GTM Configuration

The GTM script is automatically injected when the dashboard or popup pages load. No manual script tags are needed in HTML files. The correct GTM container (dev or prod) is loaded based on the environment.

## Architecture

### Core Analytics Service

**File:** `src/lib/analytics.ts`

The centralized analytics service provides:
- Type-safe event tracking
- Automatic fallback for content script contexts
- Event categories and actions enumeration
- Helper methods for common tracking scenarios

### Key Components

1. **EventCategory Enum**: Organizes events by feature area
   - SELECTION, POPUP, FORM, NOTE, SIDEBAR, EXPORT, LEARN

2. **EventAction Enum**: Defines specific user actions
   - 20+ predefined actions covering all user interactions

3. **Analytics Class**: Singleton instance with methods:
   - `trackEvent()` - Generic event tracking
   - `trackTextSelection()` - Track text selections
   - `trackPopupClick()` - Track popup button clicks
   - `trackFormAction()` - Track form interactions
   - `trackNoteAction()` - Track note-related actions
   - `trackSidebarAction()` - Track dashboard interactions
   - `trackExportAction()` - Track export actions

## Tracked Events

### 1. Text Selection Events
**Location:** `src/content_scripts/content.ts`

Tracked when user selects text on a webpage:
```typescript
{
  eventCategory: 'selection',
  eventAction: 'text_selected',
  eventLabel: sourceUrl,
  eventValue: textLength,
  customData: { textLength, sourceUrl }
}
```

### 2. Popup Button Clicks
**Location:** `src/content_scripts/components/SelectPopup.ts`

Tracked when user clicks "Save to Learn" or "Save as Note":
```typescript
{
  eventCategory: 'popup',
  eventAction: 'save_to_learn_clicked' | 'save_note_clicked',
  eventLabel: buttonType
}
```

### 3. Form Actions
**Locations:**
- `src/content_scripts/components/FormPopup.ts`
- `src/content_scripts/components/learn/LearnInput.tsx`

#### Translation Request
```typescript
{
  eventCategory: 'form',
  eventAction: 'translate_requested',
  customData: { text, sourceLang, targetLang }
}
```

#### Definition Request
```typescript
{
  eventCategory: 'form',
  eventAction: 'definition_requested',
  customData: { text, sourceLang, targetLang, resultCount }
}
```

#### Mark to Save
```typescript
{
  eventCategory: 'form',
  eventAction: 'mark_to_save',
  customData: { partOfSpeech, meaningIndex, hasDefinition }
}
```

#### Save to Learn Submit
```typescript
{
  eventCategory: 'form',
  eventAction: 'save_to_learn_submit',
  customData: { textLength, sourceUrl, hasPieces }
}
```

### 4. Note Actions
**Location:** `src/content_scripts/components/note/NoteInput.ts`

#### Add Tag
```typescript
{
  eventCategory: 'note',
  eventAction: 'add_tag',
  customData: { tagCount, newTag }
}
```

#### Add Comment
```typescript
{
  eventCategory: 'note',
  eventAction: 'add_comment',
  customData: { commentLength }
}
```

#### Save Note
```typescript
{
  eventCategory: 'note',
  eventAction: 'save_note',
  customData: { textLength, sourceUrl, tagCount, hasComment }
}
```

### 5. Sidebar/Dashboard Actions
**Location:** `src/dashboard/Dashboard.tsx`

#### Sidebar Opened
```typescript
{
  eventCategory: 'sidebar',
  eventAction: 'sidebar_opened'
}
```

#### Filter Applied
```typescript
{
  eventCategory: 'sidebar',
  eventAction: 'filter_applied',
  customData: { 
    filterType: 'tag' | 'actionType',
    tag?, 
    actionType?,
    action: 'add' | 'remove',
    totalTags?,
    resultCount?
  }
}
```

#### Search Performed
```typescript
{
  eventCategory: 'sidebar',
  eventAction: 'search_performed',
  customData: { query, resultCount }
}
```

#### Edit Item
```typescript
{
  eventCategory: 'sidebar',
  eventAction: 'edit_note_item' | 'edit_learn_item',
  customData: { itemType, itemId, hasComment, tagCount }
}
```

#### Delete Item
```typescript
{
  eventCategory: 'sidebar',
  eventAction: 'delete_item',
  customData: { itemType, itemId }
}
```

### 6. Export Actions
**Location:** `src/dashboard/ExportView.tsx`

#### Export App Selected
```typescript
{
  eventCategory: 'export',
  eventAction: 'export_app_selected',
  eventLabel: targetApp,
  customData: { exportType: 'learning' | 'note' }
}
```

#### Export Note/Learn
```typescript
{
  eventCategory: 'export',
  eventAction: 'export_note' | 'export_learn',
  eventLabel: targetApp,
  customData: { method: 'file' | 'copy' | 'api', itemCount, format }
}
```

## Data Layer Structure

All events push data to the GTM dataLayer with the following structure:

```javascript
{
  event: 'custom_event',
  eventCategory: string,
  eventAction: string,
  eventLabel?: string,
  eventValue?: number,
  timestamp: number,
  customData?: Record<string, any>
}
```

## GTM Tag Configuration

### Recommended Tags

1. **Universal Analytics / GA4 Event Tag**
   - Trigger: Custom Event = 'custom_event'
   - Event Parameters:
     - Category: {{eventCategory}}
     - Action: {{eventAction}}
     - Label: {{eventLabel}}
     - Value: {{eventValue}}

2. **Custom Tracking Tags**
   - Create specific triggers for high-value events
   - Examples: 'save_to_learn_submit', 'export_learn', 'export_note'

### Recommended Variables

Create Data Layer Variables for:
- eventCategory
- eventAction
- eventLabel
- eventValue
- timestamp
- customData

## Privacy & Compliance

### Data Collected
- User action types (no PII)
- Interaction counts and frequencies
- Feature usage patterns
- No personal text content is tracked
- No URLs with sensitive information

### GDPR Compliance
- Implement user consent management
- Add opt-out mechanism via `analytics.setEnabled(false)`
- Respect Do Not Track preferences

### Implementation Example
```typescript
// Check user consent
const hasConsent = await checkUserConsent();
analytics.setEnabled(hasConsent);
```

## Testing

### 1. Verify GTM Installation
- Open browser DevTools → Network tab
- Load dashboard or popup
- Look for request to `googletagmanager.com/gtm.js`

### 2. Test Event Tracking
- Open browser DevTools → Console
- Look for `[Analytics] Event tracked:` log messages
- Or use GTM Preview Mode

### 3. GTM Preview Mode
1. Open GTM → Preview
2. Enter extension URL (e.g., `chrome-extension://[id]/dashboard.html`)
3. Perform actions in extension
4. Verify events in GTM Preview pane

## Debugging

### Enable Debug Logging
All tracking events are logged to console with `[Analytics]` prefix.

### Content Script Context
Content scripts can't access window.dataLayer directly. Events are forwarded to the background script:
```typescript
chrome.runtime.sendMessage({
  action: 'trackAnalytics',
  data: eventData
});
```

### Background Script Handling
**File:** `src/service_worker/background.ts`

The background script receives and logs analytics events from content scripts.

## Performance Considerations

1. **Throttled Events**: Text selection tracking is throttled to avoid excessive events
2. **Asynchronous**: All tracking is non-blocking
3. **Graceful Degradation**: Failures don't interrupt user experience

## Future Enhancements

1. **Server-Side Tracking**: Send events to custom analytics endpoint
2. **Session Management**: Track user sessions and engagement time
3. **A/B Testing**: Support for feature flag tracking
4. **Funnel Analysis**: Track conversion funnels (selection → save → learn)
5. **Performance Metrics**: Track feature load times and responsiveness

## Maintenance

### Adding New Events

1. Add action to `EventAction` enum in `analytics.ts`
2. Implement tracking call at appropriate location
3. Document event structure in this file
4. Update GTM tags/triggers as needed

### Example
```typescript
// 1. Add to EventAction enum
export enum EventAction {
  // ... existing actions
  NEW_FEATURE_CLICKED = 'new_feature_clicked',
}

// 2. Track the event
analytics.trackEvent(
  EventCategory.FEATURE,
  EventAction.NEW_FEATURE_CLICKED,
  'feature-label',
  undefined,
  { additionalData: 'value' }
);
```

## Support

For issues or questions about analytics implementation:
1. Check browser console for `[Analytics]` messages
2. Verify GTM container ID is correct
3. Use GTM Preview Mode for debugging
4. Review this documentation for event structure

## Summary

The extension now tracks:
- ✅ Text selection events
- ✅ Popup button clicks (Save to Learn, Save Note)
- ✅ Translation requests
- ✅ Definition lookups
- ✅ Mark to save actions
- ✅ Save to learn submissions
- ✅ Tag additions
- ✅ Comment additions
- ✅ Note saves
- ✅ Sidebar opens
- ✅ Filter applications
- ✅ Search queries
- ✅ Item edits (notes & learn)
- ✅ Item deletions
- ✅ Export app selections
- ✅ Export actions (note & learn)

All events are properly typed, documented, and ready for analysis in Google Tag Manager.
