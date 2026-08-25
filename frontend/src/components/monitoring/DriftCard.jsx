import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export const DriftCard = ({ overview }) => {
  const status = overview?.overall_drift_status || 'low';

  let badge = (
    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center">
      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> LOW DRIFT
    </span>
  );
  if (status === 'moderate') {
    badge = (
      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center">
        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" /> MODERATE
      </span>
    );
  } else if (status === 'high') {
    badge = (
      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800 flex items-center">
        <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-400" /> HIGH DRIFT
      </span>
    );
  }

  const features = overview?.drift_features || [];
  const lowCount = features.filter((f) => f.drift_status === 'low').length;
  const modCount = features.filter((f) => f.drift_status === 'moderate').length;
  const highCount = features.filter((f) => f.drift_status === 'high').length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Feature Population Stability (PSI)
          </h3>
        </div>
        {badge}
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-center">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Low Drift</span>
          <span className="text-base font-extrabold text-emerald-400">{lowCount} features</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">Moderate</span>
          <span className={`text-base font-extrabold ${modCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {modCount} features
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-sans block">High Drift</span>
          <span className={`text-base font-extrabold ${highCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {highCount} features
          </span>
        </div>
      </div>
    </div>
  );
};

export default DriftCard;
