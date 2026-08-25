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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
          <Sliders className="w-4 h-4 mr-1.5 text-cyan-400" />
          Operational Factor Correlation Matrix with Predicted CO₂
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Statistical correlation strength (Pearson r) of individual operational input parameters against predicted emissions.
        </p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" domain={[-1, 1]} stroke="#64748b" fontSize={11} label={{ value: 'Correlation with Predicted Emissions (r)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={130} />
            <Tooltip
              contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              formatter={(val) => [`${val}`, 'Pearson Correlation (r)']}
            />
            <Bar dataKey="corr" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.corr > 0.7 ? '#06b6d4' : entry.corr > 0.4 ? '#3b82f6' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeatureTrend;
