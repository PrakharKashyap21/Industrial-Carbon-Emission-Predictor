import React, { useState } from 'react';
import { Zap, Flame, Wind } from 'lucide-react';

export const ConsumptionChart = ({ trends }) => {
  const [resource, setResource] = useState('electricity');

  if (!trends || !trends.length) return null;

  const keyMap = {
    electricity: { key: 'electricity_kwh', label: 'Electricity Consumption', unit: 'kWh', color: 'from-amber-600 to-amber-500', icon: Zap },
    diesel: { key: 'diesel_liters', label: 'Diesel Fuel Consumption', unit: 'Liters', color: 'from-amber-700 to-amber-600', icon: Flame },
    gas: { key: 'natural_gas_m3', label: 'Natural Gas Consumption', unit: 'm³', color: 'from-blue-600 to-cyan-500', icon: Wind },
  };

  const currentRes = keyMap[resource];
  const IconComp = currentRes.icon;

  const maxVal = Math.max(...trends.map((t) => t[currentRes.key] || 0), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <IconComp className="w-4 h-4 mr-1.5 text-amber-600" />
          {currentRes.label}
        </h3>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setResource('electricity')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              resource === 'electricity' ? 'bg-white text-amber-800 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Electricity
          </button>
          <button
            onClick={() => setResource('diesel')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              resource === 'diesel' ? 'bg-white text-amber-800 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diesel Fuel
          </button>
          <button
            onClick={() => setResource('gas')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
              resource === 'gas' ? 'bg-white text-blue-800 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Natural Gas
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-2 overflow-hidden">
        <div className="overflow-x-auto pb-2">
          <div className="h-56 min-w-[500px] sm:min-w-full flex items-end justify-between space-x-1 sm:space-x-1.5 pt-12 pb-2 border-b border-slate-200 relative overflow-visible">
            {trends.slice(-30).map((pt, idx) => {
              const val = pt[currentRes.key] || 0;
              const height = Math.min(100, Math.max(10, (val / maxVal) * 100));

              const isLeft = idx < 4;
              const isRight = idx > trends.slice(-30).length - 5;
              const tooltipPosClass = isLeft ? 'left-0' : isRight ? 'right-0' : 'left-1/2 -translate-x-1/2';

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end min-w-[10px]">
                  {/* Tooltip */}
                  <div className={`absolute top-0 ${tooltipPosClass} hidden group-hover:block z-50 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl border border-slate-700 shadow-2xl whitespace-nowrap font-mono pointer-events-none`}>
                    <span className="font-sans font-bold text-amber-300 block border-b border-slate-700 pb-1 mb-1">{pt.timestamp}</span>
                    {currentRes.label}: <strong className="text-amber-400 font-bold">{val.toLocaleString()} {currentRes.unit}</strong>
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full bg-gradient-to-t ${currentRes.color} rounded-t transition-all shadow-xs`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>{trends[0]?.timestamp}</span>
          <span>{trends[trends.length - 1]?.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionChart;
