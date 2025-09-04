import { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we have a stored token
      const result = await chrome.storage.local.get(['selectcare_token', 'selectcare_user_email']);
      if (result.selectcare_token) {
        setIsAuthenticated(true);
        setUserEmail(result.selectcare_user_email || '');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSignIn = async () => {
    // Generate a unique state parameter for security
    const state = crypto.randomUUID();
    await chrome.storage.local.set({ auth_state: state });

    // Redirect to web app with extension callback
    const authUrl = `http://localhost:3001/?extension_auth=true&state=${state}`;
    
    // Open web app in new tab
    chrome.tabs.create({ url: authUrl });
    
    // Close the popup
    window.close();
  };

  const handleSignOut = async () => {
    try {
      // Clear stored credentials
      await chrome.storage.local.remove(['selectcare_token', 'selectcare_user_email', 'auth_state']);
      setIsAuthenticated(false);
      setUserEmail('');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openDashboard = async () => {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab?.id) {
        // Open the side panel for the current tab
        await chrome.sidePanel.open({ tabId: tab.id });
        
        // Close the popup after opening sidebar
        window.close();
      }
    } catch (error) {
      console.error('Failed to open side panel:', error);
      // Fallback to opening in new tab if sidebar fails
      chrome.tabs.create({
        url: chrome.runtime.getURL('dashboard.html')
      });
      
      // Close the popup even for fallback
      window.close();
    }
  };

  const openOptions = async () => {
    try {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        chrome.tabs.create({ url: chrome.runtime.getURL('option_page/option.html') });
      }
      window.close();
    } catch (error) {
      console.error('Failed to open options page:', error);
      chrome.tabs.create({ url: chrome.runtime.getURL('option_page/option.html') });
      window.close();
    }
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="w-80 p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-sm text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="w-80 p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg"></div>
            <h1 className="text-xl font-bold text-gray-900">SelectCare</h1>
          </div>
          <p className="text-sm text-gray-600">Sign in to start selecting content</p>
        </div>

        {/* Sign-in Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome to SelectCare!</h2>
          <p className="text-sm text-gray-600 mb-6">
            Sign in with your SelectCare account to start selecting and organizing content across the web.
          </p>
          
          <button
            onClick={handleSignIn}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Sign In with SelectCare ✨
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          You'll be redirected to our secure sign-in page
        </p>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">v1.0.0 • SelectCare Extension</p>
        </div>
      </div>
    );
  }

  // Authenticated state - Main app interface
  return (
    <div className="w-80 p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg"></div>
          <h1 className="text-xl font-bold text-gray-900">SelectCare</h1>
        </div>
        <p className="text-sm text-gray-600">Smart text selection and management</p>
        <p className="text-xs text-purple-600 font-medium">{userEmail}</p>
      </div>

      {/* Instructions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">How to use:</h2>
        <ol className="text-sm text-gray-700 space-y-1">
          <li className="flex items-start">
            <span className="font-medium text-blue-600 mr-2">1.</span>
            Select any text on a webpage
          </li>
          <li className="flex items-start">
            <span className="font-medium text-blue-600 mr-2">2.</span>
            Choose an action: Learn, Note, or Ask AI
          </li>
          <li className="flex items-start">
            <span className="font-medium text-blue-600 mr-2">3.</span>
            Fill in details and save
          </li>
          <li className="flex items-start">
            <span className="font-medium text-blue-600 mr-2">4.</span>
            Open sidebar to manage your selections
          </li>
        </ol>
      </div>

      {/* Action buttons */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="text-2xl mb-1">🌐</div>
            <div className="text-xs font-medium text-gray-700">Learn</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-xs font-medium text-gray-700">Note</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="text-2xl mb-1">🤖</div>
            <div className="text-xs font-medium text-gray-700">Ask AI</div>
          </div>
        </div>
      </div>

      {/* Dashboard link */}
      <button
        onClick={openDashboard}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-3"
      >
        <span>📊</span>
        <span>Open Sidebar</span>
      </button>

      {/* Settings link */}
      <button
        onClick={openOptions}
        className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mb-3"
      >
        <span>⚙️</span>
        <span>Settings</span>
      </button>

      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        className="w-full text-red-600 hover:text-red-700 font-medium py-2 px-4 transition-colors duration-200 text-sm"
      >
        Sign Out
      </button>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-400">v1.0.0 • SelectCare Extension</p>
      </div>
    </div>
  );
}

export default App;