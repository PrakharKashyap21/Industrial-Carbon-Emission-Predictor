import React, { useState } from 'react';
import { Table, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const CandidateTable = ({ candidates }) => {
  const [filter, setFilter] = useState('feasible'); // 'all', 'feasible', 'rejected'

  if (!candidates || candidates.length === 0) return null;

  const filteredCandidates = candidates.filter((c) => {
    if (filter === 'feasible') return c.feasible;
    if (filter === 'rejected') return !c.feasible;
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Table className="w-4 h-4 mr-1.5 text-cyan-600" />
            Grid Search Candidate Audit Log Table
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Transparent audit log of generated operating configurations, predictions, feasibility statuses, and rejection reasons.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilter('feasible')}
            className={`px-3 py-1 rounded-lg transition-colors ${filter === 'feasible' ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Feasible Only
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 rounded-lg transition-colors ${filter === 'rejected' ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Rejected Only
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${filter === 'all' ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Candidates ({candidates.length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] text-slate-600 font-bold uppercase tracking-wider bg-slate-50">
              <th className="py-3 px-4">Candidate ID</th>
              <th className="py-3 px-4">Elec Δ</th>
              <th className="py-3 px-4">Fuel Δ</th>
              <th className="py-3 px-4">Runtime Δ</th>
              <th className="py-3 px-4">Predicted CO₂</th>
              <th className="py-3 px-4">CO₂ Change</th>
              <th className="py-3 px-4">Feasibility</th>
              <th className="py-3 px-4">Reliability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {filteredCandidates.map((cand, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-bold text-cyan-700">{cand.candidate_id}</td>
                <td className="py-3 px-4 text-slate-700">{cand.change_values?.electricity_change || 0}%</td>
                <td className="py-3 px-4 text-slate-700">{cand.change_values?.fuel_change || 0}%</td>
                <td className="py-3 px-4 text-slate-700">{cand.change_values?.runtime_change || 0}%</td>
                <td className="py-3 px-4 font-bold text-slate-900">
                  {cand.ensemble_prediction ? Math.round(cand.ensemble_prediction).toLocaleString() : '0'} kg
                </td>
                <td className={`py-3 px-4 font-bold ${cand.co2_change < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {cand.co2_change > 0 ? `+${cand.co2_change}` : cand.co2_change} kg
                </td>
                <td className="py-3 px-4 font-sans">
                  {cand.feasible ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Feasible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={cand.rejection_reason}>
                      <AlertTriangle className="w-3 h-3 mr-1" /> Rejected
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-sans">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    cand.reliability_status === 'HIGH' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <ShieldCheck className="w-3 h-3 mr-1" /> {cand.reliability_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidateTable;
