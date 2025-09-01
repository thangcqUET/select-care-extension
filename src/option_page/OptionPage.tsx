import React, { useState } from 'react';

const OptionPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    // Save the API key to local storage or sync storage
    chrome.storage.sync.set({ llmApiKey: apiKey }, () => {
      alert('API Key saved successfully!');
    });
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <div className="mb-4">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">LLM API Key</label>
          <input
            type="text"
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save
        </button>
      </aside>
    </div>
  );
};

export default OptionPage;