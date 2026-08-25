import React from 'react';
import StatusCard from '../components/StatusCard';
import { Cpu, Database, Layers, Sparkles, LineChart, FileCode } from 'lucide-react';

export const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1 Architecture Initialized</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Industrial Carbon Emission <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Prediction System
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            AI-powered prediction and decision-support platform for industrial carbon emissions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700">React + Vite</span>
            <span className="px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700">FastAPI</span>
            <span className="px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700">Axios</span>
            <span className="px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700">Tailwind CSS</span>
          </div>
        </div>
      </div>

      {/* System Status Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
            Backend System Health
          </h2>
        </div>

        <StatusCard />
      </section>

      {/* Phase Roadmap Overview */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center">
          <Layers className="w-5 h-5 mr-2 text-cyan-400" />
          Architectural Blueprint & Roadmap
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
            <div className="p-3 bg-cyan-950/60 text-cyan-400 rounded-xl border border-cyan-800/40 w-fit mb-4">
              <FileCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-1">Phase 1: Foundation</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Project structure, React/Vite frontend, FastAPI backend, CORS setup, and API health communication.
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              Active Phase
            </span>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 opacity-80">
            <div className="p-3 bg-slate-800/60 text-slate-400 rounded-xl border border-slate-700/60 w-fit mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">Phase 2: Data & PostgreSQL</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              PostgreSQL schema creation, industrial facility dataset ingestion, feature engineering, and data pipeline.
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
              Upcoming
            </span>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 opacity-80">
            <div className="p-3 bg-slate-800/60 text-slate-400 rounded-xl border border-slate-700/60 w-fit mb-4">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">Phase 3+: ML Ensemble & XAI</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Random Forest + XGBoost regressor ensemble, SHAP explainable AI, and interactive What-if scenario analysis.
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
              Upcoming
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
