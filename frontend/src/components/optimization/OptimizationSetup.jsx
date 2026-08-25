import React from 'react';
import { Sliders, Zap, Fuel, Clock } from 'lucide-react';

export const OptimizationSetup = ({ searchParams, onChange, disabled }) => {
  const handleNumChange = (field, val) => {
    onChange({ ...searchParams, [field]: parseFloat(val) || 0 });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <Sliders className="w-4 h-4 mr-1.5 text-cyan-600" />
          Grid Search Space & Reduction Boundaries
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Define maximum percentage reduction search limits and step increments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Electricity */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 flex items-center">
            <Zap className="w-3.5 h-3.5 mr-1 text-cyan-600" /> Electricity Reduction Cap
          </span>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Max Cap:</span>
              <span className="text-cyan-700 font-mono font-bold">{searchParams.max_electricity_reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              disabled={disabled}
              value={searchParams.max_electricity_reduction}
              onChange={(e) => handleNumChange('max_electricity_reduction', e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
          </div>
        </div>

        {/* Diesel Fuel */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 flex items-center">
            <Fuel className="w-3.5 h-3.5 mr-1 text-amber-600" /> Fuel Reduction Cap
          </span>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Max Cap:</span>
              <span className="text-amber-700 font-mono font-bold">{searchParams.max_fuel_reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              disabled={disabled}
              value={searchParams.max_fuel_reduction}
              onChange={(e) => handleNumChange('max_fuel_reduction', e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        </div>

        {/* Machine Runtime */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Machine Runtime Cap
          </span>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Max Cap:</span>
              <span className="text-emerald-700 font-mono font-bold">{searchParams.max_runtime_reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="5"
              disabled={disabled}
              value={searchParams.max_runtime_reduction}
              onChange={(e) => handleNumChange('max_runtime_reduction', e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationSetup;
