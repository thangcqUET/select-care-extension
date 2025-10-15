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

  // const handleSignIn = async () => {
  //   // Generate a unique state parameter for security
  //   const state = crypto.randomUUID();
  //   await chrome.storage.local.set({ auth_state: state });

  //   // Redirect to web app with extension callback
  //   const authUrl = `http://localhost:3001/?extension_auth=true&state=${state}`;
    
  //   // Open web app in new tab
  //   chrome.tabs.create({ url: authUrl });
    
  //   // Close the popup
  //   window.close();
  // };
  const handleGoToWebsite = async () => {
    // const websiteUrl = `http://localhost:3001/`;
    const websiteUrl = `https://main.djfc0uq2bj5xw.amplifyapp.com/`;
    // Open web app in new tab
    chrome.tabs.create({ url: websiteUrl });
    
    // Close the popup
    window.close();
  }

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

  //TODO enable settings later
  // const openOptions = async () => {
  //   try {
  //     if (chrome.runtime.openOptionsPage) {
  //       chrome.runtime.openOptionsPage();
  //     } else {
  //       chrome.tabs.create({ url: chrome.runtime.getURL('option_page/option.html') });
  //     }
  //     window.close();
  //   } catch (error) {
  //     console.error('Failed to open options page:', error);
  //     chrome.tabs.create({ url: chrome.runtime.getURL('option_page/option.html') });
  //     window.close();
  //   }
  // };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="w-80 p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <img
            src={chrome.runtime.getURL('logo_select_care.svg')}
            alt="SelectCare"
            className="w-8 h-8 object-contain rounded-lg mx-auto mb-4 animate-pulse"
          />
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <img
                src={chrome.runtime.getURL('logo_select_care.svg')}
                alt="SelectCare"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900">SelectCare</h1>
            </div>
            <p className="text-sm text-gray-600">Select your interest, shape your insight</p>
          </div>
          <div>
            <button
              // onClick={handleSignIn} // TODO: enable sign-in later
              onClick={handleGoToWebsite}
              className="cursor-pointer text-sm bg-white/80 hover:bg-white text-gray-800 px-3 py-1 rounded-full shadow-sm"
            >
              Home
            </button>
          </div>
        </div>
        {/* Show main features even when unauthenticated */}
        {/* Dashboard link */}
        <button
          onClick={openDashboard}
          className="cursor-pointer w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-3"
        >
          <span>📊</span>
          <span>Open Sidebar</span>
        </button>

        {/* Settings link */}
        {/* <button
          onClick={openOptions}
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mb-3"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button> */}

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
              {/* TODO: Choose an action: Learn, Note, or Ask AI */}
              Choose an action: Learn, Note
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <img
              src={chrome.runtime.getURL('logo_select_care.svg')}
              alt="SelectCare"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-xl font-bold text-gray-900">SelectCare</h1>
          </div>
          <p className="text-sm text-gray-600">Select your interest, shape your insight</p>
          <p className="text-xs text-purple-600 font-medium">{userEmail}</p>
        </div>
        <div>
          <button
            onClick={handleSignOut}
            className="cursor-pointer text-sm bg-white/80 hover:bg-white text-gray-800 px-3 py-1 rounded-full shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Dashboard link */}
      <button
        onClick={openDashboard}
        className="cursor-pointer w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-3"
      >
        <span>📊</span>
        <span>Open Sidebar</span>
      </button>

      {/* Settings link */}
      {/* <button
        onClick={openOptions}
        className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mb-3"
      >
        <span>⚙️</span>
        <span>Settings</span>
      </button> */}

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
            {/* TODO: Choose an action: Learn, Note, or Ask AI */}
            Choose an action: Learn, Note
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


      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        className="cursor-pointer w-full text-red-600 hover:text-red-700 font-medium py-2 px-4 transition-colors duration-200 text-sm"
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