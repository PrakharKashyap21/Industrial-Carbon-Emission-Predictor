import React from 'react';
import { Award, CheckCircle2, TrendingDown, ShieldCheck, Zap, Fuel, Clock } from 'lucide-react';

export const OptimizationResult = ({ result }) => {
  if (!result || !result.recommended_candidate) return null;

  const { baseline_prediction, recommended_candidate, candidates_generated, candidates_evaluated, candidates_rejected } = result;
  const {
    recommended_candidate_id,
    recommended_changes,
    recommended_inputs,
    predicted_co2,
    estimated_reduction_kg,
    estimated_reduction_percentage,
    reliability_status,
  } = recommended_candidate;

  return (
    <div className="bg-white border-2 border-cyan-500/30 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-[10px] font-bold border border-cyan-200 uppercase tracking-widest flex items-center">
              <Award className="w-3.5 h-3.5 mr-1" /> Optimal Feasible Scenario
            </span>
            <span className="text-xs text-slate-500 font-mono">Candidate ID: {recommended_candidate_id}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Model-Recommended Operating Configuration</h2>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Feasible
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Reliability: {reliability_status}
          </span>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">Baseline CO₂ Emission</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {baseline_prediction ? Math.round(baseline_prediction).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Current plant operating baseline</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">Optimized Predicted CO₂</span>
          <div className="text-2xl font-extrabold text-cyan-700 font-mono">
            {predicted_co2 ? Math.round(predicted_co2).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-cyan-700 block">Lowest feasible predicted scenario</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider block flex items-center text-emerald-800">
            <TrendingDown className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Model-Estimated CO₂ Reduction
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">
            -{estimated_reduction_kg ? Math.round(estimated_reduction_kg).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-600">kg (-{estimated_reduction_percentage}%)</span>
          </div>
          <span className="text-[10px] text-emerald-700 block">Estimated emission reduction</span>
        </div>
      </div>

      {/* Recommended Operating Parameter Changes */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Recommended Operational Adjustments:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-600 font-sans flex items-center"><Zap className="w-3 h-3 mr-1 text-cyan-600" /> Electricity</span>
            <span className="font-bold text-cyan-700 text-sm">{recommended_changes?.electricity_change || 0}%</span>
            <span className="text-[10px] text-slate-500 block">{recommended_inputs?.electricity_consumption_kwh?.toLocaleString()} kWh</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-600 font-sans flex items-center"><Fuel className="w-3 h-3 mr-1 text-amber-600" /> Fuel</span>
            <span className="font-bold text-amber-700 text-sm">{recommended_changes?.fuel_change || 0}%</span>
            <span className="text-[10px] text-slate-500 block">{recommended_inputs?.diesel_consumption_liters?.toLocaleString()} L</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-600 font-sans flex items-center"><Clock className="w-3 h-3 mr-1 text-emerald-600" /> Machine Runtime</span>
            <span className="font-bold text-emerald-700 text-sm">{recommended_changes?.runtime_change || 0}%</span>
            <span className="text-[10px] text-slate-500 block">{recommended_inputs?.machine_runtime_hours} hrs</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-600 font-sans flex items-center">Production</span>
            <span className="font-bold text-slate-900 text-sm">0% (Preserved)</span>
            <span className="text-[10px] text-slate-500 block">{recommended_inputs?.production_quantity?.toLocaleString()} units</span>
          </div>
        </div>
      </div>

      {/* Grid Audit Search Summary */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span>Candidates Generated: <strong className="text-slate-900">{candidates_generated}</strong></span>
        <span>Evaluated: <strong className="text-cyan-700">{candidates_evaluated}</strong></span>
        <span>Rejected: <strong className="text-rose-600">{candidates_rejected}</strong></span>
      </div>
    </div>
  );
};

export default OptimizationResult;
