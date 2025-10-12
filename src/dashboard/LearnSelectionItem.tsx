import React, { useState } from 'react';
import type { LearnSpecificData } from '../content_scripts/types';

interface Props {
  selection: LearnSpecificData;
  expandedComments: boolean;
  onToggleComments: () => void;
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

const LearnSelectionItem: React.FC<Props> = ({ selection, expandedComments, onToggleComments, deleteSelection }) => {
  const [expandedPieces, setExpandedPieces] = useState<Record<number, boolean>>({});

  const pieces = Array.isArray(selection.pieces) ? selection.pieces : [];

  const togglePiece = (index: number) => {
    setExpandedPieces(prev => ({ ...prev, [index]: !prev[index] }));
  };
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🌐</span>
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
            Learn
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

      {selection.source_language && (
        <div className="mb-2">
          <span className="text-xs text-gray-600">Source: {selection.source_language}</span>
        </div>
      )}

      {pieces.length > 0 && (
        <div className="mb-2 space-y-2">
          {pieces.map((p, idx) => (
            <div key={idx} className="p-2 bg-gray-50 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-600">Target: <span className="font-medium text-gray-800">{p.target_language}</span></div>
                  <div className="text-sm text-gray-700 mt-1">{p.translation || p.definition || '—'}</div>
                </div>
                <div>
                  <button onClick={() => togglePiece(idx)} className="text-xs text-indigo-600 hover:text-indigo-800">{expandedPieces[idx] ? 'Hide' : 'Details'}</button>
                </div>
              </div>

              {expandedPieces[idx] && (
                <div className="mt-2 text-xs text-gray-600 space-y-2">
                  {p.part_of_speech && <div>• Part of speech: <span className="text-gray-800 font-medium">{p.part_of_speech}</span></div>}
                  {p.phonetics_text && <div>• Phonetics: <span className="text-gray-800 font-medium">{p.phonetics_text}</span></div>}
                  {p.example && <div>• Example: <span className="text-gray-800">{p.example}</span></div>}
                  {p.image_url && (
                    <div className="mt-2">
                      <img src={p.image_url} alt="illustration" className="w-32 h-20 object-cover rounded" />
                    </div>
                  )}
                  {p.phonetics_audio && (
                    <div className="mt-2">
                      <audio controls src={p.phonetics_audio} className="w-full" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      <div className="mb-2">
        <div className="flex flex-wrap gap-1">
          {selection.tags.filter(t => !t.startsWith('fn_')).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      {/* Comments */}
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

      {/* Share actions removed — source link shown below */}

      <div className="text-xs text-gray-500">
        <a href={selection.context?.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate block" title={selection.context?.sourceUrl}>
          {selection.context?.sourceUrl ? String(selection.context.sourceUrl).replace(/^https?:\/\//, '').substring(0, 40) + '...' : 'No source'}
        </a>
      </div>
    </div>
  );
};

export default LearnSelectionItem;
