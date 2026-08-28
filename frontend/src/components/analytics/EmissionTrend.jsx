import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const EmissionTrend = ({ trendData }) => {
  if (!trendData || trendData.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <TrendingUp className="w-4 h-4 mr-1.5 text-cyan-600" />
          Historical CO₂ Emission Trend
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Time-series trajectory of predicted industrial CO₂ emissions (kg).
        </p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Predicted CO₂ (kg)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
              formatter={(val) => [`${val.toLocaleString()} kg`, 'Predicted CO₂']}
            />
            <Area type="monotone" dataKey="co2" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#co2Grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmissionTrend;
