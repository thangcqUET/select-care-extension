# Google Tag Manager Analytics - Implementation Summary

## ✅ Implementation Complete

Comprehensive Google Tag Manager (GTM) analytics tracking has been implemented across the Select Care extension.

## 📊 What's Been Tracked

### User Interactions Tracked (18 Events)

1. **Text Selection** - When users select text on webpages
2. **Save to Learn Click** - When users click the 🧠 button
3. **Save Note Click** - When users click the 📝 button
4. **Translation Request** - When translation API is called
5. **Definition Request** - When dictionary lookup is performed
6. **Mark to Save** - When users mark definitions for saving
7. **Save to Learn Submit** - When learn form is submitted
8. **Add Tag** - When users add tags to notes
9. **Add Comment** - When users type comments
10. **Save Note** - When note form is submitted
11. **Sidebar Opened** - When dashboard loads
12. **Filter Applied** - When users apply filters
13. **Search Performed** - When users search selections
14. **Edit Note Item** - When users edit note items
15. **Edit Learn Item** - When users edit learn items
16. **Delete Item** - When users delete items
17. **Export Note** - When users export notes
18. **Export Learn** - When users export learning items

## 📁 Files Created/Modified

### New Files
- ✅ `src/lib/analytics.ts` - Core analytics service with TypeScript types
- ✅ `docs/ANALYTICS_IMPLEMENTATION.md` - Comprehensive documentation
- ✅ `docs/ANALYTICS_QUICK_REFERENCE.md` - Quick reference guide

### Modified Files
- ✅ `src/content_scripts/content.ts` - Text selection tracking
- ✅ `src/content_scripts/components/SelectPopup.ts` - Popup button tracking
- ✅ `src/content_scripts/components/FormPopup.ts` - Form submission tracking
- ✅ `src/content_scripts/components/learn/LearnInput.tsx` - Translation/definition/mark tracking
- ✅ `src/content_scripts/components/note/NoteInput.ts` - Tag/comment tracking
- ✅ `src/dashboard/main.tsx` - GTM script injection for dashboard
- ✅ `src/extension_popup/main.tsx` - GTM script injection for popup
- ✅ `src/dashboard/Dashboard.tsx` - Sidebar/filter/search/edit/delete tracking
- ✅ `src/dashboard/ExportView.tsx` - Export tracking
- ✅ `src/service_worker/background.ts` - Analytics message handling

## 🚀 Setup Steps

### 1. Configure GTM Container IDs (Dev & Prod)

Edit `src/lib/environment.ts` and replace the placeholder GTM IDs:

```typescript
// src/lib/environment.ts (lines 23-28)
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    gtmId: 'GTM-DEV-XXXX', // 👈 Your DEV GTM container ID
    debug: true,
  },
  production: {
    gtmId: 'GTM-PROD-XXXX', // 👈 Your PROD GTM container ID
    debug: false,
  },
};
```

**The extension automatically uses the correct container based on the environment!**

📖 **See detailed guide:** `docs/ENVIRONMENT_SETUP.md`

### 2. Build the Extension
```bash
npm run build
```

### 3. Configure GTM

In your GTM container, create:

**Data Layer Variables:**
- eventCategory
- eventAction
- eventLabel
- eventValue
- timestamp
- customData

**Trigger:**
- Type: Custom Event
- Event name: `custom_event`

**Tag:**
- Type: Google Analytics (GA4 or Universal Analytics)
- Trigger: custom_event trigger
- Map variables to event parameters

## 🧪 Testing

### 1. Verify Installation
```bash
# Open browser DevTools → Network tab
# Load dashboard: chrome-extension://[id]/dashboard.html
# Look for: googletagmanager.com/gtm.js
```

### 2. Test Events
```bash
# Open browser DevTools → Console
# Look for: "[Analytics] Event tracked: ..." messages
```

### 3. GTM Preview Mode
1. Go to GTM → Preview
2. Enter extension URL
3. Perform actions in extension
4. Verify events appear in GTM Preview pane

## 📝 Event Structure

