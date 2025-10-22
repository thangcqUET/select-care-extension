import React from 'react';
import type { BasedSelection } from '../content_scripts/types';
import NoteCard from './NoteCard';
import { t } from '../lib/i18n';

interface Props {
  selection: BasedSelection;
  expandedComments: boolean;
  onToggleComments: () => void;
  expandedCard: boolean;
  onToggleCard: () => void;
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

const NoteSelectionItem: React.FC<Props> = ({ selection, expandedComments, onToggleComments, expandedCard, onToggleCard, deleteSelection, editSelection, getUserStats }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(selection.text || '');
  const [editTags, setEditTags] = React.useState((selection.tags || []).filter((t: string) => !t.startsWith('fn_')).join(', '));
  const [editComments, setEditComments] = React.useState((selection.comments || []).join('\n'));
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
          <label className="text-xs text-gray-600">{t('editComments')}</label>
          <textarea value={editComments} onChange={(e) => setEditComments(e.target.value)} className="w-full p-2 border rounded text-sm" rows={3} />
          <label className="text-xs text-gray-600">{t('editTags')}</label>
          <input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder={t('addTagsPlaceholder')} />
          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                if (!editSelection) return;
                const fnTags = (selection.tags || []).filter((t: string) => t.startsWith('fn_'));
                const newTags = [...fnTags, ...editTags.split(',').map(t => t.trim()).filter(Boolean)];
                const newSelection = { ...selection, text: editText, tags: newTags, comments: editComments.split('\n').map(s => s.trim()).filter(Boolean) };
                const ok = await editSelection(newSelection);
                if (ok) setIsEditing(false);
              }}
              className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded"
            >
              {t('save')}
            </button>
            <button onClick={() => { setIsEditing(false); setEditText(selection.text || ''); setEditTags((selection.tags || []).filter((t: string) => !t.startsWith('fn_')).join(', ')); setEditComments((selection.comments || []).join('\n')); }} className="px-2 py-1 text-sm bg-gray-100 rounded">{t('cancel')}</button>
          </div>
        </div>
      ) : (
        <div className="mb-2">
          <p className="text-sm text-gray-900 leading-relaxed"><TextWithLineBreaks text={selection.text} /></p>
        </div>
      )}

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

      <div className="mb-2">
        <button onClick={onToggleCard} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer bg-transparent border-none p-0">
          {expandedCard ? t('hideCard') : t('generateShareCard')}
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
