import React, { useState, useEffect } from 'react';
import { BasedSelection } from '../content_scripts/types';
import LearnSelectionItem from './LearnSelectionItem';
import NoteSelectionItem from './NoteSelectionItem';

const Dashboard: React.FC = () => {
  const [selections, setSelections] = useState<BasedSelection[]>([]);
  const [filteredSelections, setFilteredSelections] = useState<BasedSelection[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Load selections from IndexedDB instead of mock data
  useEffect(() => {
    const loadSelections = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getAllSelections' });
        if (response.success) {
          setSelections(response.data);
          setFilteredSelections(response.data);
        } else {
          console.error('Failed to load selections:', response.error);
          // Fallback to empty array if error
          setSelections([]);
          setFilteredSelections([]);
        }
      } catch (error) {
        console.error('Error loading selections:', error);
        // Fallback to empty array if error
        setSelections([]);
        setFilteredSelections([]);
      }
    };

    loadSelections();

    // Listen for data update messages
    const handleMessage = (message: any) => {
      if (message.action === 'dataUpdated') {
        console.log('Data updated, refreshing dashboard...');
        loadSelections();
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
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
        selection.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        selection.context.sourceUrl.toLowerCase().includes(searchQuery.toLowerCase());

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

  const deleteSelection = async (id: string) => {
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'deleteSelection', 
        data: { id } 
      });
      
      if (response.success) {
        // Remove from local state
        const updatedSelections = selections.filter(s => s.selection_id !== id);
        setSelections(updatedSelections);
        console.log('Selection deleted successfully');
      } else {
        console.error('Failed to delete selection:', response.error);
      }
    } catch (error) {
      console.error('Error deleting selection:', error);
    }
  };

  const refreshSelections = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getAllSelections' });
      if (response.success) {
        setSelections(response.data);
      }
    } catch (error) {
      console.error('Error refreshing selections:', error);
    }
  };


  const getUserStats = () => {
    const today = new Date().toDateString();
    const todaySelections = selections.filter(s => 
      new Date(s.metadata.timestamp).toDateString() === today
    );
    
    return {
      totalSelections: selections.length,
      todayCount: todaySelections.length
    };
  };

  // Note: per-selection UI moved to LearnSelectionItem and NoteSelectionItem
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - Compact for sidebar */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">SelectCare</h1>
              <p className="text-xs text-gray-600">Manage your selections</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshSelections}
                className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                title="Refresh data"
              >
                🔄
              </button>
              <div className="text-sm text-gray-500">
                {filteredSelections.length} items
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        
        {/* Filters - Compact layout for sidebar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>

          {/* Stats Dashboard */}
          <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border">
            <h2 className="text-sm font-bold text-gray-900 mb-2">📊 Your Learning Stats</h2>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">{getUserStats().totalSelections}</div>
                <div className="text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{getUserStats().todayCount}</div>
                <div className="text-gray-600">Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {selections.filter(s => s.type === 'note').length}
                </div>
                <div className="text-gray-600">Notes</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Type Filter - Compact */}
          <div className="mb-3">
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="learn">🌐 Learn</option>
              <option value="note">📝 Notes</option>
              <option value="chat">🤖 AI</option>
            </select>
          </div>

          {/* Tags Filter - Wrap for narrow sidebar */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selection Items - Single column for sidebar */}
        <div className="space-y-3">
          {filteredSelections.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500 text-sm">No selections found</p>
              <p className="text-gray-400 text-xs mt-1">
                {selections.length === 0 ? 'Start selecting text on web pages!' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            filteredSelections.map(selection => (
              <div key={selection.selection_id}>
                {selection.type === 'learn' ? (
                  <LearnSelectionItem
                    selection={selection as any}
                    expandedComments={expandedComments.has(selection.selection_id)}
                    onToggleComments={() => {
                      const newExpanded = new Set(expandedComments);
                      if (newExpanded.has(selection.selection_id)) newExpanded.delete(selection.selection_id);
                      else newExpanded.add(selection.selection_id);
                      setExpandedComments(newExpanded);
                    }}
                    deleteSelection={deleteSelection}
                    getUserStats={getUserStats}
                  />
                ) : (
                  <NoteSelectionItem
                    selection={selection}
                    expandedComments={expandedComments.has(selection.selection_id)}
                    onToggleComments={() => {
                      const newExpanded = new Set(expandedComments);
                      if (newExpanded.has(selection.selection_id)) newExpanded.delete(selection.selection_id);
                      else newExpanded.add(selection.selection_id);
                      setExpandedComments(newExpanded);
                    }}
                    expandedCard={expandedCards.has(selection.selection_id)}
                    onToggleCard={() => {
                      const newExpanded = new Set(expandedCards);
                      if (newExpanded.has(selection.selection_id)) newExpanded.delete(selection.selection_id);
                      else newExpanded.add(selection.selection_id);
                      setExpandedCards(newExpanded);
                    }}
                    deleteSelection={deleteSelection}
                    getUserStats={getUserStats}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
