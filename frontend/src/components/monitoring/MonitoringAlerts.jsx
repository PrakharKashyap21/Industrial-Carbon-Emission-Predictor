import React from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveMonitoringAlert, acknowledgeMonitoringAlert } from '../../services/monitoringApi';
import { Bell, CheckCircle2, AlertTriangle, AlertOctagon, Lightbulb, SlidersHorizontal, TrendingDown, Eye } from 'lucide-react';

export const MonitoringAlerts = ({ alerts, onResolve }) => {
  const navigate = useNavigate();

  const handleAcknowledge = async (id) => {
    const res = await acknowledgeMonitoringAlert(id);
    if (res.success && onResolve) {
      onResolve();
    }
  };

  const handleResolve = async (id) => {
    const res = await resolveMonitoringAlert(id);
    if (res.success && onResolve) {
      onResolve();
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center border-b border-slate-800 pb-3">
          <Bell className="w-4 h-4 mr-1.5 text-cyan-400" />
          Active System Monitoring Alerts
        </h3>
        <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl text-center text-xs text-slate-400 font-sans flex items-center justify-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>No active system alerts detected. System operating within normal baseline parameters.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
          <Bell className="w-4 h-4 mr-1.5 text-amber-400 animate-pulse" />
          Active System Monitoring Alerts ({alerts.length})
        </h3>
      </div>

      <div className="space-y-3">
        {alerts.map((a) => {
          let sevBadge = (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
              WARNING
            </span>
          );
          if (a.severity === 'CRITICAL') {
            sevBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                CRITICAL
              </span>
            );
          } else if (a.severity === 'INFO') {
            sevBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                INFO
              </span>
            );
          }

          const isAck = a.status === 'acknowledged';

          return (
            <div key={a.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {sevBadge}
                    <span className="text-[11px] font-mono font-bold text-cyan-400">{a.alert_type}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      isAck ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {a.status.toUpperCase()}
                    </span>
                    {a.feature_name && (
                      <span className="text-[10px] font-mono text-slate-500">[{a.feature_name}]</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 font-sans font-medium mt-1">{a.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Created: {a.created_at.replace('T', ' ').substring(0, 16)}
                  </span>
                </div>

                {/* Management Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                  {!isAck && (
                    <button
                      onClick={() => handleAcknowledge(a.id)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold rounded-lg border border-slate-800 text-[11px] transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(a.id)}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-lg border border-slate-800 text-[11px] transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                </div>
              </div>

              {/* Connected Decision Actions */}
              <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <button
                  onClick={() => navigate('/explain-prediction')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Lightbulb className="w-3 h-3 text-amber-400" /> View Contributing Factors (SHAP)
                </button>
                <button
                  onClick={() => navigate('/what-if')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <SlidersHorizontal className="w-3 h-3 text-cyan-400" /> Explore What-if
                </button>
                <button
                  onClick={() => navigate('/optimization')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <TrendingDown className="w-3 h-3 text-emerald-400" /> Find Lower-Emission Scenario
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonitoringAlerts;
