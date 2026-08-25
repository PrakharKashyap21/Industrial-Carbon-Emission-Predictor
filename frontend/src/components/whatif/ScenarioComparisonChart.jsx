import React from 'react';
import { BarChart2 } from 'lucide-react';

export const ScenarioComparisonChart = ({ baseline, scenario }) => {
  if (!baseline || !scenario) return null;

  const baseKg = baseline.prediction_kg;
  const scenKg = scenario.prediction_kg;
  const maxVal = Math.max(baseKg, scenKg, 1);

  const basePct = Math.min(100, (baseKg / maxVal) * 100);
  const scenPct = Math.min(100, (scenKg / maxVal) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
        <BarChart2 className="w-4 h-4 mr-1.5 text-cyan-600" />
        Baseline vs Scenario Visual Emission Comparison
      </h4>

      <div className="space-y-4 pt-2">
        {/* Baseline Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Baseline Operational Emission</span>
            <span className="font-mono text-slate-900 font-bold">{baseKg.toLocaleString()} kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200 flex items-center p-0.5">
            <div
              className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-full transition-all duration-500"
              style={{ width: `${basePct}%` }}
            />
          </div>
        </div>

        {/* Scenario Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-700">Modified Scenario Emission</span>
            <span className="font-mono text-cyan-800 font-bold">{scenKg.toLocaleString()} kg CO₂</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200 flex items-center p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                scenKg <= baseKg
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                  : 'bg-gradient-to-r from-rose-600 to-amber-500'
              }`}
              style={{ width: `${scenPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparisonChart;
