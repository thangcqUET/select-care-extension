import React from 'react';

type Props = {
  selectionsCount: number;
  todayCount: number;
  notesCount: number;
};

const StatsView: React.FC<Props> = ({ selectionsCount, todayCount, notesCount }) => {
  return (
    <div className="bg-white/80 rounded-lg p-4 border">
      <h2 className="text-sm font-semibold mb-3">User Stats</h2>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="p-3 bg-indigo-50 rounded">
          <div className="text-lg font-bold">{selectionsCount}</div>
          <div className="text-gray-600">Total selections</div>
        </div>
        <div className="p-3 bg-green-50 rounded">
          <div className="text-lg font-bold">{todayCount}</div>
          <div className="text-gray-600">Today</div>
        </div>
        <div className="p-3 bg-purple-50 rounded">
          <div className="text-lg font-bold">{notesCount}</div>
          <div className="text-gray-600">Notes</div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
