# Dev vs Prod Setup - Quick Visual Guide

## 🎯 The Solution

Instead of manually changing GTM IDs, the extension **automatically detects** whether it's running in development or production and loads the correct GTM container!

---

## 📍 Single Configuration File

### Edit ONE file: `src/lib/environment.ts`

```typescript
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    gtmId: 'GTM-ABC123D',  // 👈 Your DEV container
    debug: true,           // 👈 Console logs enabled
  },
  production: {
    gtmId: 'GTM-XYZ789P',  // 👈 Your PROD container
    debug: false,          // 👈 No console logs
  },
};
```

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  Extension Loads                                             │
│  ├─ Check manifest name → Contains "DEV"?                   │
│  ├─ Check extension ID → Unpacked (long ID)?                │
│  ├─ Check hostname → localhost?                             │
│  └─ Result: DEVELOPMENT or PRODUCTION                       │
└─────────────────────────────────────────────────────────────┘
            ↓                           ↓
    ┌───────────────┐          ┌───────────────┐
    │  Development  │          │  Production   │
    ├───────────────┤          ├───────────────┤
    │ GTM-ABC123D   │          │ GTM-XYZ789P   │
    │ Debug: ON     │          │ Debug: OFF    │
    │ Logs: ✅      │          │ Logs: ❌      │
    └───────────────┘          └───────────────┘
```

---

## ✅ Setup Checklist

### Step 1: Create GTM Containers
- [ ] Create "Project Name - DEV" in Google Tag Manager
- [ ] Copy DEV container ID (e.g., `GTM-ABC123D`)
- [ ] Create "Project Name - PROD" in Google Tag Manager  
- [ ] Copy PROD container ID (e.g., `GTM-XYZ789P`)

### Step 2: Configure Environment File
- [ ] Open `src/lib/environment.ts`
- [ ] Replace `GTM-DEV-XXXX` with your DEV container ID (line 23)
- [ ] Replace `GTM-PROD-XXXX` with your PROD container ID (line 28)
- [ ] Save file

### Step 3: Build & Test
- [ ] Run `npm run build`
- [ ] Load unpacked extension (will use DEV container)
- [ ] Check console: Should see `[Environment] Running in development mode`
- [ ] Check console: Should see `[Environment] GTM ID: GTM-ABC123D`

### Step 4: Verify Events
- [ ] Perform some actions (select text, save, etc.)
- [ ] Check console for `[Analytics] ✅ Event tracked: ...`
- [ ] Open GTM Preview mode and connect to DEV container
- [ ] Verify events appear in GTM Preview

### Step 5: Production Testing
- [ ] Remove "DEV" from manifest.json name
- [ ] Build again: `npm run build`
- [ ] Package as .zip or publish
- [ ] Install production version
- [ ] Check console: Should see `[Environment] Running in production mode`
- [ ] Check console: Should see `[Environment] GTM ID: GTM-XYZ789P`
- [ ] Verify no debug logs appear (clean console)

---

## 🎨 Visual Comparison

### Development Environment
```
┌──────────────────────────────────────────────┐
│ Extension Name: "Select Care (DEV)"          │
│ Loaded: Unpacked from dist/ folder           │
│ GTM Container: GTM-ABC123D                   │
│ Console:                                     │
│   [Environment] Running in development mode  │
│   [Analytics] ✅ Event tracked: {...}        │
│   [Analytics] ✅ Event tracked: {...}        │
└──────────────────────────────────────────────┘
```

### Production Environment
```
┌──────────────────────────────────────────────┐
│ Extension Name: "Select Care"                │
│ Loaded: From Chrome Web Store                │
│ GTM Container: GTM-XYZ789P                   │
│ Console:                                     │
│   [Environment] Running in production mode   │
│   (no debug logs)                            │
└──────────────────────────────────────────────┘
```

---

## 🔧 Pro Tips

### Tip 1: Use Descriptive Names
```json
// manifest.json (development)
{
  "name": "Select Care Extension (DEV)",
  "version": "1.0.0-dev"
}

// manifest.json (production)
{
  "name": "Select Care Extension",
  "version": "1.0.0"
}
```

### Tip 2: Quick Environment Check
Open extension → DevTools → Console → Look for first log:
- `[Environment] Running in development mode` ✅ Using DEV container
- `[Environment] Running in production mode` ✅ Using PROD container

### Tip 3: Force Debug in Production (Testing Only)
```javascript
// In console
analytics.setDebugMode(true);
// Now you'll see analytics logs even in production
```

### Tip 4: GTM Preview Mode
**Development:**
1. Open GTM → Preview → Connect to: `chrome-extension://[long-id]/dashboard.html`
2. Uses DEV container automatically

**Production:**
1. Open GTM → Preview → Connect to published extension
2. Uses PROD container automatically

---

## 📊 What Goes Where

| Feature | Development (DEV) | Production (PROD) |
|---------|------------------|-------------------|
| **GTM Container** | GTM-ABC123D | GTM-XYZ789P |
| **Console Logs** | ✅ Verbose | ❌ Silent |
| **Environment** | Auto-detected (unpacked) | Auto-detected (published) |
| **Purpose** | Testing & Debugging | Real User Data |
| **GA4 Property** | Test Property | Production Property |
| **Tag Testing** | Aggressive testing OK | Careful changes only |

---

## 🚫 Common Mistakes

### ❌ Mistake 1: Hardcoding GTM IDs
```typescript
// DON'T do this:
const GTM_ID = 'GTM-ABC123D';  // Always uses dev!
```

### ✅ Correct:
```typescript
// DO this:
const GTM_ID = getGTMId();  // Auto-selects based on environment
```

### ❌ Mistake 2: Same GTM ID for Both
```typescript
// DON'T do this:
development: { gtmId: 'GTM-ABC123D' },
production:  { gtmId: 'GTM-ABC123D' },  // ⚠️ Same ID!
```

### ✅ Correct:
```typescript
// DO this:
development: { gtmId: 'GTM-ABC123D' },  // Dev container
production:  { gtmId: 'GTM-XYZ789P' },  // Prod container (different!)
```

### ❌ Mistake 3: Not Rebuilding After Changes
```bash
# Changed environment.ts but forgot to rebuild
# Extension still uses old IDs!
```

### ✅ Correct:
```bash
# Always rebuild after changing environment.ts
npm run build
# Then reload extension in Chrome
```

---

## 🎯 Quick Test Script

Run this in extension console to verify setup:

```javascript
// Check current environment
console.log('Current GTM ID:', getGTMId());
console.log('Debug mode:', isDebugMode());
console.log('Environment:', getEnvironment());

// Force a test event
analytics.trackEvent(
  'test',
  'test_event',
  'Testing environment setup',
  123,
  { timestamp: Date.now() }
);
```

Expected output in **Development**:
```
Current GTM ID: GTM-ABC123D
Debug mode: true
Environment: development
[Analytics] ✅ Event tracked: {...}
```

Expected output in **Production**:
```
Current GTM ID: GTM-XYZ789P
Debug mode: false
Environment: production
(no additional logs)
```

---

## 📚 More Information

- **Full Setup Guide:** `docs/ENVIRONMENT_SETUP.md`
- **Analytics Guide:** `ANALYTICS_README.md`
- **Implementation Details:** `docs/ANALYTICS_IMPLEMENTATION.md`

---

**Summary:** Configure once in `environment.ts`, build normally, and the extension handles the rest! 🎉
