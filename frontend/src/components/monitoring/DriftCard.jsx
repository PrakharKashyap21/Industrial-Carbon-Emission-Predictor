import React from 'react';
import { Activity } from 'lucide-react';
import Badge from '../ui/Badge';

export const DriftCard = ({ overview }) => {
  const status = overview?.overall_drift_status || 'low';
  const features = overview?.drift_features || [];
  const lowCount = overview?.low_drift_count ?? features.filter((f) => f.drift_status === 'low').length;
  const modCount = overview?.moderate_drift_count ?? features.filter((f) => f.drift_status === 'moderate').length;
  const highCount = overview?.high_drift_count ?? features.filter((f) => f.drift_status === 'high').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Feature Drift (PSI)
          </h3>
        </div>
        <Badge variant={status === 'low' ? 'success' : status === 'moderate' ? 'warning' : 'danger'}>
          {status === 'low' ? 'LOW DRIFT' : status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 block">Low Drift</span>
          <span className="text-sm font-extrabold font-mono text-emerald-700">{lowCount}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 block">Moderate</span>
          <span className={`text-sm font-extrabold font-mono ${modCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            {modCount}
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 block">High Drift</span>
          <span className={`text-sm font-extrabold font-mono ${highCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {highCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DriftCard;
