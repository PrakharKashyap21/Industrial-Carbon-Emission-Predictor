import React from 'react';
import { Eye, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const ReportPreview = ({ previewData, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2 animate-pulse">
        <Eye className="w-8 h-8 mx-auto text-cyan-400 animate-spin" />
        <p className="text-xs font-semibold">Generating report preview data payload...</p>
      </div>
    );
  }

  if (!previewData) return null;

  const kpis = previewData.kpis || {};
  const insights = previewData.insights || [];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <Eye className="w-4 h-4 mr-1.5 text-cyan-400" />
            3. Report Content Data Preview
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Review live metrics, insights, and layout structure before rendering PDF, Excel, or CSV document.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
          Preview Mode
        </span>
      </div>

      {/* Header Info */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <h4 className="text-sm font-extrabold text-white">{previewData.title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-300">
          <div><span className="text-slate-500 font-sans">Plant:</span> {previewData.plant_name}</div>
          <div><span className="text-slate-500 font-sans">Type:</span> {previewData.report_type}</div>
          <div><span className="text-slate-500 font-sans">Start:</span> {previewData.period_start}</div>
          <div><span className="text-slate-500 font-sans">End:</span> {previewData.period_end}</div>
        </div>
      </div>

      {/* Key Metric Preview Cards */}
      {kpis.total_co2_kg !== undefined && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold font-sans uppercase block">Total CO₂</span>
            <span className="text-lg font-extrabold text-cyan-400">{kpis.total_co2_kg?.toLocaleString()} kg</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold font-sans uppercase block">Production</span>
            <span className="text-lg font-extrabold text-emerald-400">{kpis.total_production_units?.toLocaleString()} Units</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold font-sans uppercase block">Emission Intensity</span>
            <span className="text-lg font-extrabold text-amber-400">{previewData.emission_intensity || 1.53} kg/Unit</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold font-sans uppercase block">Anomalies Detected</span>
            <span className="text-lg font-extrabold text-rose-400">{previewData.anomalies_count || 0} Events</span>
          </div>
        </div>
      )}

      {/* Executive Narrative */}
      {previewData.executive_summary && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Executive Narrative Summary
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{previewData.executive_summary}</p>
        </div>
      )}

      {/* Insights List Preview */}
      {insights.length > 0 && (
        <div className="space-y-2 text-xs font-sans">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Key Industrial Findings:</span>
          <div className="space-y-2">
            {insights.map((ins, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">{ins.title}: </span>
                  <span className="text-slate-400">{ins.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer Box */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-500 italic leading-relaxed">
        {previewData.disclaimer}
      </div>
    </div>
  );
};

export default ReportPreview;
