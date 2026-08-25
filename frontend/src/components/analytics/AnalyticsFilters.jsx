import React from 'react';

export const AnalyticsFilters = ({ days, setDays, plantId, setPlantId, disabled }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
      {/* Date Window Filter */}
      <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          disabled={disabled}
          onClick={() => setDays(7)}
          className={`px-3 py-1 rounded-lg transition-colors ${days === 7 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'}`}
        >
          Last 7 Days
        </button>
        <button
          disabled={disabled}
          onClick={() => setDays(30)}
          className={`px-3 py-1 rounded-lg transition-colors ${days === 30 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'}`}
        >
          Last 30 Days
        </button>
        <button
          disabled={disabled}
          onClick={() => setDays(90)}
          className={`px-3 py-1 rounded-lg transition-colors ${days === 90 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'}`}
        >
          Last 90 Days
        </button>
      </div>

      {/* Plant Filter */}
      <select
        value={plantId || ''}
        disabled={disabled}
        onChange={(e) => setPlantId(e.target.value ? parseInt(e.target.value) : null)}
        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-cyan-300 focus:border-cyan-500 focus:outline-none"
      >
        <option value="">All Industrial Plants</option>
        <option value="1">Plant Alpha (Primary Facility)</option>
        <option value="2">Plant Beta</option>
      </select>
    </div>
  );
};

export default AnalyticsFilters;
