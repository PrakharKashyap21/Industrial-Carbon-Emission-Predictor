import React, { useState } from 'react';
import { predictCO2Preview } from '../services/api';
import { Cpu, Zap, Flame, Wind, Package, Layers, Clock, Thermometer, Gauge, Activity, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const PredictionTest = () => {
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
  const [prediction, setPrediction] = useState(null);
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

    const res = await predictCO2Preview(formData);
    setLoading(false);

    if (res.success) {
      setPrediction(res.data);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl border border-cyan-200">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
            Real-Time AI Prediction Testing Interface
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Industrial CO₂ Prediction Testing Form
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Adjust operational parameters to test Random Forest, XGBoost, and Weighted Ensemble predictions in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-cyan-400" />
              Operational Parameters
            </h3>

            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Flame className="w-3.5 h-3.5 mr-1 text-amber-400" /> Diesel (Liters)
                </label>
                <input
                  type="number"
                  name="diesel_consumption_liters"
                  value={formData.diesel_consumption_liters}
                  onChange={handleChange}
                  step="any"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center mb-1">
                  <Clock className="w-3.5 h-3.5 mr-1 text-yellow-400" /> Runtime (Hours ≤ 24)
                </label>
                <input
                  type="number"
                  name="machine_runtime_hours"
                  value={formData.machine_runtime_hours}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="24"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
                  required
                />
              </div>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Executing ML Inference...' : 'Predict CO₂ Emission'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-base font-bold text-slate-200 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
            Prediction Results
          </h3>

          {error && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-2xl text-xs space-y-1">
              <div className="flex items-center font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> Prediction Error
              </div>
              <p>{error}</p>
            </div>
          )}

          {!prediction && !error && (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
              Fill out operational parameters and click <strong>Predict CO₂ Emission</strong> to trigger inference.
            </div>
          )}

          {prediction && (
            <div className="space-y-4">
              {/* Winner Selected Ensemble Card */}
              <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Selected Winner Model
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-900/80 text-cyan-300 border border-cyan-700">
                    {prediction.model_version}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <span className="text-xs text-slate-400 block font-medium">Weighted Ensemble Prediction</span>
                  <div className="text-3xl font-black text-cyan-300 font-mono">
                    {prediction.ensemble_prediction_kg.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg CO₂</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  Weights: {(prediction.rf_weight_used * 100).toFixed(0)}% RF + {((1 - prediction.rf_weight_used) * 100).toFixed(0)}% XGBoost
                </div>
              </div>

              {/* Individual Model Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 block font-medium mb-1">Random Forest</span>
                  <span className="text-lg font-bold text-slate-200 font-mono">
                    {prediction.random_forest_prediction_kg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 block font-medium mb-1">XGBoost</span>
                  <span className="text-lg font-bold text-slate-200 font-mono">
                    {prediction.xgboost_prediction_kg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionTest;
