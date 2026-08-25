import React from 'react';
import { Cpu, Award, ShieldCheck, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

export const ModelInsights = () => {
  const models = [
    { name: 'Random Forest Regressor', version: 'rf_v1', r2: 0.9975, mae: 245.12, rmse: 325.40, weight: '45%' },
    { name: 'XGBoost Regressor', version: 'xgb_v1', r2: 0.9981, mae: 218.80, rmse: 298.60, weight: '55%' },
    { name: 'Validation Weighted Ensemble', version: 'ensemble_v1', r2: 0.9980, mae: 226.35, rmse: 307.94, weight: '100% (Selected)' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Phase 4 & Phase 5 ML Architecture Insights
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Machine Learning Model Registry & SHAP Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detailed evaluation metrics, chronological validation splits, model comparison, and game-theoretic SHAP explainability.
        </p>
      </div>

      {/* Model Performance Comparison Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
          <Award className="w-4 h-4 mr-1.5 text-cyan-400" />
          Production Model Performance Comparison Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Model Candidate</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3 text-right">R² Score</th>
                <th className="py-2.5 px-3 text-right">MAE (kg CO₂)</th>
                <th className="py-2.5 px-3 text-right">RMSE (kg CO₂)</th>
                <th className="py-2.5 px-3 text-center">Ensemble Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {models.map((m, idx) => (
                <tr key={idx} className={m.version === 'ensemble_v1' ? 'bg-cyan-950/20 font-bold' : ''}>
                  <td className="py-3 px-3 font-sans font-semibold text-slate-200">{m.name}</td>
                  <td className="py-3 px-3 text-slate-400">{m.version}</td>
                  <td className="py-3 px-3 text-right text-cyan-300">{m.r2}</td>
                  <td className="py-3 px-3 text-right text-slate-200">{m.mae}</td>
                  <td className="py-3 px-3 text-right text-slate-200">{m.rmse}</td>
                  <td className="py-3 px-3 text-center font-sans text-xs">
                    <span className={`px-2 py-0.5 rounded ${
                      m.version === 'ensemble_v1'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {m.weight}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset & Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-emerald-400" /> Chronological Train / Val / Test Split
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            To prevent temporal data leakage inherent in industrial time-series readings, data was split chronologically rather than randomly:
          </p>
          <ul className="text-xs space-y-2 text-slate-300 font-mono pt-1">
            <li className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span>Training Set (70%)</span>
              <strong className="text-cyan-400">87 Samples</strong>
            </li>
            <li className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span>Validation Set (15%)</span>
              <strong className="text-cyan-400">18 Samples</strong>
            </li>
            <li className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span>Test Set (15%)</span>
              <strong className="text-emerald-400">20 Samples</strong>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <HelpCircle className="w-4 h-4 mr-1.5 text-cyan-400" /> SHAP Explainable AI Foundation
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The system employs SHapley Additive exPlanations (SHAP) based on cooperative game theory to satisfy the additive check property:
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
            ŷ = φ₀ + Σ φᵢ
          </div>
          <p className="text-[11px] text-slate-500">
            Combined ensemble SHAP values are derived via weighted aggregation: <code className="text-slate-300">φ_ens = 0.45·φ_RF + 0.55·φ_XGB</code>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelInsights;
