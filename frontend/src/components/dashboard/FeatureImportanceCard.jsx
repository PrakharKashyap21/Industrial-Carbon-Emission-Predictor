import React from 'react';
import { HelpCircle, Award } from 'lucide-react';

export const FeatureImportanceCard = ({ shapDrivers }) => {
  if (!shapDrivers || !shapDrivers.length) return null;

  const topDriver = shapDrivers[0];
  const maxShap = Math.max(...shapDrivers.map((d) => d.mean_abs_shap || 0), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <HelpCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
          What Drives Industrial CO₂ Emissions? (Global SHAP Drivers)
        </h3>
        <span className="text-[10px] font-mono text-slate-500">Explainable AI</span>
      </div>

      {/* Dynamic Summary Statement */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 flex items-start space-x-2">
        <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[11px] font-sans">
          <strong>Key Emission Driver:</strong>{' '}
          <strong className="text-emerald-950 font-bold">{topDriver.display_name}</strong> is currently the strongest model-attributed operational feature influencing predicted CO₂ emissions across historical readings.
        </p>
      </div>

      {/* Feature Ranking List */}
      <div className="space-y-2.5 pt-1">
        {shapDrivers.slice(0, 5).map((feat, idx) => {
          const barWidth = Math.min(100, Math.max(10, (feat.mean_abs_shap / maxShap) * 100));

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-sans font-medium text-slate-700">
                  #{idx + 1} {feat.display_name}
                </span>
                <span className="text-emerald-700 font-bold">
                  {feat.mean_abs_shap} <span className="text-[10px] text-slate-500 font-sans">kg CO₂ impact</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 flex items-center p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureImportanceCard;
