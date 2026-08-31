import React from 'react';
import { Award, TrendingDown } from 'lucide-react';

export const OptimizationImpact = ({ optimizationData }) => {
  if (!optimizationData) return null;

  const {
    total_runs,
    cumulative_estimated_saving_kg,
    average_reduction_percentage,
    best_run_saving_kg,
    history,
  } = optimizationData;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Award className="w-4 h-4 mr-1.5 text-cyan-600" />
            Model-Estimated Optimization Impact Tracking
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Aggregated carbon reduction impact derived from automated constrained optimization search runs.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Optimization Runs: {total_runs}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Cumulative Estimated Saving</span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {cumulative_estimated_saving_kg ? Math.round(cumulative_estimated_saving_kg).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-500">kg CO₂</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Total model-estimated reduction</span>
        </div>

        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block flex items-center text-cyan-700">
            <TrendingDown className="w-3.5 h-3.5 mr-1" /> Average Reduction %
          </span>
          <div className="text-2xl font-extrabold text-cyan-700 font-mono">
            {average_reduction_percentage}%
          </div>
          <span className="text-[10px] text-slate-500 block">Across feasible search configurations</span>
        </div>

        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Single Best Run Saving</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {best_run_saving_kg ? Math.round(best_run_saving_kg).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Highest single-run estimated reduction</span>
        </div>
      </div>

      {history && history.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Recent Optimization Search Logs</span>
          <div className="space-y-1.5 font-mono text-xs max-h-36 overflow-y-auto">
            {history.map((h, idx) => (
              <div key={idx} className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center text-[11px]">
                <div>
                  <span className="font-bold text-cyan-700">{h.optimization_id}</span>
                  <span className="text-slate-500 ml-2 font-sans">{h.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold">-{h.estimated_reduction_kg} kg (-{h.estimated_reduction_percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizationImpact;
