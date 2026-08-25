import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const OptimizationChart = ({ result }) => {
  if (!result || !result.top_candidates) return null;

  const { baseline_prediction, top_candidates } = result;

  // Build chart dataset: Baseline + Top Candidates
  const chartData = [
    {
      name: 'Baseline Operating',
      co2: Math.round(baseline_prediction),
      isBaseline: true,
    },
    ...top_candidates.slice(0, 5).map((c, i) => ({
      name: `Top #${i + 1} (${c.candidate_id})`,
      co2: Math.round(c.ensemble_prediction),
      isBaseline: false,
    })),
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <BarChart3 className="w-4 h-4 mr-1.5 text-cyan-600" />
          Baseline vs Top Feasible Scenarios Emission Comparison
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Visual comparison of current baseline CO₂ emissions against top ranked feasible candidate operating configurations.
        </p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Predicted CO₂ (kg)', angle: -90, position: 'insideLeft', fill: '#475569' }} />
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
              formatter={(val, name) => [`${val?.toLocaleString()} kg CO₂`, name || 'Predicted Emission']}
            />
            <Bar dataKey="co2" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isBaseline ? '#ef4444' : index === 1 ? '#06b6d4' : '#2563eb'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OptimizationChart;
