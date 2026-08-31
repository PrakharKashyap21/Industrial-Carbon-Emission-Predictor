import React from 'react';
import { Building2, Award, TrendingDown, Layers } from 'lucide-react';

export const PlantComparison = ({ plantData }) => {
  if (!plantData || !plantData.plants || plantData.plants.length === 0) return null;

  const { plants } = plantData;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Building2 className="w-4 h-4 mr-1.5 text-cyan-600" /> Multi-Plant Performance Ranking & Comparison
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Ranked by production-normalized carbon intensity (kg CO₂ / unit) across authorized facility locations.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
          {plants.length} Authorized Facilities
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] text-slate-600 font-bold uppercase bg-slate-50">
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Plant Facility Name</th>
              <th className="py-3 px-4">Total CO₂ Emission</th>
              <th className="py-3 px-4">Avg CO₂ Emission</th>
              <th className="py-3 px-4">Total Production</th>
              <th className="py-3 px-4">CO₂ Intensity (kg/unit)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {plants.map((p) => {
              const isTop = p.rank === 1;
              return (
                <tr key={p.plant_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold">
                    {isTop ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Award className="w-3 h-3 mr-1 text-amber-600" /> #1 Best Intensity
                      </span>
                    ) : (
                      <span className="text-slate-600">#{p.rank}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">{p.plant_name}</td>
                  <td className="py-3 px-4 text-slate-900 font-bold">{Math.round(p.total_co2).toLocaleString()} kg</td>
                  <td className="py-3 px-4 text-slate-600">{Math.round(p.average_co2).toLocaleString()} kg</td>
                  <td className="py-3 px-4 text-slate-600">{Math.round(p.total_production).toLocaleString()} units</td>
                  <td className="py-3 px-4 font-bold text-cyan-700">
                    {p.emission_intensity ? p.emission_intensity.toFixed(4) : 'N/A'} kg/unit
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlantComparison;
