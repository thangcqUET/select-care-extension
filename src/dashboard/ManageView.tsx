import React from 'react';
import { BasedSelection } from '../content_scripts/types';
import LearnSelectionItem from './LearnSelectionItem';
import NoteSelectionItem from './NoteSelectionItem';

type Props = {
  filteredSelections: BasedSelection[];
  selections: BasedSelection[];
  allTags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  selectedActionType: string;
  setSelectedActionType: (s: string) => void;
  clearFilters: () => void;
  refreshSelections: () => Promise<void>;
  deleteSelection: (id: string) => Promise<void>;
  expandedComments: Set<string>;
  toggleCommentsFor: (id: string) => void;
  expandedCards: Set<string>;
  toggleCardFor: (id: string) => void;
  getUserStats: () => { totalSelections: number; todayCount: number };
};

const ManageView: React.FC<Props> = ({
  filteredSelections,
  selections,
  allTags,
  selectedTags,
  toggleTag,
  searchQuery,
  setSearchQuery,
  selectedActionType,
  setSelectedActionType,
  clearFilters,
  refreshSelections,
  deleteSelection,
  expandedComments,
  toggleCommentsFor,
  expandedCards,
  toggleCardFor,
  getUserStats,
}) => {
  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshSelections}
              className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
              title="Refresh data"
            >
              🔄
            </button>
            <div className="text-sm text-gray-500">{filteredSelections.length} items</div>
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
        </div>

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
              <div className="text-lg font-bold text-purple-600">{selections.filter(s => s.type === 'note').length}</div>
              <div className="text-gray-600">Notes</div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

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
                  onToggleComments={() => toggleCommentsFor(selection.selection_id)}
                  deleteSelection={deleteSelection}
                  getUserStats={getUserStats}
                />
              ) : (
                <NoteSelectionItem
                  selection={selection}
                  expandedComments={expandedComments.has(selection.selection_id)}
                  onToggleComments={() => toggleCommentsFor(selection.selection_id)}
                  expandedCard={expandedCards.has(selection.selection_id)}
                  onToggleCard={() => toggleCardFor(selection.selection_id)}
                  deleteSelection={deleteSelection}
                  getUserStats={getUserStats}
                />
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ManageView;
