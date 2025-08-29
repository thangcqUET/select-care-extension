function App() {
  const openDashboard = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard.html')
    });
  };

  return (
    <div className="w-80 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">SelectCare</h1>
        <p className="text-sm text-gray-600">Smart text selection and management</p>
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
            Choose an action: Remember, Note, or Ask AI
          </li>
          <li className="flex items-start">
            <span className="font-medium text-blue-600 mr-2">3.</span>
            Fill in details and save
          </li>
        </ol>
      </div>

      {/* Action buttons */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="text-2xl mb-1">🌐</div>
            <div className="text-xs font-medium text-gray-700">Remember</div>
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <span>📊</span>
        <span>Open Dashboard</span>
      </button>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">v1.0.0 • SelectCare Extension</p>
      </div>
    </div>
  );
}
export default App;