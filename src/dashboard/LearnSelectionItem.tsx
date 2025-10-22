import React, { useState } from 'react';
import type { LearnSpecificData } from '../content_scripts/types';
import { t } from '../lib/i18n';

interface Props {
  selection: LearnSpecificData;
  expandedComments: boolean;
  onToggleComments: () => void;
  deleteSelection: (id: string) => void;
  editSelection?: (selection: any) => Promise<boolean>;
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

const LearnSelectionItem: React.FC<Props> = ({ selection, expandedComments, onToggleComments, deleteSelection, editSelection }) => {
  const [expandedPieces, setExpandedPieces] = useState<Record<number, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(selection.text || '');
  const [editTags, setEditTags] = useState<string>((selection.tags || []).filter((t: string) => !t.startsWith('fn_')).join(', '));
  const [editPieces, setEditPieces] = useState<any[]>(Array.isArray(selection.pieces) ? selection.pieces.map((p: any) => ({ ...p })) : []);

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
            <div className="flex items-center space-x-1">
              {editSelection && (
                <button
                  onClick={() => setIsEditing(prev => !prev)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 px-2 py-0.5 rounded"
                  title="Edit selection"
                >
                  ✏️
                </button>
              )}
              <button
                onClick={() => deleteSelection(selection.selection_id)}
                className="text-red-400 hover:text-red-600 text-xs px-1 py-0.5 rounded"
                title="Delete selection"
              >
                🗑️
              </button>
            </div>
        </div>
      </div>

        {isEditing ? (
          <div className="mb-2 space-y-2">
            <label className="text-xs text-gray-600">{t('editSelectedText')}</label>
              <label className="text-xs text-gray-600">{t('editTags')}</label>
              <input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder={t('addTagsPlaceholder')} />

            {editPieces.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700">Pieces</div>
                {editPieces.map((p, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">{t('targetLanguage')}</label>
                        <input value={p.target_language || ''} onChange={(e) => {
                          const next = [...editPieces]; next[idx] = { ...next[idx], target_language: e.target.value }; setEditPieces(next);
                        }} className="w-full p-1 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">{t('partOfSpeech')}</label>
                        <input value={p.part_of_speech || ''} onChange={(e) => {
                          const next = [...editPieces]; next[idx] = { ...next[idx], part_of_speech: e.target.value }; setEditPieces(next);
                        }} className="w-full p-1 border rounded text-sm" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-xs text-gray-600">{t('editDefinition')}</label>
                      <input value={p.definition || ''} onChange={(e) => {
                        const next = [...editPieces]; next[idx] = { ...next[idx], definition: e.target.value }; setEditPieces(next);
                      }} className="w-full p-1 border rounded text-sm" />
                    </div>
                    <div className="mt-2">
                      <label className="text-xs text-gray-600">{t('editTranslation')}</label>
                      <input value={p.translation || ''} onChange={(e) => {
                        const next = [...editPieces]; next[idx] = { ...next[idx], translation: e.target.value }; setEditPieces(next);
                      }} className="w-full p-1 border rounded text-sm" />
                    </div>
                    <div className="mt-2">
                      <label className="text-xs text-gray-600">{t('editExample')}</label>
                      <input value={p.example || ''} onChange={(e) => {
                        const next = [...editPieces]; next[idx] = { ...next[idx], example: e.target.value }; setEditPieces(next);
                      }} className="w-full p-1 border rounded text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  if (!editSelection) return;
                  // preserve fn_ tags
                  const fnTags = (selection.tags || []).filter((t: string) => t.startsWith('fn_'));
                  const newTags = [...fnTags, ...editTags.split(',').map(t => t.trim()).filter(Boolean)];
                  const newSelection = { ...selection, text: editText, tags: newTags, pieces: editPieces };
                  const ok = await editSelection(newSelection);
                  if (ok) setIsEditing(false);
                }}
                className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded"
              >
                {t('save')}
              </button>
              <button onClick={() => { setIsEditing(false); setEditText(selection.text || ''); setEditTags((selection.tags || []).filter((t: string) => !t.startsWith('fn_')).join(', ')); setEditPieces(Array.isArray(selection.pieces) ? selection.pieces.map((p: any) => ({ ...p })) : []); }} className="px-2 py-1 text-sm bg-gray-100 rounded">{t('cancel')}</button>
            </div>
          </div>
        ) : (
          <div className="mb-2">
            <div className="p-2 bg-white rounded">
              <p className="text-base text-gray-800 font-medium leading-relaxed"><TextWithLineBreaks text={selection.text} /></p>
            </div>
          </div>
        )}

      {/* Removed explicit language labels per request; keep source_language in metadata but don't render it */}

      {pieces.length > 0 && (
        <div className="mb-2 space-y-2">
          {pieces.map((p, idx) => (
            <div key={idx} className="p-2 bg-white rounded shadow-sm border border-gray-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Emphasize the meaning/definition while keeping it visually separate from the selected text */}
                  <div className="text-sm text-gray-800">{p.translation || p.definition || '—'}</div>
                </div>
                <div className="ml-2">
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
            {expandedComments ? t('hideComments') : t('showComments')}
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
