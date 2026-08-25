import React, { useState, useEffect } from 'react';
import { Sliders, Play, AlertCircle, BookmarkCheck, Award } from 'lucide-react';
import { runOptimization, getOptimizationHistory, getOptimizationCandidates } from '../services/optimizationApi';
import OptimizationSetup from '../components/optimization/OptimizationSetup';
import ConstraintPanel from '../components/optimization/ConstraintPanel';
import OptimizationProgress from '../components/optimization/OptimizationProgress';
import OptimizationResult from '../components/optimization/OptimizationResult';
import CandidateTable from '../components/optimization/CandidateTable';
import OptimizationChart from '../components/optimization/OptimizationChart';
import RecommendationCard from '../components/optimization/RecommendationCard';
import OptimizationExplanation from '../components/optimization/OptimizationExplanation';

export const Optimization = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Constraint states
  const [searchParams, setSearchParams] = useState({
    max_electricity_reduction: 20,
    electricity_step: 5,
    max_fuel_reduction: 20,
    fuel_step: 5,
    max_runtime_reduction: 15,
    runtime_step: 5,
  });

  const [constraints, setConstraints] = useState({
    minimum_production: 5000,
  });

  // Results
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [allCandidates, setAllCandidates] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Run default optimization on initial page mount
    handleExecuteOptimization();
    fetchHistory();
  }, []);

  const handleExecuteOptimization = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      plant_id: 1,
      constraints,
      search: searchParams,
    };

    const res = await runOptimization(payload);
    setLoading(false);

    if (res.success) {
      setOptimizationResult(res.data);
      if (res.data.optimization_id) {
        fetchCandidates(res.data.optimization_id);
      }
      fetchHistory();
    } else {
      setError(res.error);
    }
  };

  const fetchCandidates = async (optId) => {
    const res = await getOptimizationCandidates(optId);
    if (res.success) {
      setAllCandidates(res.data);
    }
  };

  const fetchHistory = async () => {
    const res = await getOptimizationHistory();
    if (res.success) {
      setHistory(res.data);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-[10px] font-bold border border-cyan-200 uppercase tracking-widest">
              AI Powered Optimizer
            </span>
            <span className="text-xs text-slate-500 font-semibold">• Decision-Support Constrained Search</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Carbon Reduction Optimization Engine</h1>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
            Automatically search candidate operating configurations using constrained grid search, evaluate ML ensemble predictions (Random Forest + XGBoost), enforce production output feasibility constraints, filter prediction reliability, and receive model-recommended operating scenarios.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-500 hover:text-slate-900 font-bold">✕</button>
        </div>
      )}

      {/* Grid Layout: Controls on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Optimization Controls */}
        <div className="lg:col-span-5 space-y-6">
          <OptimizationSetup
            searchParams={searchParams}
            onChange={setSearchParams}
            disabled={loading}
          />

          <ConstraintPanel
            constraints={constraints}
            onChange={setConstraints}
            disabled={loading}
          />

          <button
            onClick={handleExecuteOptimization}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{loading ? 'Executing Optimization Search...' : 'Run Automated Optimization Search'}</span>
          </button>

          {/* History Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <BookmarkCheck className="w-4 h-4 mr-1.5 text-cyan-600" />
              Optimization History Audit Log
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px]">
              {history.length > 0 ? (
                history.map((h, i) => (
                  <div key={i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-cyan-700 block">{h.optimization_id}</span>
                      <span className="text-slate-500 text-[10px] block font-sans">{h.created_at?.split('T')[0]}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-800 font-bold block">{h.candidates_evaluated} candidates</span>
                      <span className="text-slate-600 text-[10px] block">Baseline: {Math.round(h.baseline_prediction)} kg</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-center py-4 font-sans text-xs">No optimization runs logged yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Optimization Results & Recommendations */}
        <div className="lg:col-span-7 space-y-6">
          <OptimizationProgress loading={loading} />

          {!loading && optimizationResult && (
            <>
              <OptimizationResult result={optimizationResult} />

              <div className="grid grid-cols-1 gap-6">
                {optimizationResult.recommended_candidate?.recommendation_reasons && (
                  <RecommendationCard recommendation={optimizationResult.recommended_candidate} />
                )}

                {optimizationResult.recommended_candidate?.shap_explanation && (
                  <OptimizationExplanation shapExplanation={optimizationResult.recommended_candidate.shap_explanation} />
                )}
              </div>

              <OptimizationChart result={optimizationResult} />

              <CandidateTable candidates={allCandidates} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Optimization;
