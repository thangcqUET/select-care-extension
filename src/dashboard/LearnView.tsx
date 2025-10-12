import React from 'react';
import { BasedSelection } from '../content_scripts/types';
import LearnSelectionItem from './LearnSelectionItem';

type Props = {
  selections: BasedSelection[];
  expandedComments: Set<string>;
  toggleCommentsFor: (id: string) => void;
  deleteSelection: (id: string) => Promise<void>;
  getUserStats: () => { totalSelections: number; todayCount: number };
};

const LearnView: React.FC<Props> = ({ selections, expandedComments, toggleCommentsFor, deleteSelection, getUserStats }) => {
  const learnItems = selections.filter(s => s.type === 'learn') as BasedSelection[];

  if (learnItems.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📚</div>
        <p className="text-gray-500 text-sm">No learning selections</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {learnItems.map(selection => (
        <LearnSelectionItem
          key={selection.selection_id}
          selection={selection as any}
          expandedComments={expandedComments.has(selection.selection_id)}
          onToggleComments={() => toggleCommentsFor(selection.selection_id)}
          deleteSelection={deleteSelection}
          getUserStats={getUserStats}
        />
      ))}
    </div>
  );
};

export default LearnView;
