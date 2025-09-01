/**
 * Main content script entry point
 * Refactored for better maintainability and separation of concerns
 * 
 * This file serves as the entry point and coordinates all content script functionality:
 * - Text selection detection and management
 * - Popup display and interaction
 * - Form handling and data collection
 * - Communication with background script
 * 
 * Key improvements:
 * - Modular architecture with single responsibility classes
 * - Centralized configuration in constants
 * - Reusable UI components and styles
 * - Better error handling and logging
 * - TypeScript types for better code safety
 * - Clear separation between UI, business logic, and data handling
 */

// Import the event manager which handles all the functionality
import './event-manager';

// The event manager automatically initializes and sets up all event listeners
// This approach keeps the main entry point clean and delegates all functionality
// to specialized modules.

console.log('SelectCare content script loaded and initialized');

// Optional: Expose some functionality to the global scope for debugging
// @ts-ignore - process.env is provided by build tools
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  (window as any).__selectCare = {
    version: '2.0.0',
    modules: {
      // Add references to key modules for debugging if needed
    }
  };
}
