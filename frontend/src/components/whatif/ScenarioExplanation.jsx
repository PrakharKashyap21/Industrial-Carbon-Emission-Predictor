import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

export const ScenarioExplanation = ({ shapExplanation }) => {
  if (!shapExplanation || !shapExplanation.shap_comparison) return null;

  const changes = shapExplanation.shap_comparison;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
        <HelpCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
        Why Did the Prediction Change? (SHAP Attribution Shift)
      </h4>

      <p className="text-xs text-slate-400">
        Changes in model-attributed feature contributions between Baseline and Scenario inputs:
      </p>

      <div className="space-y-3 pt-1 font-mono text-xs">
        {changes.slice(0, 5).map((item, idx) => (
          <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-sans font-bold text-slate-200 block">{item.display_name}</span>
              <span className="text-[11px] text-slate-500">
                Input: {item.baseline_value} {item.unit} <ArrowRight className="w-3 h-3 inline mx-1 text-slate-600" /> {item.scenario_value} {item.unit}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className={`font-bold block ${
                item.delta_shap_kg < 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {item.delta_shap_kg > 0 ? '+' : ''}{item.delta_shap_kg} kg CO₂
              </span>
              <span className="text-[10px] text-slate-500 font-sans">
                {item.delta_shap_kg < 0 ? 'Reduced Model Attribution' : 'Increased Model Attribution'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioExplanation;
