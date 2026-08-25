import React from 'react';
import { Cpu, ShieldCheck, Check } from 'lucide-react';

export const ModelPerformanceCard = ({ model }) => {
  if (!model) return null;

  const metrics = model.test_metrics || {};

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <Cpu className="w-4 h-4 mr-1.5 text-cyan-600" />
          AI Model Accuracy & Performance
        </h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
          {model.version}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-sm font-bold text-slate-900 block">{model.name}</span>
          <span className="text-xs text-slate-500 font-mono block mt-0.5">
            Weights: {model.weights}
          </span>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-600 block font-semibold">R² Accuracy</span>
            <span className="text-base font-extrabold text-cyan-700 font-mono">{metrics.r2}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-600 block font-semibold">MAE (kg)</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">{metrics.mae}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-600 block font-semibold">RMSE (kg)</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">{metrics.rmse}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-600 block font-semibold">Error (%)</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">{metrics.mape}%</span>
          </div>
        </div>

        {/* Interpretation */}
        <div className="text-[11px] text-slate-700 bg-cyan-50/50 p-3 rounded-xl border border-cyan-200 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-900">Validation Summary:</strong> The model explains approximately{' '}
            <strong className="text-cyan-800 font-bold">{metrics.r2 * 100}%</strong> of emission variance with a average error of <strong className="text-cyan-800 font-bold">{metrics.mae} kg CO₂</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceCard;
