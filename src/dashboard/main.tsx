import React from 'react'
import ReactDOM from 'react-dom/client'
import Dashboard from './Dashboard'
import './index.css'
import { injectGTMScript, analytics } from '../lib/analytics'
import { getGTMId, isDebugMode, logEnvironmentInfo } from '../lib/environment'

// Initialize Google Tag Manager only when running in a non-extension page
const GTM_ID = getGTMId();
try {
  if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'chrome-extension:') {
    injectGTMScript(GTM_ID);
  } else {
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
analytics.trackPageView('Dashboard', '/dashboard');

ReactDOM.createRoot(document.getElementById('dashboard-root')!).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>,
)
