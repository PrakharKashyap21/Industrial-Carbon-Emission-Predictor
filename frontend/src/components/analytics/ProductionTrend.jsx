import React from 'react';
import { Factory } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const ProductionTrend = ({ trendData }) => {
  if (!trendData || trendData.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <Factory className="w-4 h-4 mr-1.5 text-emerald-600" />
          Production Output vs Predicted Emissions Overlay
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Comparative overlay comparing daily manufacturing production output against predicted CO₂ emissions.
        </p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis yAxisId="left" stroke="#059669" fontSize={11} label={{ value: 'Production (units)', angle: -90, position: 'insideLeft', fill: '#059669' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#0284c7" fontSize={11} label={{ value: 'CO₂ (kg)', angle: 90, position: 'insideRight', fill: '#0284c7' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line yAxisId="left" type="monotone" dataKey="production" name="Production Output" stroke="#059669" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="co2" name="Predicted CO₂" stroke="#0284c7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductionTrend;
