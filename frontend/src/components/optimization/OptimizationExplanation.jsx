import React from 'react';
import { HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const OptimizationExplanation = ({ shapExplanation }) => {
  if (!shapExplanation || !shapExplanation.top_positive_features) return null;

  const { base_value, top_positive_features, top_negative_features } = shapExplanation;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <HelpCircle className="w-4 h-4 mr-1.5 text-cyan-600" />
          SHAP Feature Contribution for Recommended Scenario
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Explainable AI decomposition showing key operational feature contributions driving the recommended scenario's prediction.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Increasing Emission Contributions */}
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-2">
          <span className="font-bold text-rose-700 flex items-center uppercase tracking-wider text-[11px]">
            <ArrowUpRight className="w-4 h-4 mr-1" /> Features Increasing Emission
          </span>
          <div className="space-y-1.5 font-mono text-[11px]">
            {top_positive_features?.map((f, i) => (
              <div key={i} className="flex justify-between border-b border-rose-200/60 pb-1">
                <span className="text-slate-800 font-sans">{f.feature_name}</span>
                <span className="text-rose-700 font-bold">+{Math.round(f.shap_value)} kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decreasing Emission Contributions */}
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
          <span className="font-bold text-emerald-700 flex items-center uppercase tracking-wider text-[11px]">
            <ArrowDownRight className="w-4 h-4 mr-1" /> Features Decreasing Emission
          </span>
          <div className="space-y-1.5 font-mono text-[11px]">
            {top_negative_features?.map((f, i) => (
              <div key={i} className="flex justify-between border-b border-emerald-200/60 pb-1">
                <span className="text-slate-800 font-sans">{f.feature_name}</span>
                <span className="text-emerald-700 font-bold">{Math.round(f.shap_value)} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationExplanation;
