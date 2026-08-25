import React from 'react';
import { Award, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export const ModelPerformanceCard = ({ overview, performance }) => {
  const status = overview?.overall_performance_status || performance?.overall_performance_status || 'stable';

  let badge = (
    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center">
      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> STABLE
    </span>
  );
  if (status === 'warning') {
    badge = (
      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center">
        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" /> DEGRADATION WARNING
      </span>
    );
  } else if (status === 'degraded') {
    badge = (
      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800 flex items-center">
        <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-400" /> CRITICAL DEGRADATION
      </span>
    );
  }

  const currentMae = performance?.current_mae;
  const baselineMae = performance?.baseline?.baseline_mae || 226.35;
  const degPct = performance?.degradation_pct || 0.0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Operational Error Degradation
          </h3>
        </div>
        {badge}
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-center">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Test Baseline MAE</span>
          <span className="text-base font-extrabold text-cyan-300">{baselineMae} kg</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Operational MAE</span>
          <span className="text-base font-extrabold text-slate-200">
            {currentMae !== null && currentMae !== undefined ? `${currentMae} kg` : 'N/A'}
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Degradation %</span>
          <span className={`text-base font-extrabold ${degPct > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {degPct > 0 ? `+${degPct}%` : `${degPct}%`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceCard;
