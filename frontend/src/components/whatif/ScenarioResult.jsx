import React from 'react';
import { Award, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, ShieldCheck, BookmarkPlus } from 'lucide-react';

export const ScenarioResult = ({ scenario, onSave }) => {
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
  } = scenario;

  const isReduction = co2_change < 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-100">{scenario_name}</h3>
            {feasible ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Feasible
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-800 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" /> Infeasible
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
          <p className="text-xs text-slate-400 mt-1">Simulation calculation output against baseline operating reading.</p>
        </div>

        {onSave && (
          <button
            onClick={() => onSave(scenario)}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-300 rounded-xl border border-slate-800 transition-colors text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <BookmarkPlus className="w-3.5 h-3.5" /> <span>Save Scenario</span>
          </button>
        )}
      </div>

      {/* Main Impact Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Baseline vs Scenario Ensemble */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Baseline CO₂ Emission</span>
          <div className="text-xl font-extrabold text-slate-200 font-mono">
            {baseline_prediction ? baseline_prediction.toLocaleString() : '0'} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Current operating reading baseline</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Simulated Scenario Emission</span>
          <div className="text-xl font-extrabold text-cyan-400 font-mono">
            {ensemble_prediction ? ensemble_prediction.toLocaleString() : '0'} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            RF: {rf_prediction ? Math.round(rf_prediction) : 0} | XGB: {xgb_prediction ? Math.round(xgb_prediction) : 0}
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

      {/* Feasibility Violations Alert */}
      {!feasible && violations && violations.length > 0 && (
        <div className="bg-rose-950/50 border border-rose-800 rounded-xl p-4 space-y-2 text-xs text-rose-200">
          <span className="font-bold flex items-center text-rose-300">
            <AlertTriangle className="w-4 h-4 mr-1.5" /> Operational Feasibility Violations:
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

      {/* Modded Inputs Breakdown */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 block">Simulated Operating Inputs Breakdown:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-sans">Electricity</span>
            <span className="font-bold text-slate-200">{scenario_inputs?.electricity_consumption_kwh?.toLocaleString()} kWh</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-sans">Diesel Fuel</span>
            <span className="font-bold text-slate-200">{scenario_inputs?.diesel_consumption_liters?.toLocaleString()} L</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-sans">Natural Gas</span>
            <span className="font-bold text-slate-200">{scenario_inputs?.natural_gas_consumption_m3?.toLocaleString()} m³</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-sans">Machine Runtime</span>
            <span className="font-bold text-slate-200">{scenario_inputs?.machine_runtime_hours} hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioResult;
