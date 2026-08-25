import React from 'react';
import { Activity } from 'lucide-react';

export const EmissionTrendChart = ({ trends }) => {
  if (!trends || !trends.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center text-slate-500 text-xs">
        No historical emission data available for the selected period.
      </div>
    );
  }

  // Calculate max CO2 for SVG bar scaling
  const maxCo2 = Math.max(...trends.map((t) => Math.max(t.actual_co2_kg, t.moving_avg_7d_co2_kg || 0)), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <Activity className="w-4 h-4 mr-1.5 text-cyan-600" />
          CO₂ Emission Trend & 7-Day Moving Average
        </h3>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block mr-1"></span> Actual Emission (kg)
          </span>
          <span className="flex items-center text-slate-600">
            <span className="w-2.5 h-0.5 bg-emerald-600 inline-block mr-1"></span> 7d Moving Avg
          </span>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="space-y-3 pt-2 overflow-hidden">
        <div className="overflow-x-auto pb-2">
          <div className="h-56 min-w-[500px] sm:min-w-full flex items-end justify-between space-x-1 sm:space-x-1.5 pt-12 pb-2 border-b border-slate-200 relative overflow-visible">
            {trends.slice(-30).map((pt, idx) => {
              const actHeight = Math.min(100, Math.max(10, (pt.actual_co2_kg / maxCo2) * 100));
              const maHeight = pt.moving_avg_7d_co2_kg ? Math.min(100, (pt.moving_avg_7d_co2_kg / maxCo2) * 100) : 0;

              const isLeft = idx < 4;
              const isRight = idx > trends.slice(-30).length - 5;
              const tooltipPosClass = isLeft ? 'left-0' : isRight ? 'right-0' : 'left-1/2 -translate-x-1/2';

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end min-w-[10px]">
                  {/* Non-overlapping High Contrast Tooltip */}
                  <div className={`absolute top-0 ${tooltipPosClass} hidden group-hover:block z-50 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl border border-slate-700 shadow-2xl whitespace-nowrap font-mono pointer-events-none`}>
                    <span className="font-sans font-bold text-cyan-300 block border-b border-slate-700 pb-1 mb-1">{pt.timestamp}</span>
                    Actual CO₂: <strong className="text-cyan-400 font-bold">{pt.actual_co2_kg.toLocaleString()} kg</strong><br />
                    7d Moving Avg: <strong className="text-emerald-400 font-bold">{pt.moving_avg_7d_co2_kg?.toLocaleString()} kg</strong>
                  </div>

                  {/* Moving Avg Indicator Dot */}
                  <div
                    className="w-2 h-2 rounded-full bg-emerald-500 z-10 -mb-1 shadow-sm ring-2 ring-white"
                    style={{ marginBottom: `${maHeight}%` }}
                  />

                  {/* Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t group-hover:from-cyan-600 group-hover:to-cyan-400 transition-all shadow-xs"
                    style={{ height: `${actHeight}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>{trends[0]?.timestamp}</span>
          <span>{trends[Math.floor(trends.length / 2)]?.timestamp}</span>
          <span>{trends[trends.length - 1]?.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

export default EmissionTrendChart;
