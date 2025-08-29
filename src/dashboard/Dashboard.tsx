import React, { useState, useEffect } from 'react';

interface Selection {
  id: string;
  selectedText: string;
  actionType: 'remember' | 'note' | 'ai';
  tags: string[];
  timestamp: string;
  sourceUrl: string;
  targetLanguage?: string;
  question?: string;
}

const Dashboard: React.FC = () => {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [filteredSelections, setFilteredSelections] = useState<Selection[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockData: Selection[] = [
      {
        id: '1',
        selectedText: 'Machine learning is a subset of artificial intelligence',
        actionType: 'note',
        tags: ['fn_note', 'machine learning', 'AI', 'technology'],
        timestamp: new Date().toISOString(),
        sourceUrl: 'https://example.com/ai-article'
      },
      {
        id: '2',
        selectedText: 'Bonjour',
        actionType: 'remember',
        tags: ['fn_remember'],
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        sourceUrl: 'https://example.com/french-lesson',
        targetLanguage: 'English'
      },
      {
        id: '3',
        selectedText: 'React hooks provide a way to use state in functional components',
        actionType: 'ai',
        tags: ['fn_chat'],
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        sourceUrl: 'https://react.dev/docs',
        question: 'Explain React hooks in simple terms'
      },
      {
        id: '4',
        selectedText: 'Responsive web design principles',
        actionType: 'note',
        tags: ['fn_note', 'web design', 'CSS', 'responsive'],
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        sourceUrl: 'https://developer.mozilla.org'
      }
    ];
    setSelections(mockData);
    setFilteredSelections(mockData);
  }, []);

  // Get all unique tags (excluding function tags)
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    selections.forEach(selection => {
      selection.tags.forEach(tag => {
        if (!tag.startsWith('fn_')) {
          tagSet.add(tag);
        }
      });
    });
    return Array.from(tagSet).sort();
  }, [selections]);

  // Filter selections based on search, tags, and action type
  useEffect(() => {
    let filtered = selections.filter(selection => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        selection.selectedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        selection.sourceUrl.toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => selection.tags.includes(tag));

      // Action type filter
      const matchesActionType = selectedActionType === 'all' || 
        selection.tags.includes(`fn_${selectedActionType}`);

      return matchesSearch && matchesTags && matchesActionType;
    });

    setFilteredSelections(filtered);
  }, [selections, searchQuery, selectedTags, selectedActionType]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedActionType('all');
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'remember': return '🌐';
      case 'note': return '📝';
      case 'ai': return '🤖';
      default: return '📄';
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'remember': return 'bg-blue-100 text-blue-800';
      case 'note': return 'bg-green-100 text-green-800';
      case 'ai': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              SelectCare Dashboard
            </h1>
            <div className="text-sm text-gray-500">
              {filteredSelections.length} of {selections.length} selections
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search selections..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <select
                  value={selectedActionType}
                  onChange={(e) => setSelectedActionType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="remember">🌐 Remember</option>
                  <option value="note">📝 Notes</option>
                  <option value="chat">🤖 AI Chat</option>
                </select>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allTags.map(tag => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Selections List */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredSelections.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-200">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No selections found</h3>
                  <p className="text-gray-500">Try adjusting your filters or start selecting text on websites.</p>
                </div>
              ) : (
                filteredSelections.map(selection => (
                  <div
                    key={selection.id}
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getActionIcon(selection.actionType)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selection.actionType)}`}>
                          {selection.actionType.charAt(0).toUpperCase() + selection.actionType.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(selection.timestamp)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-900 text-lg leading-relaxed">
                        "{selection.selectedText}"
                      </p>
                    </div>

                    {/* Additional Info */}
                    {selection.targetLanguage && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Target Language: </span>
                        <span className="text-sm font-medium text-gray-900">{selection.targetLanguage}</span>
                      </div>
                    )}

                    {selection.question && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Question: </span>
                        <span className="text-sm font-medium text-gray-900">{selection.question}</span>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {selection.tags
                          .filter(tag => !tag.startsWith('fn_'))
                          .map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Source URL */}
                    <div className="text-sm text-gray-500 truncate">
                      <span>Source: </span>
                      <a
                        href={selection.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selection.sourceUrl}
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
