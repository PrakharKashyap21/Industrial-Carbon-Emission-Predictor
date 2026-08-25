import React from 'react';
import { Factory } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const ProductionTrend = ({ trendData }) => {
  if (!trendData || trendData.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
          <Factory className="w-4 h-4 mr-1.5 text-emerald-400" />
          Production Output vs Predicted Emissions Overlay
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Comparative overlay comparing daily manufacturing production output against predicted CO₂ emissions.
        </p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis yAxisId="left" stroke="#10b981" fontSize={11} label={{ value: 'Production (units)', angle: -90, position: 'insideLeft', fill: '#10b981' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={11} label={{ value: 'CO₂ (kg)', angle: 90, position: 'insideRight', fill: '#06b6d4' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line yAxisId="left" type="monotone" dataKey="production" name="Production Output" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="co2" name="Predicted CO₂" stroke="#06b6d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductionTrend;
