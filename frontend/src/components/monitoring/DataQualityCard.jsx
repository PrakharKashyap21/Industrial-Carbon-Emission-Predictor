import React from 'react';
import { Database, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export const DataQualityCard = ({ overview }) => {
  const status = overview?.overall_data_quality || 'good';

  let badge = (
    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center">
      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> GOOD
    </span>
  );
  if (status === 'warning') {
    badge = (
      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center">
        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" /> WARNING
      </span>
    );
  } else if (status === 'critical') {
    badge = (
      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800 flex items-center">
        <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-400" /> CRITICAL
      </span>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Input Data Quality
          </h3>
        </div>
        {badge}
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-center">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Total Evaluated</span>
          <span className="text-base font-extrabold text-slate-200">{overview?.total_records || 0}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Missing Records</span>
          <span className={`text-base font-extrabold ${overview?.missing_records > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {overview?.missing_records || 0}
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Duplicates</span>
          <span className="text-base font-extrabold text-slate-300">{overview?.duplicate_records || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default DataQualityCard;
