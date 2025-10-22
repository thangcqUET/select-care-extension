# GA4 Analytics Setup Guide# GA4 Analytics Setup Instructions



## Overview## Quick Start



The extension now uses a **secure server-side proxy** for GA4 analytics. API secrets are stored safely on your Next.js backend server, not in the extension code where users could extract them.### Step 1: Create GA4 Property



## Architecture1. Go to [Google Analytics](https://analytics.google.com/)

2. Create a new GA4 property or use an existing one

```3. Note your **Measurement ID** (format: `G-XXXXXXXXXX`)

Extension → Next.js API (/api/analytics/track) → GA4 Measurement Protocol

           (with JWT token)              (with API secret)### Step 2: Generate API Secret

```

1. In GA4, go to **Admin** (bottom left)

**Security Benefits:**2. Under **Data collection and modification**, click **Data Streams**

- ✅ API secrets never exposed to users3. Select your web data stream (or create one if needed)

- ✅ User authentication required (JWT token)4. Scroll down to **Measurement Protocol API secrets**

- ✅ Events validated on server before forwarding to GA45. Click **Create** to generate a new API secret

- ✅ Can rotate secrets anytime without updating extension6. Copy the secret value

- ✅ Prevents quota abuse and fake data injection

### Step 3: Configure Extension

## Setup Instructions

The extension automatically loads GA4 credentials based on the environment (development/production).

### 1. Create GA4 Properties (DEV & PROD)

Edit `src/lib/environment.ts` and replace the placeholder values:

1. Go to [Google Analytics](https://analytics.google.com/)

2. Create **two separate GA4 properties**:```typescript

   - One for development/testingconst configs: Record<Environment, EnvironmentConfig> = {

   - One for production  development: {

    debug: true,

### 2. Get Measurement IDs    apiEndpoint: 'http://localhost:3001',

    ga4MeasurementId: 'G-XXXXXXXXXX', // Your DEV GA4 Measurement ID

For **both** properties:    ga4ApiSecret: 'your_dev_api_secret_here', // Your DEV GA4 API Secret

1. In GA4, go to **Admin** → **Data Streams**  },

2. Select your web data stream  production: {

3. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)    debug: false,

    apiEndpoint: 'https://main.djfc0uq2bj5xw.amplifyapp.com',

### 3. Generate API Secrets    ga4MeasurementId: 'G-YYYYYYYYYY', // Your PROD GA4 Measurement ID

    ga4ApiSecret: 'your_prod_api_secret_here', // Your PROD GA4 API Secret

For **both** properties:  },

1. In the data stream settings, scroll to **Measurement Protocol API secrets**};

2. Click **Create** to generate a new secret```

3. Give it a descriptive name (e.g., "Extension Analytics - DEV")

4. Copy the secret value**Repeat Steps 1-2 to create separate GA4 properties for DEV and PROD environments.**



### 4. Configure Next.js Backend### Step 4: Build and Test



Add the credentials to your `.env.local` file in `select-care-frontend`:```bash

# Build the extension

```bashnpm run build

# GA4 Analytics - Development Environment

GA4_DEV_MEASUREMENT_ID=G-XXXXXXXXXX# Load the extension in Chrome:

GA4_DEV_API_SECRET=abc123def456...# 1. Go to chrome://extensions/

# 2. Enable "Developer mode"

# GA4 Analytics - Production Environment# 3. Click "Load unpacked"

GA4_PROD_MEASUREMENT_ID=G-YYYYYYYYYY# 4. Select the 'dist' folder

GA4_PROD_API_SECRET=xyz789uvw012...```

```

### Step 5: Verify Events

**Important:** Add `.env.local` to `.gitignore` (it should already be there)

1. Go to GA4 → **Reports** → **Realtime**

### 5. Deploy Next.js Backend2. Perform actions in your extension (install, use features, etc.)

3. Events should appear in Realtime within 10-30 seconds

Add the same environment variables to your production hosting (Vercel/AWS/etc.):

## Environment Variables (Optional)

**Vercel:**

1. Go to Project Settings → Environment VariablesFor better security, use environment variables:

2. Add all four variables

3. Redeploy1. Create `.env` file:

```bash

**AWS Amplify:**GA4_MEASUREMENT_ID=G-XXXXXXXXXX

1. Go to App Settings → Environment VariablesGA4_API_SECRET=your_api_secret_here

2. Add all four variables```

3. Redeploy

2. Update `background.ts`:

### 6. Test the Extension```typescript

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

1. **Build the extension:**const GA4_API_SECRET = import.meta.env.VITE_GA4_API_SECRET;

   ```bash```

   cd select-care-extension

   npm run build3. Add to `.gitignore`:

   ``````

.env

2. **Load in Chrome:**.env.local

   - Go to `chrome://extensions/````

   - Enable "Developer mode"

   - Click "Load unpacked"## Tracked Events

   - Select the `dist` folder

The following events are automatically tracked:

3. **Authenticate:**

   - The extension must be authenticated (JWT token required)| Event Name | Trigger | Parameters |

   - Log in through your web app first|------------|---------|------------|

| `extension_installed` | First installation | version, manifest_version |

4. **Verify events:**| `extension_updated` | Extension update | version, previous_version |

   - Open extension service worker devtools| `text_selected` | User selects text | length, sourceUrl |

   - Perform actions (text selection, clicks, etc.)| `save_to_learn_clicked` | Learn button clicked | - |

   - Check console for `[GA4]` messages| `save_note_clicked` | Note button clicked | - |

   - Go to GA4 → **Realtime** report| `translate_requested` | Translation requested | details |

   - Events should appear within 10-30 seconds| `note_saved` | Note is saved | details |



## How It Works## Privacy & Compliance



### Extension Side (src/service_worker/ga4.ts)✅ **No PII**: We don't send personal information

✅ **Anonymous**: Client IDs are randomly generated UUIDs

```typescript✅ **User Control**: Users can disable analytics via settings

// No API secrets in extension code!✅ **Manifest V3 Compliant**: No remote code execution

async trackEvent(event: GA4Event): Promise<boolean> {✅ **No Cookies**: Extension-based tracking only

  const token = await this.getAuthToken(); // JWT from login

  ## Troubleshooting

  const response = await fetch(apiEndpoint + '/api/analytics/track', {

    method: 'POST',### Events Not Appearing in GA4?

    headers: {

      'Authorization': `Bearer ${token}`, // Authenticate1. **Check Console Logs**:

      'Content-Type': 'application/json',   - Go to `chrome://extensions/`

    },   - Click "service worker" under your extension

    body: JSON.stringify({   - Look for `[GA4]` log messages

      event: 'text_selected',

      params: { /* event data */ },2. **Verify Credentials**:

    }),   - Double-check Measurement ID format (`G-XXXXXXXXXX`)

  });   - Ensure API Secret is correct (no extra spaces)

  

  return response.ok;3. **Enable Debug Mode**:

}   ```typescript

```   const IS_DEBUG = true;

   ```

### Server Side (src/app/api/analytics/track/route.ts)   This will show detailed responses from GA4



```typescript4. **Check Network Tab**:

export async function POST(request: NextRequest) {   - Service worker dev tools → Network

  // 1. Verify JWT token   - Look for requests to `google-analytics.com/mp/collect`

  const user = verifyToken(authHeader);   - Status should be `200 OK`

  

  // 2. Determine environment (dev/prod)### Common Issues

  const env = getEnvironment(request);

  **Issue**: `GA4 not initialized` error

  // 3. Get secure credentials from environment variables**Solution**: Make sure `initGA4()` is called before any tracking

  const config = GA4_CONFIG[env];

  **Issue**: Events show in debug but not in Realtime

  // 4. Forward to GA4 with API secret**Solution**: Debug endpoint validation doesn't send to GA4. Set `debug: false`

  await fetch(

    `https://www.google-analytics.com/mp/collect?measurement_id=${config.measurementId}&api_secret=${config.apiSecret}`,**Issue**: CORS errors

    { /* ... */ }**Solution**: This shouldn't happen with Measurement Protocol, but check if you're using the correct endpoint

  );

}## Testing Checklist

```

- [ ] Extension installs successfully

## Environment Detection- [ ] `extension_installed` event appears in GA4 Realtime

- [ ] Text selection triggers `text_selected` event

The API automatically determines which GA4 property to use:- [ ] Button clicks are tracked

- [ ] Service worker logs show successful event sending

- **Development:** Requests from `localhost` or with `x-environment: development` header- [ ] No console errors related to GA4

- **Production:** All other requests

## Next Steps

## Debugging

1. **Custom Dimensions**: Add user properties for better segmentation

### Extension Console2. **Event Parameters**: Enhance events with more contextual data

```javascript3. **Conversion Events**: Mark important events as conversions in GA4

// Service worker console (chrome://extensions/ → Details → Service Worker)4. **Dashboard**: Create custom reports in GA4 for extension metrics

[GA4] Initialized (using server-side proxy)5. **Alerts**: Set up alerts for anomalies or key metrics

[GA4 Debug] Event: { name: 'text_selected', params: {...} }

[GA4 Debug] Response: { success: true, environment: 'development' }## Resources

```

- [GA4 Measurement Protocol Docs](https://developers.google.com/analytics/devguides/collection/protocol/ga4)

### Next.js Logs- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events)

```javascript- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)

