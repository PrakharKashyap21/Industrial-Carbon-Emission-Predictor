import React from 'react';
import { FileText, Download, ShieldCheck } from 'lucide-react';

export const ReportHeader = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 rounded-lg text-[10px] font-bold border border-cyan-800 uppercase tracking-widest flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Executive Reporting Engine
          </span>
          <span className="text-xs text-slate-400 font-semibold">• Management-Ready PDF, Excel & CSV Export</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Industrial Carbon Performance Reports</h1>
      </div>

      <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
        <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Audit Logged & Role Governed
        </span>
      </div>
    </div>
  );
};

export default ReportHeader;