All events follow this structure:
```javascript
{
  event: 'custom_event',
  eventCategory: 'selection' | 'popup' | 'form' | 'note' | 'sidebar' | 'export',
  eventAction: 'text_selected' | 'save_to_learn_clicked' | ...,
  eventLabel?: string,
  eventValue?: number,
  timestamp: number,
  customData?: {
    // Context-specific data
  }
}
```

## 🔍 Debugging

### Environment Detection
On extension load, check console for environment info:
```
[Environment] Running in development mode
[Environment] GTM ID: GTM-DEV-XXXX
[Environment] Debug: true
```

### Debug Logging
- **Development**: All analytics events logged with `[Analytics] ✅ Event tracked: ...`
- **Production**: Silent mode (no console logs)

### Check Background Script
Content script events are forwarded to background script. Check service worker console for:
```
[Analytics] Received tracking event: {...}
```

### Force Debug Mode
```javascript
analytics.setDebugMode(true);  // Enable debug logs manually
```

### Common Issues

**Events not firing?**
- Check console for `[Analytics]` logs
- Verify GTM container ID is correct
- Ensure GTM script loaded (Network tab)

**Events not in GTM?**
- Enable GTM Preview Mode
- Verify trigger configuration
- Check variable mapping

## 🔒 Privacy & Compliance

- ✅ No personal text content tracked
- ✅ No sensitive URLs logged
- ✅ Only interaction patterns collected
- ⚠️ **TODO:** Implement user consent management
- ⚠️ **TODO:** Add opt-out mechanism

### Add Consent Management (Recommended)
```typescript
// Example implementation
const hasConsent = await getUserConsent();
analytics.setEnabled(hasConsent);
```

## 📖 Documentation

- **Full Documentation:** `docs/ANALYTICS_IMPLEMENTATION.md`
- **Quick Reference:** `docs/ANALYTICS_QUICK_REFERENCE.md`
- **API Reference:** `src/lib/analytics.ts` (inline documentation)

## 🎯 Key Features

### Type-Safe
- TypeScript enums for categories and actions
- Strongly typed event parameters
- IDE autocomplete support

### Context-Aware
- Automatically handles content script context
- Falls back to background script messaging
- Graceful degradation on errors

### Comprehensive
- 18+ tracked user interactions
- Rich custom data for each event
- Proper event categorization

### Developer-Friendly
- Console logging for debugging
- Clear error messages
- Extensive documentation

## 🔧 Maintenance

### Adding New Events

1. Add to `EventAction` enum in `src/lib/analytics.ts`
2. Add tracking call at appropriate location
3. Document in `docs/ANALYTICS_IMPLEMENTATION.md`
4. Update GTM configuration if needed

### Example
```typescript
// 1. Add to enum
export enum EventAction {
  NEW_ACTION = 'new_action',
}

// 2. Track it
analytics.trackEvent(
  EventCategory.FEATURE,
  EventAction.NEW_ACTION,
  'label',
  123,
  { custom: 'data' }
);
```

## 📊 Analytics Dashboard Recommendations

### Key Metrics to Track

1. **User Engagement**
   - Text selections per session
   - Learn vs Note usage ratio
   - Daily active features

2. **Feature Adoption**
   - Translation usage
   - Dictionary lookup frequency
   - Export feature usage

3. **User Behavior**
   - Search patterns
   - Filter usage
   - Edit/delete rates

4. **Conversion Funnels**
   - Selection → Popup → Save
   - Popup → Form → Submit
   - Dashboard → Export

## ✨ Next Steps

1. ✅ Replace GTM container ID
2. ✅ Build and test extension
3. ✅ Verify events in GTM Preview
4. ⚠️ Implement user consent
5. ⚠️ Configure GTM tags for your analytics platform
6. ⚠️ Set up custom dashboards
7. ⚠️ Monitor and iterate

## 🤝 Support

For questions or issues:
1. Check documentation in `docs/` folder
2. Review inline code comments in `src/lib/analytics.ts`
3. Test with GTM Preview Mode
4. Check browser console for debug messages

---

**Status:** ✅ Ready for Production (after GTM ID configuration)

**Last Updated:** October 14, 2025
