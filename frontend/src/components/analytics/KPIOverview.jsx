import React from 'react';
import { Activity, Factory, Gauge, Zap } from 'lucide-react';

export const KPIOverview = ({ overview }) => {
  if (!overview) return null;

  const {
    total_co2,
    average_co2,
    total_production,
    emission_intensity,
    average_electricity_kwh,
    average_diesel_liters,
    average_runtime_hours,
    observation_count,
  } = overview;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total CO2 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center">
          <Activity className="w-3.5 h-3.5 mr-1 text-cyan-600" /> Total Predicted CO₂
        </span>
        <div className="text-2xl font-extrabold text-slate-900 font-mono">
          {total_co2 ? Math.round(total_co2).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-500">kg</span>
        </div>
        <span className="text-[10px] text-slate-500 block">Avg {average_co2 ? Math.round(average_co2).toLocaleString() : '0'} kg / observation</span>
      </div>

      {/* Production Output */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center">
          <Factory className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Total Production Output
        </span>
        <div className="text-2xl font-extrabold text-emerald-700 font-mono">
          {total_production ? Math.round(total_production).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-500">units</span>
        </div>
        <span className="text-[10px] text-slate-500 block">{observation_count} operational records</span>
      </div>

      {/* Production-Normalized Emission Intensity */}
      <div className="bg-white border border-cyan-300 rounded-2xl p-5 shadow-sm space-y-1 bg-gradient-to-br from-cyan-50/60 via-white to-white">
        <span className="text-[11px] font-semibold text-cyan-700 uppercase tracking-wider block flex items-center">
          <Gauge className="w-3.5 h-3.5 mr-1 text-cyan-600" /> Emission Intensity
        </span>
        <div className="text-2xl font-extrabold text-slate-900 font-mono">
          {emission_intensity} <span className="text-xs font-normal text-slate-500">kg CO₂ / unit</span>
        </div>
        <span className="text-[10px] text-slate-500 block">Normalized production emissions efficiency</span>
      </div>

      {/* Avg Operational Energy */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center">
          <Zap className="w-3.5 h-3.5 mr-1 text-amber-600" /> Avg Energy Inputs
        </span>
        <div className="text-lg font-bold text-slate-900 font-mono">
          {average_electricity_kwh ? Math.round(average_electricity_kwh).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-500">kWh</span>
        </div>
        <span className="text-[10px] text-slate-500 block font-mono">Diesel: {average_diesel_liters ? Math.round(average_diesel_liters) : 0} L | Runtime: {average_runtime_hours} hrs</span>
      </div>
    </div>
  );
};

export default KPIOverview;
