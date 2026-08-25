import React from 'react';
import { Zap, Flame, Wind, Package, Layers, Clock, Thermometer, Gauge, Activity, RefreshCw } from 'lucide-react';

export const ScenarioInputPanel = ({ baseline, scenario, setScenario, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setScenario((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const fields = [
    { name: 'electricity_consumption_kwh', label: 'Electricity Consumption', unit: 'kWh', icon: Zap, color: 'text-cyan-400' },
    { name: 'diesel_consumption_liters', label: 'Diesel Fuel Consumption', unit: 'Liters', icon: Flame, color: 'text-amber-400' },
    { name: 'natural_gas_consumption_m3', label: 'Natural Gas Consumption', unit: 'm³', icon: Wind, color: 'text-blue-400' },
    { name: 'production_quantity', label: 'Production Output', unit: 'Units', icon: Package, color: 'text-emerald-400' },
    { name: 'raw_material_consumption_kg', label: 'Raw Material Consumption', unit: 'kg', icon: Layers, color: 'text-indigo-400' },
    { name: 'machine_runtime_hours', label: 'Machine Runtime (≤ 24h)', unit: 'Hours', icon: Clock, color: 'text-yellow-400', step: '0.1', max: '24' },
    { name: 'temperature_c', label: 'Operating Temperature', unit: '°C', icon: Thermometer, color: 'text-rose-400', step: '0.5' },
    { name: 'pressure_bar', label: 'Operating Pressure', unit: 'bar', icon: Gauge, color: 'text-purple-400', step: '0.1' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-slate-200 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-cyan-400" />
          Scenario Parameter Adjustments
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg border border-slate-700 transition-colors flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          const Icon = field.icon;
          const baseVal = baseline[field.name];
          const scenVal = scenario[field.name];
          const diff = scenVal - baseVal;
          const pct = baseVal > 0 ? ((diff / baseVal) * 100).toFixed(1) : '0';

          return (
            <div key={field.name} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center">
                  <Icon className={`w-3.5 h-3.5 mr-1.5 ${field.color}`} />
                  {field.label}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Baseline: <strong className="text-slate-300">{baseVal} {field.unit}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  name={field.name}
                  value={scenVal}
                  onChange={handleChange}
                  step={field.step || 'any'}
                  min="0"
                  max={field.max}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
                />

                {diff !== 0 && (
                  <span className={`text-[11px] font-mono font-bold px-2 py-1 rounded shrink-0 border ${
                    diff > 0
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  }`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)} ({diff > 0 ? '+' : ''}{pct}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioInputPanel;
