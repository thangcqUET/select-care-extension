import React from 'react'
import ReactDOM from 'react-dom/client'
import Dashboard from './Dashboard'
import './index.css'
import { analytics } from '../lib/analytics'
import { isDebugMode, logEnvironmentInfo } from '../lib/environment'

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
