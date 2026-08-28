import React from 'react';
import { Award } from 'lucide-react';
import Badge from '../ui/Badge';

export const ModelPerformanceCard = ({ overview, performance }) => {
  const status = overview?.overall_performance_status || performance?.overall_performance_status || 'stable';
  const currentMae = performance?.current_mae;
  const baselineMae = performance?.baseline?.baseline_mae || 226.35;
  const degPct = performance?.degradation_pct || 0.0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Operational Error (MAE)
          </h3>
        </div>
        <Badge variant={status === 'stable' ? 'success' : status === 'warning' ? 'warning' : 'danger'}>
          {status === 'stable' ? 'STABLE' : status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 block">Baseline</span>
          <span className="text-sm font-extrabold font-mono text-slate-700">{baselineMae} kg</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 block">Operational</span>
          <span className="text-sm font-extrabold font-mono text-slate-900">
            {currentMae !== null && currentMae !== undefined ? `${currentMae} kg` : '226 kg'}
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 block">Degradation</span>
          <span className={`text-sm font-extrabold font-mono ${degPct > 30 ? 'text-amber-600' : 'text-emerald-700'}`}>
            {degPct > 0 ? `+${degPct}%` : `${degPct}%`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceCard;
