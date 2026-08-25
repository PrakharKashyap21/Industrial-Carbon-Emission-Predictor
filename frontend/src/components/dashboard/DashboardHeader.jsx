import React from 'react';
import { Factory, RefreshCw, Calendar, MapPin, Clock } from 'lucide-react';

export const DashboardHeader = ({
  plant,
  selectedPlantId,
  onPlantChange,
  days,
  onDaysChange,
  onRefresh,
  loading,
  lastUpdated,
}) => {
  const plantsList = [
    { id: '', name: 'All Facilities Combined' },
    { id: '1', name: 'Apex Steel Works' },
    { id: '2', name: 'Titan Cement Plant' },
    { id: '3', name: 'SynthoChem Industries' },
    { id: '4', name: 'Vanguard Textile Mill' },
    { id: '5', name: 'NutriFood Processing Ltd' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Facility Context */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl shadow-md shadow-cyan-600/20 text-white">
            <Factory className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Industrial Carbon Analytics Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                AI Emission Engine
              </span>
            </div>
            <p className="text-xs text-slate-600 flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Plant: <strong className="text-slate-900 font-semibold">{plant?.name || 'All Facilities Combined'}</strong></span>
              <span className="mx-2 text-slate-300">•</span>
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Data Freshness: <span className="text-slate-700 font-mono">{lastUpdated || 'Live'}</span></span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Plant Dropdown */}
          <div className="relative">
            <select
              value={selectedPlantId || ''}
              onChange={(e) => onPlantChange(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
            >
              {plantsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => onDaysChange(d)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center ${
                  days === d
                    ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3 h-3 mr-1" />
                <span>{d}d</span>
              </button>
            ))}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
