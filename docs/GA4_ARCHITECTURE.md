# GA4 Analytics Architecture

## Overview

This document explains how the Manifest V3 compliant analytics system works.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐        ┌──────────────┐                 │
│  │ Content      │        │  Dashboard   │                 │
│  │ Script       │        │  Popup UI    │                 │
│  └──────┬───────┘        └──────┬───────┘                 │
│         │                       │                          │
│         │ analytics.trackEvent()│                          │
│         └───────────┬───────────┘                          │
│                     │                                       │
│                     ▼                                       │
│         chrome.runtime.sendMessage()                       │
│                     │                                       │
│                     │                                       │
│  ┌──────────────────▼───────────────────┐                 │
│  │     Service Worker (background)      │                 │
│  │  - Receives analytics messages       │                 │
│  │  - Converts to GA4 format            │                 │
│  │  - Manages client ID (UUID)          │                 │
│  │  - Handles session tracking          │                 │
│  └──────────────────┬───────────────────┘                 │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      │ fetch() with Measurement Protocol
                      │
                      ▼
        ┌─────────────────────────────────┐
        │  GA4 Measurement Protocol API   │
        │  google-analytics.com/mp/collect│
        └─────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────┐
        │     Google Analytics 4          │
        │  - Processes events             │
        │  - Updates reports              │
        │  - Realtime dashboard           │
        └─────────────────────────────────┘
```

## Components

### 1. Analytics Class (`src/lib/analytics.ts`)

**Role**: Client-side event tracking interface

**Key Methods**:
- `trackEvent()` - Track custom events
- `trackPageView()` - Track page views
- `trackTextSelection()` - Track text selections
- `trackPopupClick()` - Track button clicks

**Example Usage**:
```typescript
import { analytics } from '../lib/analytics';

// Track a custom event
analytics.trackEvent('selection', 'text_selected', 'example.com', 42);
```

### 2. Service Worker (`src/service_worker/background.ts`)

**Role**: Analytics message handler and coordinator

**Responsibilities**:
- Initialize GA4 on extension startup
- Listen for analytics messages
- Convert to GA4 event format
- Forward to GA4 service
- Track lifecycle events (install, update)

**Flow**:
```typescript
// 1. Initialize GA4
initGA4({
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'secret',
  debug: false,
});

// 2. Handle messages
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'trackAnalytics') {
    // Convert and forward to GA4
    trackCustomEvent(category, action, label, value, data);
  }
});
```

### 3. GA4 Service (`src/service_worker/ga4.ts`)

**Role**: GA4 Measurement Protocol implementation

**Key Features**:
- Client ID management (persistent UUID)
- Session ID generation
- Event payload construction
- HTTP requests to GA4 API
- Debug mode support

**Event Format**:
```typescript
{
  client_id: "550e8400-e29b-41d4-a716-446655440000",
  events: [
    {
      name: "text_selected",
      params: {
        session_id: "1729612800000",
        engagement_time_msec: 100,
        event_category: "selection",
        event_label: "example.com",
        value: 42
      }
    }
  ]
}
```

## Data Flow

### Event Tracking Flow

1. **User Action**: User performs an action (e.g., selects text)

2. **Client Side**: Analytics class creates event object
   ```typescript
   analytics.trackTextSelection(42, 'https://example.com');
   ```

3. **Message Passing**: Event sent to service worker
   ```typescript
   chrome.runtime.sendMessage({
     action: 'trackAnalytics',
     data: {
       eventCategory: 'selection',
       eventAction: 'text_selected',
       eventLabel: 'https://example.com',
       eventValue: 42
     }
   });
   ```

4. **Service Worker**: Receives and processes message
   ```typescript
   // Convert to GA4 format
   trackCustomEvent('selection', 'text_selected', 'example.com', 42);
   ```

5. **GA4 Service**: Constructs and sends HTTP request
   ```typescript
   POST https://www.google-analytics.com/mp/collect
   ?measurement_id=G-XXXXXXXXXX&api_secret=SECRET
   
   Body: { client_id, events: [...] }
   ```

6. **GA4 Backend**: Processes event and updates reports

## Client ID Management

### Why Client ID?

- Tracks unique users across sessions
- Required by GA4 Measurement Protocol
- Enables user-level metrics

### Implementation

```typescript
// Generate once per installation
const clientId = crypto.randomUUID();
// Store in chrome.storage.local
await chrome.storage.local.set({ ga4_client_id: clientId });

