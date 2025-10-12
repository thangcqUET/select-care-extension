import React from 'react';
import type { BasedSelection } from '../content_scripts/types';
import NoteCard from './NoteCard';

interface Props {
  selection: BasedSelection;
  expandedComments: boolean;
  onToggleComments: () => void;
  expandedCard: boolean;
  onToggleCard: () => void;
  deleteSelection: (id: string) => void;
  getUserStats: () => { totalSelections: number; todayCount: number };
}

const TextWithLineBreaks: React.FC<{ text: string }> = ({ text }) => (
  <div>
    {text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))}
  </div>
);

const NoteSelectionItem: React.FC<Props> = ({ selection, expandedComments, onToggleComments, expandedCard, onToggleCard, deleteSelection, getUserStats }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📝</span>
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
            Note
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{new Date(selection.metadata.timestamp).toLocaleString()}</span>
          <button
            onClick={() => deleteSelection(selection.selection_id)}
            className="text-red-400 hover:text-red-600 text-xs px-1 py-0.5 rounded"
            title="Delete selection"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="mb-2">
        <p className="text-sm text-gray-900 leading-relaxed"><TextWithLineBreaks text={selection.text} /></p>
      </div>

      <div className="mb-2">
        <div className="flex flex-wrap gap-1">
          {selection.tags.filter(t => !t.startsWith('fn_')).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      {selection.comments && selection.comments.length > 0 && (
        <div className="mb-2">
          <button onClick={onToggleComments} className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-1 cursor-pointer bg-transparent border-none p-0">
            {expandedComments ? 'Hide Comments' : 'Show Comments'}
          </button>
          {expandedComments && (
            <div className="mt-1">
              {selection.comments.map((c, i) => (
                <div key={i} className="text-xs text-gray-700 bg-gray-50 rounded px-2 py-1 mb-1">{c}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-2">
        <button onClick={onToggleCard} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer bg-transparent border-none p-0">
          {expandedCard ? 'Hide Card' : '✨ Generate Share Card'}
        </button>
        {expandedCard && (
          <NoteCard selection={selection as any} userStats={getUserStats()} />
        )}
      </div>

      <div className="text-xs text-gray-500">
        <a href={selection.context?.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate block" title={selection.context?.sourceUrl}>
          {selection.context?.sourceUrl ? String(selection.context.sourceUrl).replace(/^https?:\/\//, '').substring(0, 40) + '...' : 'No source'}
        </a>
      </div>
    </div>
  );
};

export default NoteSelectionItem;
