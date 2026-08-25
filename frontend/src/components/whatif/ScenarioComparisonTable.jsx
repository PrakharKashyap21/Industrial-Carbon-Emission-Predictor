import React from 'react';
import { Table } from 'lucide-react';

export const ScenarioComparisonTable = ({ batchResult }) => {
  if (!batchResult || !batchResult.scenarios || !batchResult.scenarios.length) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 overflow-x-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
          <Table className="w-4 h-4 mr-1.5 text-cyan-400" />
          Multi-Scenario Comparison Matrix
        </h4>
        {batchResult.best_scenario_name && (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Lowest Emission Scenario: {batchResult.best_scenario_name}
          </span>
        )}
      </div>

      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-semibold">
            <th className="py-2.5 px-3">Scenario Name</th>
            <th className="py-2.5 px-3 text-right">Predicted CO₂</th>
            <th className="py-2.5 px-3 text-right">CO₂ Difference</th>
            <th className="py-2.5 px-3 text-right">Change (%)</th>
            <th className="py-2.5 px-3 text-right">CO₂ Intensity</th>
            <th className="py-2.5 px-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {/* Baseline Row */}
          <tr className="bg-slate-950/60 font-sans">
            <td className="py-2.5 px-3 font-bold text-slate-200">Baseline (Current Conditions)</td>
            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
              {batchResult.baseline.prediction_kg.toLocaleString()} kg
            </td>
            <td className="py-2.5 px-3 text-right font-mono text-slate-500">—</td>
            <td className="py-2.5 px-3 text-right font-mono text-slate-500">—</td>
            <td className="py-2.5 px-3 text-right font-mono text-slate-300">
              {batchResult.baseline.co2_intensity ? `${batchResult.baseline.co2_intensity} kg/U` : 'N/A'}
            </td>
            <td className="py-2.5 px-3 text-center">
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                Baseline
              </span>
            </td>
          </tr>

          {/* Scenario Rows */}
          {batchResult.scenarios.map((item, idx) => {
            const isBest = item.scenario_name === batchResult.best_scenario_name;
            const comp = item.comparison;
            const isReduction = comp.direction === 'reduction';

            return (
              <tr key={idx} className={`hover:bg-slate-800/40 ${isBest ? 'bg-emerald-950/20' : ''}`}>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                  {item.scenario_name}
                  {isBest && (
                    <span className="ml-2 text-[10px] font-bold text-emerald-400">★ Lowest Emission</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-cyan-300">
                  {item.scenario.prediction_kg.toLocaleString()} kg
                </td>
                <td className={`py-2.5 px-3 text-right font-bold ${
                  comp.difference_kg < 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {comp.difference_kg > 0 ? '+' : ''}{comp.difference_kg.toLocaleString()} kg
                </td>
                <td className={`py-2.5 px-3 text-right font-bold ${
                  comp.percentage_change < 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {comp.percentage_change !== null ? `${comp.percentage_change > 0 ? '+' : ''}${comp.percentage_change}%` : 'N/A'}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-300">
                  {item.scenario.co2_intensity ? `${item.scenario.co2_intensity} kg/U` : 'N/A'}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                    isReduction
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {comp.direction.toUpperCase()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ScenarioComparisonTable;
