import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, ShieldCheck, BookmarkPlus, Copy, RotateCcw, Lightbulb, SlidersHorizontal, ArrowRight, Cpu, Activity } from 'lucide-react';

export const ScenarioResult = ({ scenario, onSave, onDuplicate, onReset }) => {
  const navigate = useNavigate();
  if (!scenario) return null;

  const {
    scenario_name,
    baseline_prediction,
    rf_prediction,
    xgb_prediction,
    ensemble_prediction,
    co2_change,
    co2_change_percentage,
    interpretation,
    reliability_status,
    reliability_reasons,
    feasible,
    violations,
    scenario_inputs,
    baseline_inputs,
  } = scenario;

  const isReduction = co2_change < 0;

  // Parameter impact analysis calculation
  const getParameterDeltas = () => {
    if (!baseline_inputs || !scenario_inputs) return [];
    const keys = [
      { key: 'electricity_consumption_kwh', label: 'Electricity Consumption', unit: 'kWh' },
      { key: 'diesel_consumption_liters', label: 'Diesel Fuel', unit: 'L' },
      { key: 'natural_gas_consumption_m3', label: 'Natural Gas', unit: 'm³' },
      { key: 'production_quantity', label: 'Production Output', unit: 'units' },
      { key: 'machine_runtime_hours', label: 'Machine Runtime', unit: 'hrs' },
    ];
    return keys.map(({ key, label, unit }) => {
      const baseVal = baseline_inputs[key] || 0;
      const scenVal = scenario_inputs[key] || 0;
      const diff = scenVal - baseVal;
      const pct = baseVal > 0 ? ((diff / baseVal) * 100).toFixed(1) : 0;
      return { label, baseVal, scenVal, diff: diff.toFixed(1), pct, unit };
    }).filter((item) => Math.abs(item.diff) > 0.01);
  };

  const paramDeltas = getParameterDeltas();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-100">{scenario_name}</h3>
            {feasible ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Feasible
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-800 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" /> Infeasible (Outside Operating Range)
              </span>
            )}

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center ${
              reliability_status === 'HIGH'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              <ShieldCheck className="w-3 h-3 mr-1" /> Reliability: {reliability_status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Simulation calculation output using Random Forest + XGBoost Ensemble Model.</p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {onReset && (
            <button
              onClick={() => onReset(scenario)}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 transition-colors text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              title="Reset scenario inputs to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" /> <span>Reset</span>
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(scenario)}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              title="Duplicate scenario for side-by-side variation"
            >
              <Copy className="w-3.5 h-3.5" /> <span>Duplicate</span>
            </button>
          )}

          {onSave && (
            <button
              onClick={() => onSave(scenario)}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded-xl border border-cyan-800 transition-colors text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" /> <span>Save Scenario</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Impact Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Baseline vs Scenario Ensemble */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Baseline CO₂ Emission</span>
          <div className="text-xl font-extrabold text-slate-200 font-mono">
            {baseline_prediction ? Math.round(baseline_prediction).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Current plant operating baseline</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Simulated Scenario Emission</span>
          <div className="text-xl font-extrabold text-cyan-400 font-mono">
            {ensemble_prediction ? Math.round(ensemble_prediction).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            RF: {rf_prediction ? Math.round(rf_prediction).toLocaleString() : 0} | XGB: {xgb_prediction ? Math.round(xgb_prediction).toLocaleString() : 0}
          </div>
        </div>

        {/* CO2 Impact Delta */}
        <div className={`p-4 rounded-xl border space-y-1 ${
          isReduction
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider block flex items-center">
            {isReduction ? <TrendingDown className="w-3.5 h-3.5 mr-1" /> : <TrendingUp className="w-3.5 h-3.5 mr-1" />}
            CO₂ Impact ({interpretation})
          </span>
          <div className="text-xl font-extrabold font-mono">
            {co2_change > 0 ? `+${co2_change}` : co2_change} <span className="text-xs font-normal">kg ({co2_change_percentage > 0 ? `+${co2_change_percentage}` : co2_change_percentage}%)</span>
          </div>
          <span className="text-[10px] opacity-80 block">
            {isReduction ? 'Estimated emission reduction' : 'Estimated emission increase'}
          </span>
        </div>
      </div>

      {/* Parameter Impact Analysis */}
      {paramDeltas.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Parameter Input Changes & Predicted Emission Impact:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
            {paramDeltas.map((p, idx) => (
              <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">{p.label}</span>
                  <span className="text-slate-200 font-bold">{p.scenVal} {p.unit}</span>
                </div>
                <span className={`text-xs font-bold ${p.diff < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {p.diff > 0 ? `+${p.diff}` : p.diff} ({p.pct > 0 ? `+${p.pct}` : p.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feasibility Violations Alert */}
      {!feasible && violations && violations.length > 0 && (
        <div className="bg-rose-950/50 border border-rose-800 rounded-xl p-4 space-y-2 text-xs text-rose-200">
          <span className="font-bold flex items-center text-rose-300">
            <AlertTriangle className="w-4 h-4 mr-1.5" /> Operational Feasibility Violations (OUTSIDE OPERATING RANGE):
          </span>
          <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
            {violations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Reliability Warnings */}
      {reliability_reasons && reliability_reasons.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-300 block">Reliability Assessment Notes:</span>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {reliability_reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Connected Action Workflow Triggers */}
      <div className="pt-4 border-t border-slate-800 space-y-2.5">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Connected Decision Actions for This Scenario
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/explain-prediction', { state: { inputData: scenario_inputs, prediction: { ensemble_prediction_kg: ensemble_prediction } } })}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Understand Scenario (SHAP)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => navigate('/optimization', { state: { currentInputs: scenario_inputs } })}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Optimize This Scenario</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => navigate('/prediction-test', { state: { prefillInputs: scenario_inputs } })}
            className="p-2.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> Apply as Prediction Input</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioResult;
