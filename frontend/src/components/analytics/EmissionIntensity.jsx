import React from 'react';
import { Gauge, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

export const EmissionIntensity = ({ intensityData }) => {
  if (!intensityData) return null;

  const {
    emission_intensity,
    previous_emission_intensity,
    intensity_change_percentage,
    co2_change_percentage,
    production_change_percentage,
    interpretation,
  } = intensityData;

  const isEfficiencyImproved = intensity_change_percentage < 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Gauge className="w-4 h-4 mr-1.5 text-cyan-600" />
            Production-Normalized Emission Intensity
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Key industrial efficiency metric: CO₂ emission produced per unit of manufactured product.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center ${
            isEfficiencyImproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isEfficiencyImproved ? <ArrowDownRight className="w-3.5 h-3.5 mr-1" /> : <ArrowUpRight className="w-3.5 h-3.5 mr-1" />}
            {intensity_change_percentage > 0 ? `+${intensity_change_percentage}%` : `${intensity_change_percentage}%`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Current Emission Intensity</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{emission_intensity}</div>
          <span className="text-[10px] text-slate-500 block">kg CO₂ / unit</span>
        </div>

        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Previous Period Baseline</span>
          <div className="text-2xl font-extrabold text-slate-700 font-mono">{previous_emission_intensity}</div>
          <span className="text-[10px] text-slate-500 block">kg CO₂ / unit</span>
        </div>

        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Period Growth Dynamics</span>
          <div className="text-xs font-mono space-y-0.5 text-slate-700">
            <div>Production: <strong className="text-emerald-600">{production_change_percentage > 0 ? `+${production_change_percentage}%` : `${production_change_percentage}%`}</strong></div>
            <div>Predicted CO₂: <strong className="text-cyan-600">{co2_change_percentage > 0 ? `+${co2_change_percentage}%` : `${co2_change_percentage}%`}</strong></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs text-slate-700">
        <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 block">Industrial Context & Efficiency Insight:</span>
          <span className="text-slate-600 font-sans">{interpretation}</span>
        </div>
      </div>
    </div>
  );
};

export default EmissionIntensity;
