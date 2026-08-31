import React from 'react';
import { Table, CheckCircle2, AlertTriangle, ShieldCheck, Award, BarChart2 } from 'lucide-react';

export const ScenarioComparison = ({ comparisonData }) => {
  if (!comparisonData || !comparisonData.scenarios) return null;

  const { baseline_prediction, scenarios } = comparisonData;

  const baseKg = baseline_prediction || 1;
  const maxVal = Math.max(baseKg, ...scenarios.map((s) => s.ensemble_prediction || 0), 1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <Table className="w-4 h-4 mr-1.5 text-cyan-400" />
            Side-by-Side Multi-Scenario Comparison & Visual Chart
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Compare predicted CO₂ emissions, absolute reduction deltas, feasibility constraints, and prediction reliability across scenarios.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          Baseline: <span className="text-slate-200 font-bold">{baseline_prediction ? Math.round(baseline_prediction).toLocaleString() : '0'} kg CO₂</span>
        </div>
      </div>

      {/* Visual Emission Comparison Bar Chart */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
          <BarChart2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Visual Multi-Scenario Emission Comparison
        </span>
        <div className="space-y-2.5 pt-1">
          {/* Baseline Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-sans font-semibold">Baseline</span>
              <span className="text-slate-200 font-bold">{Math.round(baseKg).toLocaleString()} kg CO₂</span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 flex items-center p-0.5">
              <div
                className="h-full bg-slate-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (baseKg / maxVal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Scenario Bars */}
          {scenarios.map((scen, idx) => {
            const scenKg = scen.ensemble_prediction || 0;
            const pctWidth = Math.min(100, (scenKg / maxVal) * 100);
            const isReduction = scen.co2_change < 0;
            const isBest = idx === 0 && scen.feasible;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-sans font-semibold flex items-center gap-1.5">
                    {scen.scenario_name}
                    {isBest && (
                      <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] rounded font-bold uppercase flex items-center">
                        <Award className="w-2.5 h-2.5 mr-0.5" /> Best Valid
                      </span>
                    )}
                  </span>
                  <span className={`font-bold ${isReduction ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Math.round(scenKg).toLocaleString()} kg ({scen.co2_change > 0 ? `+${scen.co2_change}` : scen.co2_change} kg)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 flex items-center p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isReduction ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                    style={{ width: `${pctWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950/50">
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Scenario Name</th>
              <th className="py-3 px-4">Predicted CO₂</th>
              <th className="py-3 px-4">CO₂ Change (kg)</th>
              <th className="py-3 px-4">Change %</th>
              <th className="py-3 px-4">Feasibility</th>
              <th className="py-3 px-4">Reliability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {scenarios.map((scen, idx) => {
              const isReduction = scen.co2_change < 0;
              return (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-cyan-400">#{scen.rank || idx + 1}</td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-200">{scen.scenario_name}</td>
                  <td className="py-3 px-4 font-bold text-slate-100">
                    {scen.ensemble_prediction ? Math.round(scen.ensemble_prediction).toLocaleString() : '0'} kg
                  </td>
                  <td className={`py-3 px-4 font-bold ${isReduction ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {scen.co2_change > 0 ? `+${scen.co2_change}` : scen.co2_change} kg
                  </td>
                  <td className={`py-3 px-4 font-bold ${isReduction ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {scen.co2_change_percentage > 0 ? `+${scen.co2_change_percentage}` : scen.co2_change_percentage}%
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {scen.feasible ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Feasible
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Infeasible
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      scen.reliability_status === 'HIGH'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      <ShieldCheck className="w-3 h-3 mr-1" /> {scen.reliability_status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScenarioComparison;
