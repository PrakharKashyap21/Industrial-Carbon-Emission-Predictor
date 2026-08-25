import React from 'react';
import { Activity } from 'lucide-react';

export const DriftChart = ({ features }) => {
  if (!features || features.length === 0) return null;

  const getStatusColor = (status) => {
    if (status === 'high') return 'text-rose-400 bg-rose-950 border-rose-800';
    if (status === 'moderate') return 'text-amber-400 bg-amber-950 border-amber-800';
    return 'text-emerald-400 bg-emerald-950 border-emerald-800';
  };

  const getBarColor = (status) => {
    if (status === 'high') return 'bg-rose-500';
    if (status === 'moderate') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
          <Activity className="w-4 h-4 mr-1.5 text-cyan-400" />
          Feature Population Stability Index (PSI) Breakdown
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          Thresholds: Low &lt; 0.10 • Moderate 0.10–0.25 • High &gt; 0.25
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {features.map((f, idx) => {
          // Scale bar width (max PSI scale 0.50)
          const barWidth = Math.min((f.psi / 0.50) * 100, 100);

          return (
            <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between font-sans">
                <span className="font-bold text-slate-200 text-xs font-mono">{f.feature}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-slate-500 font-mono">
                    KS Stat: <strong>{f.ks_statistic}</strong> (p={f.p_value})
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(f.drift_status)}`}>
                    {f.drift_status} (PSI {f.psi})
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div className={`h-full rounded-full transition-all duration-500 ${getBarColor(f.drift_status)}`} style={{ width: `${barWidth}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriftChart;
