import React from 'react'
import { createRoot } from 'react-dom/client'
import OptionPage from './OptionPage'
import './index.css'

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <OptionPage />
    </React.StrictMode>
  )
}

export {};