[Analytics] Tracked event: {
  event: 'text_selected',
  user: 'user@example.com',
  environment: 'development',
  params: ['client_id', 'session_id', 'text_length']
}
```

### GA4 Realtime Report
- Go to GA4 → **Reports** → **Realtime**
- Should see events within 10-30 seconds
- Events include `user_email` and `environment` parameters

## Troubleshooting

### "No auth token available"
- User must be logged in to track events
- Extension needs valid JWT from authentication flow

### "Missing GA4 configuration"
- Check environment variables are set in `.env.local`
- Verify variable names match exactly
- Restart Next.js dev server after adding variables

### "Failed to track event" (API error)
- Check Next.js server logs for details
- Verify GA4 Measurement ID and API Secret are correct
- Test API Secret in GA4 Admin → Data Streams

### Events not appearing in GA4
- Check service worker console for errors
- Verify API endpoint is correct (dev vs prod)
- GA4 Realtime can have 10-30 second delay
- Check GA4 filters aren't excluding events

## Security Best Practices

✅ **DO:**
- Store API secrets in environment variables
- Use separate DEV/PROD GA4 properties
- Require authentication for analytics API
- Validate events on server before forwarding

❌ **DON'T:**
- Put API secrets in extension code
- Commit `.env.local` to git
- Use same GA4 property for dev and prod
- Skip authentication checks

## Next Steps

1. Set up environment variables on your Next.js server
2. Test in development environment
3. Deploy to production with production credentials
4. Monitor GA4 Realtime reports for events
5. Create custom GA4 reports for your metrics

## Additional Resources

- [GA4 Measurement Protocol API](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Chrome Extension Authentication](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