// Reuse for all events
const stored = await chrome.storage.local.get(['ga4_client_id']);
const clientId = stored.ga4_client_id;
```

### Privacy Considerations

- ✅ Random UUID, not tied to user identity
- ✅ Stored locally, not shared
- ✅ Can be cleared by user
- ✅ No PII included

## Session Management

### Session ID

- Generated on service worker startup
- Timestamp-based (Date.now())
- Groups events into sessions

### Session Lifecycle

```
Extension Install → New Session ID
Service Worker Restart → New Session ID (after ~30 seconds idle)
User Action → Same Session ID (keeps worker alive)
```

## Event Categories

### Automatic Events

| Event | Trigger | Parameters |
|-------|---------|------------|
| `extension_installed` | First install | version, manifest_version |
| `extension_updated` | Update | version, previous_version |

### User Events

| Event | Trigger | Parameters |
|-------|---------|------------|
| `text_selected` | Text selection | length, sourceUrl |
| `save_to_learn_clicked` | Learn button | - |
| `save_note_clicked` | Note button | - |
| `page_view` | Page navigation | page_title, page_location |

### Custom Events

Use the generic `trackEvent()` method:

```typescript
analytics.trackEvent('category', 'action', 'label', value, {
  custom_param: 'value'
});
```

## Debug Mode

### Enable Debug Mode

```typescript
initGA4({
  measurementId: 'G-XXXXXXXXXX',
  apiSecret: 'secret',
  debug: true, // Enable debug endpoint
});
```

### Debug Features

- Uses GA4 debug endpoint
- Returns validation messages
- Shows detailed console logs
- No data sent to production GA4

### Debug Output

```javascript
[GA4 Debug] Response: {
  validationMessages: [
    {
      fieldPath: "events[0].name",
      description: "Event name must be valid",
      validationCode: "INVALID_EVENT_NAME"
    }
  ]
}
```

## Error Handling

### Graceful Degradation

```typescript
try {
  await trackEvent('event_name', params);
} catch (error) {
  // Log error but don't break functionality
  console.error('[GA4] Failed to track event:', error);
}
```

### Retry Strategy

- No automatic retries (service worker lifecycle constraints)
- Failed events are logged but not queued
- User actions continue normally even if tracking fails

## Performance Considerations

### Service Worker Lifecycle

- Service worker stops after ~30 seconds idle
- Keep tracking code minimal
- Use async/await properly
- Don't block on tracking responses

### Network Efficiency

- Batch events when possible
- Use lightweight payloads
- No blocking requests in UI

## Security

### API Secret Protection

⚠️ **Security Note**: API Secret is embedded in extension code

**Mitigation Options**:

1. **Extension-only risk**: Secret only works with your measurement ID
2. **Proxy server**: Route through your own API (hides secret)
3. **Rate limiting**: Monitor GA4 for unusual activity
4. **Separate properties**: Use different properties for dev/prod

### Recommended: Proxy Architecture

```
Extension → Your API → GA4
         (hides secret)
```

Benefits:
- API secret stays on server
- Additional validation layer
- Rate limiting control
- More flexibility

## Testing

### Local Testing

1. Load unpacked extension
2. Open service worker devtools
3. Perform actions
4. Check console logs
5. Verify network requests

### Verify in GA4

1. Go to Realtime report
2. Trigger events
3. Wait 10-30 seconds
4. Check event list

### Debug Checklist

- [ ] Service worker initializes GA4
- [ ] Client ID is generated/retrieved
- [ ] Messages reach service worker
- [ ] Events convert to GA4 format
- [ ] HTTP requests succeed (200 OK)
- [ ] Events appear in GA4 Realtime

## Compliance

### Manifest V3 Requirements

✅ No remote code execution
✅ No `eval()` or `Function()`
✅ No external script loading
✅ Uses Measurement Protocol API
✅ All code bundled in extension

### Privacy Requirements

✅ No PII collected
✅ Anonymous tracking (UUID)
✅ User can disable
✅ Transparent to user
✅ GDPR friendly (with consent)

## Maintenance

### Updating GA4 Credentials

1. Edit `src/service_worker/background.ts`
2. Replace `GA4_MEASUREMENT_ID` and `GA4_API_SECRET`
3. Rebuild extension
4. Update extension in Chrome

### Adding New Events

1. Add tracking call in client code:
   ```typescript
   analytics.trackEvent('category', 'new_action', 'label');
   ```

2. Event automatically forwarded through existing pipeline
3. Verify in GA4 Realtime

### Monitoring

- Check GA4 Realtime report daily
- Set up GA4 alerts for anomalies
- Monitor service worker logs for errors
- Track event volume trends

## Resources

- [Source Code: `src/service_worker/ga4.ts`](../src/service_worker/ga4.ts)
- [Source Code: `src/service_worker/background.ts`](../src/service_worker/background.ts)
- [Source Code: `src/lib/analytics.ts`](../src/lib/analytics.ts)
- [Setup Guide](./GA4_SETUP.md)
- [Full Implementation Guide](./MANIFEST_V3_ANALYTICS_GUIDE.md)
