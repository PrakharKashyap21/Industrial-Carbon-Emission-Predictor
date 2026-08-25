import React from 'react';
import { TrendingDown, TrendingUp, Minus, ShieldCheck, Scale } from 'lucide-react';

export const ScenarioResultCard = ({ result }) => {
  if (!result) return null;

  const { baseline, scenario, comparison, model } = result;
  const isReduction = comparison.direction === 'reduction';
  const isIncrease = comparison.direction === 'increase';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center">
          <Scale className="w-4 h-4 mr-1.5" /> What-if Scenario Comparison Output
        </span>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
          Model: {model.version}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Baseline Prediction */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Baseline CO₂ Emission</span>
          <span className="text-xl font-extrabold text-slate-200 font-mono">
            {baseline.prediction_kg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </span>
          {baseline.co2_intensity && (
            <span className="text-[10px] text-slate-500 block font-mono mt-1">
              Intensity: {baseline.co2_intensity} kg/Unit
            </span>
          )}
        </div>

        {/* Scenario Prediction */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Scenario CO₂ Emission</span>
          <span className="text-xl font-extrabold text-cyan-300 font-mono">
            {scenario.prediction_kg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </span>
          {scenario.co2_intensity && (
            <span className="text-[10px] text-slate-500 block font-mono mt-1">
              Intensity: {scenario.co2_intensity} kg/Unit
            </span>
          )}
        </div>

        {/* Absolute Difference */}
        <div className={`p-4 rounded-xl border ${
          isReduction
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : isIncrease
            ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <span className="text-[11px] text-slate-400 block font-medium">Predicted CO₂ Change</span>
          <span className="text-xl font-extrabold font-mono flex items-center">
            {isReduction && <TrendingDown className="w-5 h-5 mr-1 text-emerald-400" />}
            {isIncrease && <TrendingUp className="w-5 h-5 mr-1 text-rose-400" />}
            {!isReduction && !isIncrease && <Minus className="w-5 h-5 mr-1 text-slate-400" />}
            {comparison.difference_kg > 0 ? '+' : ''}{comparison.difference_kg.toLocaleString()} <span className="text-xs font-normal opacity-75 ml-1">kg</span>
          </span>
          <span className="text-[10px] opacity-80 block font-mono mt-1">
            {isReduction ? `Reduction: ${comparison.reduction_kg.toLocaleString()} kg` : comparison.direction.toUpperCase()}
          </span>
        </div>

        {/* Percentage Change */}
        <div className={`p-4 rounded-xl border ${
          isReduction
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : isIncrease
            ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <span className="text-[11px] text-slate-400 block font-medium">Percentage Impact</span>
          <span className="text-xl font-extrabold font-mono">
            {comparison.percentage_change !== null
              ? `${comparison.percentage_change > 0 ? '+' : ''}${comparison.percentage_change}%`
              : 'N/A'}
          </span>
          <span className="text-[10px] opacity-80 block font-mono mt-1">
            {isReduction ? 'Predicted Reduction' : isIncrease ? 'Predicted Increase' : 'No Significant Change'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScenarioResultCard;
