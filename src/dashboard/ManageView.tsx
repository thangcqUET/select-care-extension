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
  editSelection: (selection: any) => Promise<boolean>;
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
  editSelection,
  expandedComments,
  toggleCommentsFor,
  expandedCards,
  toggleCardFor,
  getUserStats,
}) => {
  // Compute tag frequencies across all selections (exclude internal fn_ tags)
  const sortedTags = React.useMemo(() => {
    const counts: Record<string, number> = {};
    (selections || []).forEach(s => {
      (s.tags || []).forEach((t: string) => {
        if (!t || t.startsWith('fn_')) return;
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    // Start from allTags to preserve tags that may not appear in selections
    const unique = Array.from(new Set(allTags || []));
    unique.sort((a, b) => {
      const diff = (counts[b] || 0) - (counts[a] || 0);
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });
    return unique;
  }, [allTags, selections]);

  // Determine whether to show the stats panel: at 10, 20, and every 50 thereafter
  // Additionally, if the totalSelections has increased by 50 or more since the
  // last time we showed a congratulation, show it again. We persist the last
  // congratulated count in localStorage to track this across sessions.
  const totalSelections = getUserStats().totalSelections;

  const LAST_CONGRATS_KEY = 'select_care_last_congrats_total';

  // read last congrats from localStorage (safe in SSR/no-window scenarios)
  const readLastCongrats = React.useCallback((): number => {
    try {
      if (typeof window === 'undefined') return 0;
      const v = window.localStorage.getItem(LAST_CONGRATS_KEY);
      return v ? Number(v) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }, []);

  const [lastCongrats, setLastCongrats] = React.useState<number>(() => readLastCongrats());

  // showStats true for 10, 20, or if we've increased by >=50 since lastCongrats
  const showStats = React.useMemo(() => {
    if (totalSelections === 10 || totalSelections === 20) return true;
    if (totalSelections >= 50 && totalSelections % 50 === 0) return true;
    if (totalSelections - lastCongrats >= 50) return true;
    return false;
  }, [totalSelections, lastCongrats]);

  // Local UI state: whether stats panel is expanded (user toggle or auto on milestone)
  const [statsExpanded, setStatsExpanded] = React.useState<boolean>(false);
  // Brief congratulation state when milestone is reached

  // When a milestone is reached (showStats becomes true), auto-expand and show congrats
  React.useEffect(() => {
    if (showStats) {
      setStatsExpanded(true);
      // persist the fact that we've congratulated at this total so we only
      // congratulate again after another +50 selections
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(LAST_CONGRATS_KEY, String(totalSelections));
        }
      } catch (e) {
        // ignore
      }

      setLastCongrats(totalSelections);
    }
    // do not auto-collapse when milestone passes away
    return;
  }, [showStats]);

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
            <button
              onClick={() => setStatsExpanded(prev => !prev)}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded"
              title="Toggle stats"
            >
              {statsExpanded ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>
        </div>

  {statsExpanded && (
  <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border">
          <h2 className="text-sm font-bold text-gray-900 mb-2">📊 Your Stats</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{getUserStats().todayCount}</div>
              <div className="text-gray-600">Today</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{getUserStats().totalSelections}</div>
              <div className="text-gray-600">Total</div>
            </div>
          </div>
  </div>
  )}

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
            {/* <option value="chat">🤖 AI</option> */}
            {/* TODO: Implement chat selection */}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Tags</label>
          <div className="max-h-24 overflow-y-auto pr-2 flex flex-wrap gap-1">
            {sortedTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-1 text-xs rounded-full border transition-colors hover:cursor-pointer ${
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
                  editSelection={editSelection}
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
                  editSelection={editSelection}
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
