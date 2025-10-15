# Development vs Production Environment Setup

This guide explains how to configure separate GTM containers for development and production environments.

## Overview

The extension now automatically detects whether it's running in development or production mode and uses the appropriate GTM container ID. This allows you to:

- Test analytics in development without affecting production data
- Use different GTM configurations for dev and prod
- Debug analytics events in development mode
- Keep production analytics clean

## Quick Setup

### 1. Create Two GTM Containers

In [Google Tag Manager](https://tagmanager.google.com/):

1. **Development Container**
   - Name: "Select Care Extension - DEV"
   - Copy the container ID (e.g., `GTM-ABC123D`)

2. **Production Container**
   - Name: "Select Care Extension - PROD"
   - Copy the container ID (e.g., `GTM-XYZ789P`)

### 2. Configure Environment File

Edit `src/lib/environment.ts` and replace the placeholder IDs:

```typescript
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    gtmId: 'GTM-ABC123D', // 👈 Replace with your DEV GTM container ID
    debug: true,
    apiEndpoint: 'http://localhost:3001',
  },
  production: {
    gtmId: 'GTM-XYZ789P', // 👈 Replace with your PROD GTM container ID
    debug: false,
    apiEndpoint: 'https://your-domain.com',
  },
};
```

### 3. Build for Different Environments

The extension automatically detects the environment. No build flags needed!

```bash
# Development build (unpacked extension)
npm run build

# Production build (same command, but load from .zip or published)
npm run build
```

## How Environment Detection Works

The extension uses multiple methods to detect the environment:

### Method 1: Manifest Detection
Checks if the extension name or version contains 'dev' or 'development':
```json
// Development manifest
{
  "name": "Select Care Extension (DEV)",
  "version": "1.0.0-dev"
}

// Production manifest  
{
  "name": "Select Care Extension",
  "version": "1.0.0"
}
```

### Method 2: Extension ID Length
- **Development**: Unpacked extensions have longer, random IDs (>32 chars)
- **Production**: Published extensions have shorter, consistent IDs

### Method 3: Hostname Detection
- Checks if running from `localhost` or `127.0.0.1`

### Default Behavior
- If detection is uncertain, defaults to **production** for safety

## Testing the Setup

### 1. Check Console on Load

When the extension loads, you'll see:

**Development:**
```
[Environment] Running in development mode
[Environment] GTM ID: GTM-ABC123D
[Environment] Debug: true
[Environment] Extension ID: abcdef...
[Environment] Version: 1.0.0-dev
```

**Production:**
```
[Environment] Running in production mode
[Environment] GTM ID: GTM-XYZ789P
[Environment] Debug: false
[Environment] Extension ID: xyz123...
[Environment] Version: 1.0.0
```

### 2. Check Analytics Events

**Development (debug mode enabled):**
```
[Analytics] ✅ Event tracked: {
  event: 'custom_event',
  eventCategory: 'selection',
  eventAction: 'text_selected',
  ...
}
```

**Production (debug mode disabled):**
```
// No console logs (cleaner production experience)
```

## Recommended Workflow

### Development
1. Use unpacked extension (load from `dist/` folder)
2. Name includes "DEV" in manifest
3. All analytics events logged to console
4. Events go to DEV GTM container
5. Can test tags without affecting production

### Production
1. Build and package as `.zip` or publish to Chrome Web Store
2. Remove "DEV" from name in manifest
3. No debug logs in console
4. Events go to PROD GTM container
5. Clean analytics data

## Advanced: Manual Environment Control

If you need to force a specific environment, you can modify `environment.ts`:

```typescript
export function getEnvironment(): Environment {
  // Force development (for testing)
  return 'development';
  
  // Force production (for testing)
  return 'production';
  
  // Or use auto-detection (recommended)
  // ... existing detection logic
}
```

## Build Scripts for Different Environments

You can create custom npm scripts for clearer builds:

Add to `package.json`:

```json
{
  "scripts": {
    "build": "tsc -b && vite build && npm run build:content:nomodule",
    "build:dev": "cross-env NODE_ENV=development npm run build",
    "build:prod": "cross-env NODE_ENV=production npm run build"
  }
}
```

Then update `environment.ts` to check `process.env.NODE_ENV` if needed.

## Using Multiple Manifest Files

For more control, you can maintain separate manifest files:

**manifest.dev.json:**
```json
{
  "name": "Select Care Extension (DEV)",
  "version": "1.0.0-dev"
}
```

**manifest.prod.json:**
```json
{
  "name": "Select Care Extension",
  "version": "1.0.0"
}
```

Copy the appropriate one during build:

```json
{
  "scripts": {
    "build:dev": "cp manifest.dev.json public/manifest.json && npm run build",
    "build:prod": "cp manifest.prod.json public/manifest.json && npm run build"
  }
}
```

## GTM Container Configuration

### Development Container
- **Purpose**: Testing and debugging
- **Recommended Setup**:
  - Enable debug mode in all tags
  - Create test triggers
  - Use GA4 Debug View
  - Add console.log() in custom HTML tags
  - Don't worry about data quality

### Production Container
- **Purpose**: Real user data
- **Recommended Setup**:
  - Production GA4 property
  - Proper tag configuration
  - Data filters and transformations
  - GDPR compliance tags
  - Error tracking

## Troubleshooting

### Wrong GTM Container Loading

**Check environment detection:**
```javascript
// Open extension → DevTools → Console
// You'll see environment logs on load
```

**Force re-detection:**
1. Reload the extension
2. Check console for environment logs
3. Verify GTM ID matches expectation

### Events Going to Wrong Container

**Verify configuration:**
1. Open `src/lib/environment.ts`
2. Check both GTM IDs are correct
3. Rebuild extension: `npm run build`
4. Reload extension in Chrome

### Debug Mode Not Working

**Check analytics setup:**
```javascript
// In console:
analytics.setDebugMode(true);  // Force enable debug mode
```

## Best Practices

1. **Always use DEV container during development**
   - Keeps production data clean
   - Allows aggressive testing
   - No risk of polluting analytics

2. **Test in DEV before pushing to PROD**
   - Verify all events fire correctly
   - Check GTM Preview Mode
   - Validate data structure

3. **Use descriptive container names**
   - "Project Name - DEV"
   - "Project Name - PROD"
   - Makes it clear which is which

4. **Document your GTM IDs**
   - Keep them in team documentation
   - Store in password manager
   - Don't commit real IDs to public repos

5. **Monitor both containers**
   - Check DEV for testing completeness
   - Monitor PROD for issues
   - Compare event structures

## Environment Variables Summary

| Variable | Development | Production |
|----------|------------|------------|
| `gtmId` | GTM-ABC123D (dev container) | GTM-XYZ789P (prod container) |
| `debug` | `true` (console logs enabled) | `false` (silent) |
| `apiEndpoint` | `http://localhost:3001` | `https://your-domain.com` |

## Security Notes

- ✅ GTM IDs are public (safe to expose)
- ✅ No sensitive data in analytics events
- ✅ Debug logs only in development
- ⚠️ Still implement user consent
- ⚠️ Follow GDPR requirements

## Support

Having issues with environment detection?

1. Check console for `[Environment]` logs
2. Verify GTM IDs in `environment.ts`
3. Try forcing environment temporarily
4. Check extension manifest name/version
5. Review `environment.ts` detection logic

---

**Quick Reference:**
- Edit: `src/lib/environment.ts`
- Dev GTM ID: Line 23
- Prod GTM ID: Line 28
- Auto-detection: Lines 10-45
