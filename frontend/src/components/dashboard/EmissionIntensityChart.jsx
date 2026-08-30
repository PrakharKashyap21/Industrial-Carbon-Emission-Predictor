import React, { useState } from 'react';
import { Scale, Info } from 'lucide-react';

export const EmissionIntensityChart = ({ trends }) => {
  const [activePointIndex, setActivePointIndex] = useState(null);

  if (!trends || !trends.length) return null;

  const validIntensities = trends.map((t) => t.co2_intensity).filter((v) => v !== null && v !== undefined);
  const maxVal = validIntensities.length ? Math.max(...validIntensities, 1) : 1;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <Scale className="w-4 h-4 mr-1.5 text-emerald-600" />
          CO₂ Emission Intensity Trend (kg CO₂ / Unit)
        </h3>
        <span className="text-[10px] font-mono text-slate-500">Carbon Efficiency Metric</span>
      </div>

      <div className="space-y-3 pt-2 overflow-hidden">
        <div className="overflow-x-auto pb-2">
          <div className="h-56 min-w-[500px] sm:min-w-full flex items-end justify-between space-x-1 sm:space-x-1.5 pt-12 pb-2 border-b border-slate-200 relative overflow-visible">
            {trends.slice(-30).map((pt, idx) => {
              const val = pt.co2_intensity;
              const height = val !== null ? Math.min(100, Math.max(10, (val / maxVal) * 100)) : 0;

              const isLeft = idx < 4;
              const isRight = idx > trends.slice(-30).length - 5;
              const tooltipPosClass = isLeft ? 'left-0' : isRight ? 'right-0' : 'left-1/2 -translate-x-1/2';
              const isActive = activePointIndex === idx;

              return (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActivePointIndex(isActive ? null : idx)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActivePointIndex(isActive ? null : idx)}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end min-w-[10px] cursor-pointer touch-manipulation"
                >
                  {/* Tooltip */}
                  <div
                    className={`absolute top-0 ${tooltipPosClass} ${
                      isActive ? 'block' : 'hidden group-hover:block'
                    } z-50 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl border border-slate-700 shadow-2xl whitespace-nowrap font-mono pointer-events-none`}
                  >
                    <span className="font-sans font-bold text-emerald-300 block border-b border-slate-700 pb-1 mb-1">{pt.timestamp}</span>
                    Intensity: <strong className="text-emerald-400 font-bold">{val !== null ? `${val} kg/unit` : 'N/A'}</strong><br />
                    Production: {pt.production_quantity.toLocaleString()} units
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full bg-gradient-to-t ${
                      isActive
                        ? 'from-emerald-500 to-emerald-300 ring-2 ring-emerald-400'
                        : 'from-emerald-700 to-emerald-500 group-hover:from-emerald-600 group-hover:to-emerald-400'
                    } rounded-t transition-all shadow-xs`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Descriptive Interpretation Box */}
        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-start space-x-2 text-xs text-emerald-900">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-emerald-950">Operational Efficiency Insight:</strong> CO₂ Intensity measures emissions per unit of finished production output. A declining trend indicates improved eco-efficiency even during periods of expanding production volume.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmissionIntensityChart;
