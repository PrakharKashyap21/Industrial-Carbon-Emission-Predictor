import React from 'react';
import { Cpu, Sliders, Award, Activity, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export const ReportTypeSelector = ({ selectedType, onSelect }) => {
  const reportTypes = [
    {
      id: 'EXECUTIVE',
      title: 'Executive Summary',
      description: 'Senior management overview with MoM emission intensity, production KPIs & recommendations.',
      icon: FileSpreadsheet,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'ANALYTICS',
      title: 'Analytics & Performance',
      description: 'Detailed emission trends, intensity metrics, operational feature correlations & insights.',
      icon: Activity,
      color: 'from-indigo-600 to-cyan-600',
    },
    {
      id: 'PREDICTION',
      title: 'Prediction Report',
      description: 'Single prediction audit trail, RF vs XGB breakdown, model version & driver features.',
      icon: Cpu,
      color: 'from-cyan-600 to-teal-600',
    },
    {
      id: 'WHAT_IF',
      title: 'What-if Analysis',
      description: 'Baseline vs modified scenario comparison, estimated % reduction & delta calculations.',
      icon: Sliders,
      color: 'from-emerald-600 to-cyan-600',
    },
    {
      id: 'OPTIMIZATION',
      title: 'Optimization Report',
      description: 'Recommended operational candidate parameters, baseline vs optimized reduction & feasibility.',
      icon: Award,
      color: 'from-amber-600 to-emerald-600',
    },
    {
      id: 'MONITORING',
      title: 'Model Monitoring',
      description: 'Data quality score, feature drift status, prediction reliability & alert frequency timeline.',
      icon: AlertTriangle,
      color: 'from-rose-600 to-amber-600',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">1. Select Report Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-xl ring-2 ring-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${item.color} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                      Selected
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-extrabold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReportTypeSelector;
