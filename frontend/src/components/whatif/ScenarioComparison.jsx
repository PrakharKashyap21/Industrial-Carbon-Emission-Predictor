import React from 'react';
import { Table, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export const ScenarioComparison = ({ comparisonData }) => {
  if (!comparisonData || !comparisonData.scenarios) return null;

  const { baseline_prediction, scenarios } = comparisonData;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <Table className="w-4 h-4 mr-1.5 text-cyan-400" />
            Side-by-Side Multi-Scenario Comparison Table
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Compare predicted CO₂ emissions, absolute reduction deltas, feasibility constraints, and prediction reliability across scenarios.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          Baseline: <span className="text-slate-200 font-bold">{baseline_prediction ? Math.round(baseline_prediction).toLocaleString() : '0'} kg CO₂</span>
        </div>
      </div>

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
