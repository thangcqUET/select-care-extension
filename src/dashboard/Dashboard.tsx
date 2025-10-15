import React, { useState, useEffect } from 'react';
import { BasedSelection } from '../content_scripts/types';
import ManageView from './ManageView';
import ExportView from './ExportView';
import LearnView from './LearnView';
import StatsView from './StatsView';
import { analytics, EventAction } from '../lib/analytics';

type View = 'manage' | 'export' | 'learn' | 'stats';

const Dashboard: React.FC = () => {
  const [selections, setSelections] = useState<BasedSelection[]>([]);
  const [filteredSelections, setFilteredSelections] = useState<BasedSelection[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>('manage');

  // Track sidebar opened on mount
  useEffect(() => {
    analytics.trackSidebarAction(EventAction.SIDEBAR_OPENED);
  }, []);

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
    
    // Track search when query changes
    if (searchQuery) {
      analytics.trackSidebarAction(EventAction.SEARCH_PERFORMED, {
        query: searchQuery,
        resultCount: filtered.length
      });
    }
    
    // Track filter when action type changes
    if (selectedActionType !== 'all') {
      analytics.trackSidebarAction(EventAction.FILTER_APPLIED, {
        filterType: 'actionType',
        actionType: selectedActionType,
        resultCount: filtered.length
      });
    }
  }, [selections, searchQuery, selectedTags, selectedActionType]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      
      // Track filter applied
      analytics.trackSidebarAction(EventAction.FILTER_APPLIED, {
        filterType: 'tag',
        tag,
        action: prev.includes(tag) ? 'remove' : 'add',
        totalTags: newTags.length
      });
      
      return newTags;
    });
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
        // Track delete action
        const selection = selections.find(s => s.selection_id === id);
        analytics.trackSidebarAction(EventAction.DELETE_ITEM, {
          itemType: selection?.type,
          itemId: id
        });
        
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

  const editSelection = async (updatedSelection: BasedSelection) => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'updateSelection', data: { selection: updatedSelection } });
      if (response && response.success) {
        // Track edit action
        const isLearnType = updatedSelection.type === 'learn' || updatedSelection.tags.includes('fn_learn');
        analytics.trackSidebarAction(
          isLearnType ? EventAction.EDIT_LEARN_ITEM : EventAction.EDIT_NOTE_ITEM,
          {
            itemType: updatedSelection.type,
            itemId: updatedSelection.selection_id,
            hasComment: !!updatedSelection.comments,
            tagCount: updatedSelection.tags.filter(t => !t.startsWith('fn_')).length
          }
        );
        
        // update local state
        const updated = selections.map(s => s.selection_id === updatedSelection.selection_id ? updatedSelection : s);
        setSelections(updated);
        console.log('Selection updated locally');
        return true;
      } else {
        console.error('Failed to update selection:', response?.error);
      }
    } catch (err) {
      console.error('Error updating selection:', err);
    }
    return false;
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

  // Views: manage (default), export, learn, stats
  const exportSelections = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getAllSelections' });
      if (response.success) return response.data;
    } catch (e) {
      console.error('Error exporting selections', e);
    }
    return [];
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - Compact for sidebar */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={chrome.runtime.getURL('logo_select_care.svg')}
                alt="SelectCare"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">SelectCare</h1>
                <p className="text-xs text-gray-600">Manage your selections</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Desktop / wide: inline tabs with horizontal scroll to avoid wrapping */}
              <div className="hidden sm:flex items-center space-x-1 bg-white/0 rounded overflow-x-auto">
                <button
                  onClick={() => setView('manage')}
                  className={`whitespace-nowrap flex-shrink-0 px-3 py-1 text-sm rounded ${view === 'manage' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Manage
                </button>
                <button
                  onClick={() => setView('export')}
                  className={`whitespace-nowrap flex-shrink-0 px-3 py-1 text-sm rounded ${view === 'export' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Export
                </button>
                <button
                  onClick={() => setView('learn')}
                  className={`whitespace-nowrap flex-shrink-0 px-3 py-1 text-sm rounded ${view === 'learn' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Learn
                </button>
                <button
                  onClick={() => setView('stats')}
                  className={`whitespace-nowrap flex-shrink-0 px-3 py-1 text-sm rounded ${view === 'stats' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Stats
                </button>
              </div>

              {/* Mobile / narrow: compact select to save space and avoid overflow */}
              <div className="sm:hidden">
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value as View)}
                  className="px-2 py-1 text-sm border border-gray-200 rounded bg-white"
                  aria-label="Select view"
                >
                  <option value="manage">Manage</option>
                  <option value="export">Export</option>
                  {/* <option value="learn">Learn</option>
                  <option value="stats">Stats</option> */}
                  {/* TODO: Learn, Stats */}
                </select>
              </div>

              {/* refresh and count are shown inside Manage view only (moved below) */}
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-4 space-y-4">

        {view === 'manage' && (
          <ManageView
            filteredSelections={filteredSelections}
            selections={selections}
            allTags={allTags}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedActionType={selectedActionType}
            setSelectedActionType={setSelectedActionType}
            clearFilters={clearFilters}
            refreshSelections={refreshSelections}
            deleteSelection={deleteSelection}
            editSelection={editSelection}
            expandedComments={expandedComments}
            toggleCommentsFor={(id: string) => {
              const newExpanded = new Set(expandedComments);
              if (newExpanded.has(id)) newExpanded.delete(id);
              else newExpanded.add(id);
              setExpandedComments(newExpanded);
            }}
            expandedCards={expandedCards}
            toggleCardFor={(id: string) => {
              const newExpanded = new Set(expandedCards);
              if (newExpanded.has(id)) newExpanded.delete(id);
              else newExpanded.add(id);
              setExpandedCards(newExpanded);
            }}
            getUserStats={getUserStats}
          />
        )}

        {view === 'export' && (
          <ExportView exportSelections={exportSelections} copyToClipboard={copyToClipboard} />
        )}

        {view === 'learn' && (
          <LearnView
            selections={selections}
            expandedComments={expandedComments}
            toggleCommentsFor={(id: string) => {
              const newExpanded = new Set(expandedComments);
              if (newExpanded.has(id)) newExpanded.delete(id);
              else newExpanded.add(id);
              setExpandedComments(newExpanded);
            }}
            deleteSelection={deleteSelection}
            editSelection={editSelection}
            getUserStats={getUserStats}
          />
        )}

        {view === 'stats' && (
          <StatsView
            selectionsCount={getUserStats().totalSelections}
            todayCount={getUserStats().todayCount}
            notesCount={selections.filter(s => s.type === 'note').length}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
