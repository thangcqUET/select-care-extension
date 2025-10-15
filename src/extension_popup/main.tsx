import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { injectGTMScript, analytics } from '../lib/analytics'
import { getGTMId, isDebugMode, logEnvironmentInfo } from '../lib/environment'

// Initialize Google Tag Manager only when running in a non-extension page
const GTM_ID = getGTMId();
try {
  if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'chrome-extension:') {
    injectGTMScript(GTM_ID);
  } else {
    // Running inside extension UI; skip injecting remote GTM script to avoid CSP errors
    console.debug('[Analytics] Skipping GTM injection inside extension UI');
  }
} catch (e) {
  console.warn('[Analytics] Could not determine environment for GTM injection', e);
}

// Enable debug mode in development
analytics.setDebugMode(isDebugMode());

// Log environment info in console
logEnvironmentInfo();

// Track page view
analytics.trackPageView('Extension Popup', '/popup');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
