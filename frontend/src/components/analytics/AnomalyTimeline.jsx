import React from 'react';
import { AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export const AnomalyTimeline = ({ anomalyData }) => {
  if (!anomalyData) return null;

  const { total_anomalies, warning_count, critical_count, timeline } = anomalyData;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-400" />
            Operational Anomaly Timeline & Audit Summary
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Historical record of logged operational anomalies, parameter shifts, and emission spikes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            Warnings: {warning_count}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
            Critical: {critical_count}
          </span>
        </div>
      </div>

      <div className="space-y-3 font-sans text-xs max-h-64 overflow-y-auto">
        {timeline && timeline.length > 0 ? (
          timeline.map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 bg-amber-950/80 text-amber-400 rounded-lg border border-amber-800 shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-200 block text-xs">{item.message}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">Event Type: {item.event_type} | Parameter: {item.feature_name || 'CO₂'}</span>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono shrink-0">{item.date}</span>
            </div>
          ))
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-slate-500 flex items-center justify-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>No operational anomalies detected in the selected timeframe.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyTimeline;
