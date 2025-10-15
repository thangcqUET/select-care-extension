/**
 * Environment Configuration
 * 
 * This file manages environment-specific settings including GTM container IDs.
 * Different GTM containers allow you to test analytics in development without
 * affecting production data.
 */

export type Environment = 'development' | 'production';

/**
 * Detect current environment
 * Chrome extensions don't have NODE_ENV, so we use the extension ID or manifest
 */
export function getEnvironment(): Environment {
  // Method 1: Check if we're in development mode via chrome.runtime
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    const manifest = chrome.runtime.getManifest();
    
    // Development builds often have 'dev' or 'development' in the name/version
    if (manifest.name?.toLowerCase().includes('dev') || 
        manifest.version?.includes('dev')) {
      return 'development';
    }
    
    // Check extension ID - development extensions have unpacked IDs
    const id = chrome.runtime.id;
    // Unpacked extensions have longer, more random IDs
    if (id && id.length > 32) {
      return 'development';
    }
  }
  
  // Method 2: Check if running from localhost (for testing)
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    return 'development';
  }
  
  // Default to production for safety
  return 'production';
}

/**
 * Environment-specific configuration
 */
interface EnvironmentConfig {
  gtmId: string;
  debug: boolean;
  apiEndpoint?: string;
}

const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    gtmId: 'GTM-5F44MV82', // Replace with your DEV GTM container ID
    debug: true,
    apiEndpoint: 'http://localhost:3001',
  },
  production: {
    gtmId: 'GTM-5F44MV82', // Replace with your PROD GTM container ID
    debug: false,
    apiEndpoint: 'https://main.djfc0uq2bj5xw.amplifyapp.com',
  },
};

/**
 * Get configuration for current environment
 */
export function getConfig(): EnvironmentConfig {
  const env = getEnvironment();
  return configs[env];
}

/**
 * Get GTM Container ID for current environment
 */
export function getGTMId(): string {
  return getConfig().gtmId;
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return getConfig().debug;
}

/**
 * Log environment info (useful for debugging)
 */
export function logEnvironmentInfo(): void {
  const env = getEnvironment();
  const config = getConfig();
  
  console.log(`[Environment] Running in ${env} mode`);
  console.log(`[Environment] GTM ID: ${config.gtmId}`);
  console.log(`[Environment] Debug: ${config.debug}`);
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log(`[Environment] Extension ID: ${chrome.runtime.id}`);
    console.log(`[Environment] Version: ${chrome.runtime.getManifest().version}`);
  }
}
