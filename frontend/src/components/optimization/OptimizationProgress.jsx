import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const OptimizationProgress = ({ loading }) => {
  if (!loading) return null;

  const steps = [
    { label: 'Generating candidate combinations (grid search)', done: true },
    { label: 'Evaluating operational hard feasibility constraints', done: true },
    { label: 'Running ML Ensemble predictions (RF + XGBoost)', done: true },
    { label: 'Evaluating prediction reliability & training distribution', done: true },
    { label: 'Ranking candidates & generating decision recommendation', done: false },
  ];

  return (
    <div className="bg-slate-900/90 border border-cyan-800/80 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center space-x-3">
        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        <h3 className="text-sm font-bold text-slate-100">Constrained Optimization Search in Progress...</h3>
      </div>
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center space-x-2 text-xs font-mono">
            {step.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            )}
            <span className={step.done ? 'text-slate-300' : 'text-cyan-300 font-bold'}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptimizationProgress;
