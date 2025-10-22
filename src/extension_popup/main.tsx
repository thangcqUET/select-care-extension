import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { analytics } from '../lib/analytics'
import { isDebugMode, logEnvironmentInfo } from '../lib/environment'

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
