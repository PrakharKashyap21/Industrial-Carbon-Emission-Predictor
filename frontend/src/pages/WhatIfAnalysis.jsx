import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sliders, Activity, Table as TableIcon, BookmarkCheck, Play, AlertCircle, TrendingDown, RotateCcw, Copy, Trash2, Cpu } from 'lucide-react';
import { predictScenario, compareScenarios, analyzeSensitivity, saveScenario, getSavedScenarios } from '../services/whatIfApi';
import ScenarioBuilder from '../components/whatif/ScenarioBuilder';
import ScenarioResult from '../components/whatif/ScenarioResult';
import ScenarioComparison from '../components/whatif/ScenarioComparison';
import ScenarioRecommendation from '../components/whatif/ScenarioRecommendation';
import ScenarioSensitivityChart from '../components/whatif/ScenarioSensitivityChart';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';

import { useFilter } from '../context/FilterContext';

export const WhatIfAnalysis = () => {
  const { selectedPlantId } = useFilter();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prefilled, setPrefilled] = useState(false);

  const plantIdParam = selectedPlantId === 'all' ? 1 : parseInt(selectedPlantId);

  const [singleResult, setSingleResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [sensitivityResult, setSensitivityResult] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);

  useEffect(() => {
    const baselineInputs = location.state?.baselineInputs || null;
    if (baselineInputs) {
      setPrefilled(true);
    }

    const initialChanges = baselineInputs
      ? { electricity_consumption_kwh: -5 }
      : { electricity_consumption_kwh: -10 };

    handleRunSingle({
      plant_id: plantIdParam,
      baseline_features: baselineInputs,
      scenario_name: 'Energy Efficiency (-10%)',
      changes: initialChanges,
      change_type: 'percentage',
      constraints: { min_production_output: 2000 },
    });

    handleSensitivityChange('electricity_consumption_kwh', baselineInputs);
    fetchSavedHistory();
  }, [selectedPlantId, location.state]);

  const handleRunSingle = async (payload) => {
    setLoading(true);
    setError(null);
    const baselineInputs = location.state?.baselineInputs || null;
    const payloadWithPlant = {
      ...payload,
      plant_id: payload.plant_id || plantIdParam,
      baseline_features: payload.baseline_features || baselineInputs,
    };
    const res = await predictScenario(payloadWithPlant);
    setLoading(false);
    if (res.success) {
      setSingleResult(res.data);
      setActiveTab('single');
    } else {
      setError(res.error);
    }
  };

  const handleBatchCompare = async (scenariosList, constraints) => {
    setLoading(true);
    setError(null);
    const baselineInputs = location.state?.baselineInputs || null;
    
    // Configurable scenario limit: cap at 5 scenarios
    const cappedScenarios = scenariosList.slice(0, 5);

    const res = await compareScenarios({
      plant_id: plantIdParam,
      baseline_features: baselineInputs,
      scenarios: cappedScenarios,
      constraints,
    });
    setLoading(false);
    if (res.success) {
      setComparisonResult(res.data);
      setActiveTab('compare');
    } else {
      setError(res.error);
    }
  };

  const handleSensitivityChange = async (featureName, customBaseline = null) => {
    setLoading(true);
    const baselineInputs = customBaseline || location.state?.baselineInputs || null;
    const res = await analyzeSensitivity({
      plant_id: plantIdParam,
      baseline_features: baselineInputs,
      feature: featureName,
      changes: [-20, -15, -10, -5, 0, 5, 10],
    });
    setLoading(false);
    if (res.success) {
      setSensitivityResult(res.data);
    }
  };

  const handleSaveScenario = async (scenarioData) => {
    const baselineInputs = location.state?.baselineInputs || null;
    const res = await saveScenario({
      plant_id: plantIdParam,
      scenario_name: scenarioData.scenario_name,
      baseline_features: baselineInputs,
      changes: scenarioData.scenario_inputs,
      change_type: 'percentage',
    });
    if (res.success) {
      fetchSavedHistory();
      alert('Scenario saved successfully to database!');
    } else {
      setError(res.error);
    }
  };

  const handleResetScenario = (scenarioData) => {
    const baselineInputs = location.state?.baselineInputs || null;
    handleRunSingle({
      plant_id: plantIdParam,
      baseline_features: baselineInputs,
      scenario_name: `${scenarioData.scenario_name} (Reset)`,
      changes: {},
      change_type: 'percentage',
    });
  };

  const handleDuplicateScenario = (scenarioData) => {
    const baselineInputs = location.state?.baselineInputs || null;
    handleRunSingle({
      plant_id: plantIdParam,
      baseline_features: baselineInputs,
      scenario_name: `Copy of ${scenarioData.scenario_name}`,
      changes: { electricity_consumption_kwh: -5 },
      change_type: 'percentage',
    });
  };

  const fetchSavedHistory = async () => {
    const res = await getSavedScenarios({ plant_id: plantIdParam });
    if (res.success) {
      setSavedScenarios(res.data);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="What-If Scenario Simulation Engine"
        subtitle="Simulate operating parameter modifications (electricity, fuel, runtime) and compute model-estimated CO₂ reduction."
        badge={
          <Badge variant="healthy" dot>
            Scenario Simulator
          </Badge>
        }
      >
        <div className="flex items-center space-x-2">
          {prefilled && (
            <span className="px-3 py-1.5 bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl text-xs font-bold font-mono flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-600" /> Prefilled from Prediction Workflow
            </span>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={TrendingDown}
            onClick={() => navigate('/optimization')}
          >
            Run Optimization Engine
          </Button>
        </div>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Simulation Error">
          {error}
        </Alert>
      )}

      {/* Grid: Scenario Builder on Left, Simulation Tabs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scenario Builder */}
        <div className="lg:col-span-5 space-y-6">
          <ScenarioBuilder
            onRunSimulation={handleRunSingle}
            onBatchCompare={handleBatchCompare}
            loading={loading}
          />
        </div>

        {/* Right Column: Simulation Output Tabs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs Bar */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'single' ? 'bg-white text-cyan-700 font-semibold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5" /> <span>Single Simulation</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'compare' ? 'bg-white text-cyan-700 font-semibold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> <span>Multi-Scenario Comparison</span>
            </button>

            <button
              onClick={() => setActiveTab('sensitivity')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'sensitivity' ? 'bg-white text-cyan-700 font-semibold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> <span>Sensitivity Curves</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'history' ? 'bg-white text-cyan-700 font-semibold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" /> <span>Saved History ({savedScenarios.length})</span>
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'single' && (
            <ScenarioResult
              scenario={singleResult}
              onSave={handleSaveScenario}
              onReset={handleResetScenario}
              onDuplicate={handleDuplicateScenario}
            />
          )}

          {activeTab === 'compare' && (
            <div className="space-y-6">
              {comparisonResult?.recommendation && (
                <ScenarioRecommendation recommendation={comparisonResult.recommendation} />
              )}
              <ScenarioComparison comparisonData={comparisonResult} />
            </div>
          )}

          {activeTab === 'sensitivity' && (
            <ScenarioSensitivityChart
              sensitivityData={sensitivityResult}
              onFeatureChange={(feat) => handleSensitivityChange(feat)}
              loading={loading}
            />
          )}

          {activeTab === 'history' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                  <BookmarkCheck className="w-4 h-4 mr-1.5 text-cyan-600" /> Saved What-if Scenario History
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Plant Context: Plant ID #{plantIdParam}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] text-slate-600 font-bold uppercase bg-slate-50">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Simulated CO₂</th>
                      <th className="py-2.5 px-3">Change (kg)</th>
                      <th className="py-2.5 px-3">Reliability</th>
                      <th className="py-2.5 px-3">Saved Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {savedScenarios.length > 0 ? (
                      savedScenarios.map((s, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-cyan-700 font-bold">{s.scenario_id}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-800 font-semibold">{s.scenario_name}</td>
                          <td className="py-2.5 px-3 text-slate-500">{s.scenario_type}</td>
                          <td className="py-2.5 px-3 text-slate-900 font-bold">{s.ensemble_prediction ? Math.round(s.ensemble_prediction).toLocaleString() : 'N/A'} kg</td>
                          <td className={`py-2.5 px-3 font-bold ${s.co2_change < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {s.co2_change > 0 ? `+${s.co2_change}` : s.co2_change} kg
                          </td>
                          <td className="py-2.5 px-3 font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {s.reliability_status || 'HIGH'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-sans">{s.created_at?.split('T')[0]}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-slate-500 font-sans">No saved scenarios found for this plant.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfAnalysis;
