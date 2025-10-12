import React, { useState } from 'react';
import type { LearnSpecificData } from '../content_scripts/types';

interface LanguageCardProps {
  selection: LearnSpecificData;
  onClose?: () => void;
}

const getActionEmoji = (type: string) => {
  switch (type) {
    case 'learn': return '🌐';
    case 'note': return '💡';
    case 'chat': return '🤖';
    default: return '📚';
  }
};

const LanguageCard: React.FC<LanguageCardProps> = ({ selection }) => {
  const [expanded, setExpanded] = useState(false);

  const piece = Array.isArray(selection.pieces) && selection.pieces.length > 0 ? selection.pieces[0] : null;

  return (
    <div className="mt-2">
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl">{getActionEmoji(selection.type)}</div>
            <div>
              <div className="text-sm font-semibold text-gray-800">Language Discovery</div>
              <div className="text-xs text-gray-500">{selection.source_language || 'Unknown source language'}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">{new Date(selection.metadata.timestamp).toLocaleString()}</div>
        </div>

        <div className="mt-3">
          <p className="text-sm text-gray-700 leading-relaxed">{selection.text}</p>
        </div>

        {piece && (
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">Target: <span className="font-medium text-gray-800">{piece.target_language}</span></div>
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-transparent border-none p-0"
              >
                {expanded ? 'Hide details' : 'Show details'}
              </button>
            </div>

            <div className="mt-2 text-sm text-gray-700">
              <div className="text-xs text-gray-500">Translation</div>
              <div className="font-medium">{piece.translation || piece.definition || '—'}</div>
            </div>

            {expanded && (
              <div className="mt-3 text-xs text-gray-600 space-y-2">
                {piece.part_of_speech && <div>• Part of speech: <span className="text-gray-800 font-medium">{piece.part_of_speech}</span></div>}
                {piece.phonetics_text && <div>• Phonetics: <span className="text-gray-800 font-medium">{piece.phonetics_text}</span></div>}
                {piece.example && <div>• Example: <span className="text-gray-800">{piece.example}</span></div>}
                {piece.image_url && (
                  <div className="mt-2">
                    <img src={piece.image_url} alt="illustration" className="w-32 h-20 object-cover rounded" />
                  </div>
                )}
                {piece.phonetics_audio && (
                  <div className="mt-2">
                    <audio controls src={piece.phonetics_audio} className="w-full" />
                  </div>
                )}
                {selection.translation_context && (
                  <div className="mt-2">Context: <span className="text-gray-800 font-medium">{selection.translation_context}</span></div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <button
            className="px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-all duration-150"
            onClick={() => {
              // Download a simple text summary as fallback
              const content = [`Selection: ${selection.text}`, `Source: ${selection.source_language}`, `Target: ${piece?.target_language || ''}`, `Translation: ${piece?.translation || piece?.definition || ''}`].join('\n');
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `language-card-${selection.selection_id}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            ⬇️ Download
          </button>

          <button
            className="px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-all duration-150"
            onClick={() => {
              // Open source url in new tab
              if (selection.context && selection.context.sourceUrl) {
                window.open(selection.context.sourceUrl, '_blank');
              }
            }}
          >
            🔗 Open Source
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageCard;
