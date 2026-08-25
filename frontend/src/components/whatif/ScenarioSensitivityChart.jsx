import React from 'react';
import { Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ScenarioSensitivityChart = ({ sensitivityData, onFeatureChange, loading }) => {
  if (!sensitivityData) return null;

  const { feature, points } = sensitivityData;

  const featureOptions = [
    { value: 'electricity_consumption_kwh', label: 'Electricity Consumption (kWh)' },
    { value: 'diesel_consumption_liters', label: 'Diesel Fuel Consumption (Liters)' },
    { value: 'natural_gas_consumption_m3', label: 'Natural Gas Consumption (m³)' },
    { value: 'machine_runtime_hours', label: 'Machine Runtime (Hours)' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Activity className="w-4 h-4 mr-1.5 text-cyan-600" />
            Single-Variable Sensitivity Curve Analysis
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Vary a single operational feature from -20% to +10% while holding other parameters constant to observe emission response curves.
          </p>
        </div>

        <select
          value={feature}
          onChange={(e) => onFeatureChange(e.target.value)}
          disabled={loading}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-cyan-700 font-semibold focus:border-cyan-500 focus:outline-none shadow-2xs"
        >
          {featureOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="change_percentage"
              stroke="#64748b"
              tickFormatter={(v) => `${v}%`}
              label={{ value: 'Parameter Change (%)', position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 11 }}
            />
            <YAxis
              stroke="#64748b"
              domain={['auto', 'auto']}
              tickFormatter={(v) => `${Math.round(v)}`}
              label={{ value: 'Predicted CO₂ (kg)', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                color: '#ffffff',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
                padding: '10px 14px',
              }}
              itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold', marginBottom: '4px' }}
              formatter={(val) => [`${Math.round(val).toLocaleString()} kg CO₂`, 'Predicted Emission']}
              labelFormatter={(lbl) => `Parameter Change: ${lbl}%`}
            />
            <Line
              type="monotone"
              dataKey="predicted_co2"
              stroke="#0891b2"
              strokeWidth={3}
              dot={{ r: 5, fill: '#0891b2' }}
              activeDot={{ r: 7, fill: '#0284c7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScenarioSensitivityChart;
