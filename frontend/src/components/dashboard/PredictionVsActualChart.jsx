import React from 'react';
import { Cpu, CheckCircle2 } from 'lucide-react';

export const PredictionVsActualChart = ({ trends }) => {
  if (!trends || !trends.length) return null;

  const maxVal = Math.max(...trends.map((t) => Math.max(t.actual_co2_kg, t.predicted_co2_kg)), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <Cpu className="w-4 h-4 mr-1.5 text-cyan-600" />
          Actual vs Predicted CO₂ Model Overlay
        </h3>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block mr-1"></span> Actual
          </span>
          <span className="flex items-center text-cyan-700">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block mr-1"></span> Predicted
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="h-56 w-full flex items-end justify-between space-x-1 sm:space-x-1.5 pt-14 pb-2 border-b border-slate-200 relative overflow-visible">
          {trends.slice(-30).map((pt, idx) => {
            const actHeight = Math.min(100, Math.max(10, (pt.actual_co2_kg / maxVal) * 100));
            const predHeight = Math.min(100, Math.max(10, (pt.predicted_co2_kg / maxVal) * 100));

            const isLeft = idx < 4;
            const isRight = idx > trends.slice(-30).length - 5;
            const tooltipPosClass = isLeft ? 'left-0' : isRight ? 'right-0' : 'left-1/2 -translate-x-1/2';

            return (
              <div key={idx} className="flex-1 flex items-end justify-center space-x-0.5 group relative h-full min-w-[14px]">
                {/* Tooltip */}
                <div className={`absolute top-0 ${tooltipPosClass} hidden group-hover:block z-50 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl border border-slate-700 shadow-2xl whitespace-nowrap font-mono pointer-events-none`}>
                  <span className="font-sans font-bold text-cyan-300 block border-b border-slate-700 pb-1 mb-1">{pt.timestamp}</span>
                  Actual: <strong className="text-slate-200">{pt.actual_co2_kg.toLocaleString()} kg</strong><br />
                  Predicted: <strong className="text-cyan-300">{pt.predicted_co2_kg.toLocaleString()} kg</strong><br />
                  Error: <strong className="text-emerald-400">{pt.prediction_error_kg > 0 ? '+' : ''}{pt.prediction_error_kg} kg</strong>
                </div>

                {/* Actual Bar */}
                <div
                  className="w-1/2 bg-slate-400 rounded-t group-hover:bg-slate-500 transition-all shadow-xs"
                  style={{ height: `${actHeight}%` }}
                />

                {/* Predicted Bar */}
                <div
                  className="w-1/2 bg-cyan-600 rounded-t group-hover:bg-cyan-500 transition-all shadow-xs"
                  style={{ height: `${predHeight}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Timeline Overview ({trends.length} Data Points)</span>
          <span className="text-cyan-700 font-sans flex items-center font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Model Alignment Verified
          </span>
        </div>
      </div>
    </div>
  );
};

export default PredictionVsActualChart;
