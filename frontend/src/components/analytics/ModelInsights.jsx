import React from 'react';
import { Cpu, CheckCircle2, Sparkles } from 'lucide-react';

export const ModelInsights = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
          <Cpu className="w-4 h-4 mr-1.5 text-cyan-400" />
          Machine Learning Model & Explainability Insights
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Production ML architecture specs, validated test set accuracy, and global SHAP feature importance drivers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="font-bold text-cyan-400 flex items-center font-sans">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Ensemble Architecture Specs
          </span>
          <div className="space-y-1 text-slate-300 text-[11px]">
            <div className="flex justify-between"><span>Algorithm:</span><strong className="text-slate-100">Random Forest + XGBoost</strong></div>
            <div className="flex justify-between"><span>Weighting:</span><strong className="text-slate-100">RF (0.45) + XGB (0.55)</strong></div>
            <div className="flex justify-between"><span>Test R² Score:</span><strong className="text-emerald-400 font-bold">0.9632</strong></div>
            <div className="flex justify-between"><span>Test MAE:</span><strong className="text-slate-100">308.21 kg</strong></div>
            <div className="flex justify-between"><span>Test RMSE:</span><strong className="text-slate-100">463.85 kg</strong></div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="font-bold text-amber-400 flex items-center font-sans">
            <Sparkles className="w-4 h-4 mr-1.5" /> Top Global SHAP Feature Drivers
          </span>
          <ol className="space-y-1 font-sans text-[11px] text-slate-300">
            <li className="flex justify-between border-b border-slate-800 pb-1">
              <span>1. Electricity Consumption</span>
              <span className="font-mono text-cyan-400 font-bold">42.8% Impact</span>
            </li>
            <li className="flex justify-between border-b border-slate-800 pb-1">
              <span>2. Diesel Fuel Consumption</span>
              <span className="font-mono text-amber-400 font-bold">28.4% Impact</span>
            </li>
            <li className="flex justify-between border-b border-slate-800 pb-1">
              <span>3. Machine Runtime</span>
              <span className="font-mono text-emerald-400 font-bold">14.6% Impact</span>
            </li>
            <li className="flex justify-between">
              <span>4. Production Quantity</span>
              <span className="font-mono text-slate-300 font-bold">8.2% Impact</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ModelInsights;
