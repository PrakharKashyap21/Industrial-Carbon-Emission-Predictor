import React, { useState } from 'react';
import { getPredictionExplanation } from '../services/api';
import { HelpCircle, Zap, Flame, Wind, Package, Layers, Clock, Thermometer, Gauge, Activity, Sparkles, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, ArrowRight, Info, ShieldCheck, Scale } from 'lucide-react';

export const PredictionExplanation = () => {
  const [formData, setFormData] = useState({
    plant_id: 1,
    electricity_consumption_kwh: 14500,
    diesel_consumption_liters: 650,
    natural_gas_consumption_m3: 2800,
    production_quantity: 2400,
    raw_material_consumption_kg: 5600,
    machine_runtime_hours: 19.5,
    temperature_c: 28.5,
    pressure_bar: 7.4,
    previous_co2_emission_kg: 6800,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await getPredictionExplanation(formData);
    setLoading(false);

    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.error);
    }
  };

  // Compute max absolute SHAP value for horizontal bar scaling
  const maxAbsShap = result
    ? Math.max(...result.contributors.map((c) => Math.abs(c.shap_value)), 1)
    : 1;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Phase 5 Explainable AI Layer (SHAP)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          "Why Did the Model Predict This Amount of CO₂?"
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          SHapley Additive exPlanations (SHAP) mathematically decompose predicted emissions into feature-level contributions relative to baseline expected values.
        </p>

        <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start space-x-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Note on Interpretation:</strong> SHAP explains internal model prediction logic (<code className="text-cyan-300 font-mono">Prediction ≈ Base Value + ∑ SHAP</code>). It does not establish direct physical causality or guarantee intervention outcomes.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-emerald-400" />
            Operational Parameters
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Zap className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Electricity (kWh)
                </label>
                <input
                  type="number"
                  name="electricity_consumption_kwh"
                  value={formData.electricity_consumption_kwh}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Flame className="w-3.5 h-3.5 mr-1 text-amber-400" /> Diesel Fuel (Liters)
                </label>
                <input
                  type="number"
                  name="diesel_consumption_liters"
                  value={formData.diesel_consumption_liters}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Wind className="w-3.5 h-3.5 mr-1 text-blue-400" /> Natural Gas (m³)
                </label>
                <input
                  type="number"
                  name="natural_gas_consumption_m3"
                  value={formData.natural_gas_consumption_m3}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Package className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Production Quantity
                </label>
                <input
                  type="number"
                  name="production_quantity"
                  value={formData.production_quantity}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Layers className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Raw Material (kg)
                </label>
                <input
                  type="number"
                  name="raw_material_consumption_kg"
                  value={formData.raw_material_consumption_kg}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Clock className="w-3.5 h-3.5 mr-1 text-yellow-400" /> Machine Runtime (Hours ≤ 24)
                </label>
                <input
                  type="number"
                  name="machine_runtime_hours"
                  value={formData.machine_runtime_hours}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="24"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Thermometer className="w-3.5 h-3.5 mr-1 text-rose-400" /> Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature_c"
                  value={formData.temperature_c}
                  onChange={handleChange}
                  step="any"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Gauge className="w-3.5 h-3.5 mr-1 text-purple-400" /> Pressure (bar)
                </label>
                <input
                  type="number"
                  name="pressure_bar"
                  value={formData.pressure_bar}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  Prior Day Baseline CO₂ (kg)
                </label>
                <input
                  type="number"
                  name="previous_co2_emission_kg"
                  value={formData.previous_co2_emission_kg}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Computing SHAP Explanation...' : 'Generate SHAP Explanation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* SHAP Explanation Output Column */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-2xl text-xs space-y-1">
              <div className="flex items-center font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> SHAP Calculation Error
              </div>
              <p>{error}</p>
            </div>
          )}

          {!result && !error && (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              Provide industrial operational parameters and click <strong>Generate SHAP Explanation</strong> to compute additive feature contributions.
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Prediction & Base Value Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                    <Sparkles className="w-4 h-4 mr-1.5" /> Model Prediction Breakdown
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {result.model.version}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Additive Check: {result.explanation.additive_check ? 'PASS ✓' : 'FAIL ✗'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-slate-800/80 py-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Model Baseline (Expected Value)</span>
                    <span className="text-lg font-bold text-slate-300 font-mono">
                      {result.explanation.base_value_kg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg CO₂</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Total SHAP Contributions</span>
                    <span className={`text-lg font-bold font-mono ${
                      result.prediction.co2_kg - result.explanation.base_value_kg >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {result.prediction.co2_kg - result.explanation.base_value_kg >= 0 ? '+' : ''}
                      {(result.prediction.co2_kg - result.explanation.base_value_kg).toFixed(2).toLocaleString()} <span className="text-xs font-normal text-slate-500">kg CO₂</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Final Predicted Emission</span>
                    <span className="text-2xl font-black text-cyan-300 font-mono">
                      {result.prediction.co2_kg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
                    </span>
                  </div>
                </div>

                {/* Natural Text Explanation */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {result.explanation.summary_text}
                </div>
              </div>

              {/* Top Contributors Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Top Positive */}
                <div className="bg-emerald-950/20 border border-emerald-800/60 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1.5" /> Top Factors Increasing Emissions
                  </span>
                  <div className="space-y-2">
                    {result.top_positive.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-200 truncate pr-2">{item.display_name}</span>
                        <span className="text-emerald-400 font-bold shrink-0">+{item.shap_value} kg CO₂</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Negative */}
                <div className="bg-amber-950/20 border border-amber-800/60 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-amber-400 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-1.5" /> Top Factors Decreasing Emissions
                  </span>
                  <div className="space-y-2">
                    {result.top_negative.length > 0 ? (
                      result.top_negative.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-200 truncate pr-2">{item.display_name}</span>
                          <span className="text-amber-400 font-bold shrink-0">{item.shap_value} kg CO₂</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic p-2">No negative feature contributions detected for this prediction observation.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Horizontal SHAP Bar Chart */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <Scale className="w-4 h-4 mr-1.5 text-cyan-400" /> Feature Contributions Waterfall Breakdown (SHAP Impact in kg CO₂)
                </h4>

                <div className="space-y-3 pt-2">
                  {result.contributors.slice(0, 10).map((item, idx) => {
                    const widthPct = Math.min(100, Math.max(8, (Math.abs(item.shap_value) / maxAbsShap) * 100));
                    const isPositive = item.shap_value >= 0;

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{item.display_name}</span>
                          <span className="font-mono text-slate-400">
                            Input: <strong className="text-slate-200">{item.input_value} {item.unit}</strong> | SHAP Impact: <strong className={isPositive ? 'text-emerald-400' : 'text-amber-400'}>
                              {isPositive ? '+' : ''}{item.shap_value} kg CO₂
                            </strong>
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 flex items-center">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isPositive ? 'bg-gradient-to-r from-emerald-600 to-teal-400' : 'bg-gradient-to-r from-amber-600 to-rose-400'
                            }`}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Feature Contribution Table */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 overflow-x-auto">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Complete Feature Attribution Matrix
                </h4>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Feature</th>
                      <th className="py-2.5 px-3 text-right">Input Value</th>
                      <th className="py-2.5 px-3 text-right">SHAP Impact</th>
                      <th className="py-2.5 px-3 text-center">Effect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {result.contributors.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-medium text-slate-200">{item.display_name}</div>
                          <div className="text-[10px] text-slate-500">{item.description}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300 font-bold">
                          {item.input_value} <span className="text-[10px] font-normal text-slate-500">{item.unit}</span>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${
                          item.shap_value >= 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {item.shap_value >= 0 ? '+' : ''}{item.shap_value} kg CO₂
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                            item.direction === 'positive'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : item.direction === 'negative'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {item.direction === 'positive' ? 'Increases CO₂' : item.direction === 'negative' ? 'Decreases CO₂' : 'Neutral'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionExplanation;
