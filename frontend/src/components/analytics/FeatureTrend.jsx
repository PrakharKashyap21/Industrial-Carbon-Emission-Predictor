import React from 'react';
import { Sliders } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const FeatureTrend = ({ featureData }) => {
  if (!featureData || !featureData.correlations) return null;

  const { correlations } = featureData;

  const chartData = correlations.map((c) => ({
    name: c.display_name,
    corr: c.correlation_with_co2,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <Sliders className="w-4 h-4 mr-1.5 text-cyan-600" />
          Operational Factor Correlation Matrix with Predicted CO₂
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Statistical correlation strength (Pearson r) of individual operational input parameters against predicted emissions.
        </p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" domain={[-1, 1]} stroke="#64748b" fontSize={11} label={{ value: 'Correlation with Predicted Emissions (r)', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={130} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
              formatter={(val) => [`${val}`, 'Pearson Correlation (r)']}
            />
            <Bar dataKey="corr" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.corr > 0.7 ? '#0284c7' : entry.corr > 0.4 ? '#2563eb' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeatureTrend;
