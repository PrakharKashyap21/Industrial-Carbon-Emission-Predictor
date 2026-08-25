import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

export const ScenarioRecommendation = ({ recommendation }) => {
  if (!recommendation) return null;

  const {
    recommended_scenario_name,
    estimated_co2_kg,
    co2_change_kg,
    co2_change_percentage,
    reliability_status,
    feasible,
    recommendation_reasons,
  } = recommendation;

  const isReduction = co2_change_kg < 0;

  return (
    <div className="bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-900 border border-cyan-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block">Optimal Recommended Scenario</span>
            <h3 className="text-base font-extrabold text-white">{recommended_scenario_name}</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-sans">
          {feasible ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Feasible
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" /> Infeasible
            </span>
          )}

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center ${
            reliability_status === 'HIGH'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            <ShieldCheck className="w-3 h-3 mr-1" /> Reliability: {reliability_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-900/40 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Optimized Estimated Emission</span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {estimated_co2_kg ? Math.round(estimated_co2_kg).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border space-y-1 ${
          isReduction ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' : 'bg-rose-950/50 border-rose-800 text-rose-300'
        }`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider block">Estimated CO₂ Reduction</span>
          <div className="text-2xl font-extrabold font-mono">
            {co2_change_kg > 0 ? `+${co2_change_kg}` : co2_change_kg} <span className="text-xs font-normal">kg ({co2_change_percentage > 0 ? `+${co2_change_percentage}` : co2_change_percentage}%)</span>
          </div>
        </div>
      </div>

      {/* Decision-Support Recommendation Reasons */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Executive Decision Justification:
        </span>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {recommendation_reasons?.map((reason, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-cyan-400 mr-2 font-bold">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ScenarioRecommendation;
