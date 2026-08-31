import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, TrendingDown, ShieldCheck, Zap, Fuel, Clock, Lightbulb, SlidersHorizontal, ArrowRight, Cpu, Activity, ListChecks } from 'lucide-react';

export const OptimizationResult = ({ result }) => {
  const navigate = useNavigate();
  if (!result || !result.recommended_candidate) return null;

  const { baseline_prediction, recommended_candidate, candidates_generated, candidates_evaluated, candidates_rejected } = result;
  const {
    recommended_candidate_id,
    recommended_changes,
    recommended_inputs,
    predicted_co2,
    rf_prediction,
    xgb_prediction,
    estimated_reduction_kg,
    estimated_reduction_percentage,
    reliability_status,
    change_summary,
  } = recommended_candidate;

  return (
    <div className="bg-white border-2 border-cyan-500/30 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-[10px] font-bold border border-cyan-200 uppercase tracking-widest flex items-center">
              <Award className="w-3.5 h-3.5 mr-1" /> Best Model-Estimated Scenario
            </span>
            <span className="text-xs text-slate-500 font-mono">Run ID: {result.optimization_id || 'OPT-0001'}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Recommended Operating Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Decision-support recommendation generated via constrained grid search over RF + XGBoost Weighted Ensemble.</p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ✓ Within Operating Limits
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Reliability: {reliability_status || 'HIGH'}
          </span>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">Current CO₂ Emission</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {baseline_prediction ? Math.round(baseline_prediction).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Current plant operating baseline</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">Recommended CO₂ Emission</span>
          <div className="text-2xl font-extrabold text-cyan-700 font-mono">
            {predicted_co2 ? Math.round(predicted_co2).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            RF: {rf_prediction ? Math.round(rf_prediction).toLocaleString() : 0} | XGB: {xgb_prediction ? Math.round(xgb_prediction).toLocaleString() : 0}
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider block flex items-center text-emerald-800">
            <TrendingDown className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Model-Estimated CO₂ Reduction
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">
            -{estimated_reduction_kg ? Math.round(estimated_reduction_kg).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-600">kg (-{estimated_reduction_percentage}%)</span>
          </div>
          <span className="text-[10px] text-emerald-700 block">Estimated carbon emission saving</span>
        </div>
      </div>

      {/* Natural Language Change Summary */}
      {change_summary && change_summary.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <ListChecks className="w-4 h-4 mr-1.5 text-cyan-600" /> Executive Change Summary:
          </span>
          <ul className="space-y-1 text-xs text-slate-700 font-sans">
            {change_summary.map((item, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Operating Parameter Changes Grid */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Recommended Operational Adjustments:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-600 font-sans flex items-center"><Zap className="w-3 h-3 mr-1 text-cyan-600" /> Electricity</span>
            <span className="font-bold text-cyan-700 text-sm">{recommended_changes?.electricity_change || 0}%</span>
            <span className="text-[10px] text-slate-500 block">{recommended_inputs?.electricity_consumption_kwh?.toLocaleString()} kWh</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-600 font-sans flex items-center"><Fuel className="w-3 h-3 mr-1 text-amber-600" /> Fuel</span>
            <span className="font-bold text-amber-700 text-sm">{recommended_changes?.fuel_change || 0}%</span>
            <span className="text-[10px] text-slate-500 block">{recommended_inputs?.diesel_consumption_liters?.toLocaleString()} L</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-600 font-sans flex items-center"><Clock className="w-3 h-3 mr-1 text-emerald-600" /> Machine Runtime</span>
            <span className="font-bold text-emerald-700 text-sm">{recommended_changes?.runtime_change || 0}%</span>
            <span className="text-[10px] text-slate-500 block">{recommended_inputs?.machine_runtime_hours} hrs</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-600 font-sans flex items-center">Production</span>
            <span className="font-bold text-slate-900 text-sm">0% (Preserved)</span>
            <span className="text-[10px] text-slate-500 block">{recommended_inputs?.production_quantity?.toLocaleString()} units</span>
          </div>
        </div>
      </div>

      {/* Audit Search Summary */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
        <span>Candidates Generated: <strong className="text-slate-900">{candidates_generated}</strong></span>
        <span>Evaluated: <strong className="text-cyan-700">{candidates_evaluated}</strong></span>
        <span>Rejected: <strong className="text-rose-600">{candidates_rejected}</strong></span>
      </div>

      {/* Connected Action Triggers */}
      <div className="pt-4 border-t border-slate-200 space-y-2.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Connected Decision Actions for This Recommendation
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/explain-prediction', { state: { inputData: recommended_inputs, prediction: { ensemble_prediction_kg: predicted_co2 } } })}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Explain Recommendation (SHAP)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => navigate('/what-if', { state: { baselineInputs: recommended_inputs } })}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" /> Test in What-if</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => navigate('/prediction-test', { state: { prefillInputs: recommended_inputs } })}
            className="p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors shadow-sm"
          >
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Use Recommended Values</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-100" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationResult;
