import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Zap, Play, BookmarkCheck, TrendingDown, CheckCircle2 } from 'lucide-react';
import { runOptimization, getOptimizationHistory, getOptimizationCandidates } from '../services/optimizationApi';
import OptimizationSetup from '../components/optimization/OptimizationSetup';
import ConstraintPanel from '../components/optimization/ConstraintPanel';
import OptimizationProgress from '../components/optimization/OptimizationProgress';
import OptimizationResult from '../components/optimization/OptimizationResult';
import CandidateTable from '../components/optimization/CandidateTable';
import OptimizationChart from '../components/optimization/OptimizationChart';
import RecommendationCard from '../components/optimization/RecommendationCard';
import OptimizationExplanation from '../components/optimization/OptimizationExplanation';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';

import { useFilter } from '../context/FilterContext';

export const Optimization = () => {
  const { selectedPlantId } = useFilter();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const plantIdParam = selectedPlantId === 'all' ? 1 : parseInt(selectedPlantId);

  const [searchParams, setSearchParams] = useState({
    max_electricity_reduction: 20,
    electricity_step: 5,
    max_fuel_reduction: 20,
    fuel_step: 5,
    max_runtime_reduction: 15,
    runtime_step: 5,
  });

  const [constraints, setConstraints] = useState({
    minimum_production: 2000,
  });

  const [optimizationResult, setOptimizationResult] = useState(null);
  const [allCandidates, setAllCandidates] = useState([]);
  const [history, setHistory] = useState([]);

  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    const currentInputs = location.state?.currentInputs || location.state?.baselineInputs || null;
    if (currentInputs) {
      setPrefilled(true);
    }
    fetchHistory();
  }, [selectedPlantId, location.state]);

  const handleExecuteOptimization = async () => {
    setLoading(true);
    setError(null);

    const currentInputs = location.state?.currentInputs || location.state?.baselineInputs || null;

    const payload = {
      plant_id: plantIdParam,
      baseline_features: currentInputs,
      constraints,
      search: searchParams,
    };

    const res = await runOptimization(payload);
    setLoading(false);

    if (res.success) {
      setOptimizationResult(res.data);
      if (!res.data.recommended_candidate) {
        setError("No feasible low-emission scenario was found within the current operating constraints.");
      }
      if (res.data.optimization_id) {
        fetchCandidates(res.data.optimization_id);
      }
      fetchHistory();
    } else {
      setOptimizationResult(null);
      setAllCandidates([]);
      setError(typeof res.error === 'string' ? res.error : 'Optimization Search Failed. Please try again.');
    }
  };

  const fetchCandidates = async (optId) => {
    const res = await getOptimizationCandidates(optId);
    if (res.success) {
      setAllCandidates(res.data);
    }
  };

  const fetchHistory = async () => {
    const res = await getOptimizationHistory({ plant_id: plantIdParam });
    if (res.success) {
      setHistory(res.data);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Find a Lower-Emission Operating Scenario"
        subtitle="Evaluate feasible operating configurations using AI decision support search to identify model-estimated carbon reductions."
        badge={
          <Badge variant="healthy" dot>
            Optimization Recommendation Engine
          </Badge>
        }
      >
        <div className="flex items-center space-x-2">
          {prefilled && (
            <span className="px-3 py-1.5 bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl text-xs font-bold font-mono flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-600" /> Prefilled from Workflow
            </span>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={TrendingDown}
            onClick={() => navigate('/reports')}
          >
            Generate Optimization Report
          </Button>
        </div>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Optimization Search Failed">
          {error}
        </Alert>
      )}

      {/* Grid Layout: Search & Constraint Controls on Left, Recommended Scenario on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls */}
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

          <Button
            variant="primary"
            size="lg"
            isLoading={loading}
            icon={Zap}
            className="w-full"
            onClick={handleExecuteOptimization}
          >
            Find Optimal Operating Scenario
          </Button>

          {/* History Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <BookmarkCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              Optimization History Audit Log
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px]">
              {history.length > 0 ? (
                history.map((h, i) => (
                  <div key={i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-emerald-700 block">{h.optimization_id}</span>
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

        {/* Right Column: Results & Candidates */}
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
