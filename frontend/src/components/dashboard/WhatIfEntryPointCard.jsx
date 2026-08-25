import React from 'react';
import { Link } from 'react-router-dom';
import { Sliders, ArrowRight, Sparkles } from 'lucide-react';

export const WhatIfEntryPointCard = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Sliders className="w-4 h-4 mr-1.5 text-cyan-600" />
            Operational Scenario Simulation
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-cyan-600" /> Scenario AI
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          Explore how operational modifications (e.g. -10% electricity, -10% diesel, or machine runtime changes) affect predicted CO₂ emissions and intensity without model retraining.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/what-if"
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 group"
        >
          <span>Open What-if Scenario Analysis</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default WhatIfEntryPointCard;
