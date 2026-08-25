import React from 'react';
import { Database, ShieldCheck, Clock, FileCheck } from 'lucide-react';

export const DataQualityCard = ({ dataQuality }) => {
  if (!dataQuality) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <Database className="w-4 h-4 mr-1.5 text-cyan-600" />
          Database Quality & Integrity
        </h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Verified Clean
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-600 font-sans block">Total DB Readings</span>
          <span className="text-base font-extrabold text-slate-900">{dataQuality.total_readings.toLocaleString()}</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-600 font-sans block">Period Filtered Readings</span>
          <span className="text-base font-extrabold text-cyan-700">{dataQuality.period_readings.toLocaleString()}</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-600 font-sans block">Missing Value Ratio</span>
          <span className="text-base font-extrabold text-emerald-700">{dataQuality.missing_values_pct}%</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-600 font-sans block">Data Freshness</span>
          <span className="text-[11px] font-bold text-slate-700 flex items-center mt-1">
            <Clock className="w-3 h-3 mr-1 text-slate-400 shrink-0" /> {dataQuality.latest_timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataQualityCard;
