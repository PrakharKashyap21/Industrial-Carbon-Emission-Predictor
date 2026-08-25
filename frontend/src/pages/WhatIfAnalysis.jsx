import React, { useState, useEffect } from 'react';
import { Sliders, Activity, Table, BookmarkCheck, Play, AlertCircle } from 'lucide-react';
import { predictScenario, compareScenarios, analyzeSensitivity, saveScenario, getSavedScenarios } from '../services/whatIfApi';
import ScenarioBuilder from '../components/whatif/ScenarioBuilder';
import ScenarioResult from '../components/whatif/ScenarioResult';
import ScenarioComparison from '../components/whatif/ScenarioComparison';
import ScenarioRecommendation from '../components/whatif/ScenarioRecommendation';
import ScenarioSensitivityChart from '../components/whatif/ScenarioSensitivityChart';

export const WhatIfAnalysis = () => {
  const [activeTab, setActiveTab] = useState('single'); // 'single', 'compare', 'sensitivity', 'history'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // States
  const [singleResult, setSingleResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [sensitivityResult, setSensitivityResult] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);

  // Default initial run on mount
  useEffect(() => {
    handleRunSingle({
      scenario_name: 'Energy Optimization (-10%)',
      changes: { electricity_consumption_kwh: -10 },
      change_type: 'percentage',
      constraints: { min_production_output: 4800 },
    });

    handleSensitivityChange('electricity_consumption_kwh');
    fetchSavedHistory();
  }, []);

  const handleRunSingle = async (payload) => {
    setLoading(true);
    setError(null);
    const res = await predictScenario(payload);
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
    const res = await compareScenarios({
      plant_id: 1,
      scenarios: scenariosList,
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

  const handleSensitivityChange = async (featureName) => {
    setLoading(true);
    const res = await analyzeSensitivity({
      plant_id: 1,
      feature: featureName,
      changes: [-20, -15, -10, -5, 0, 5, 10],
    });
    setLoading(false);
    if (res.success) {
      setSensitivityResult(res.data);
    }
  };

  const handleSaveScenario = async (scenarioData) => {
    const res = await saveScenario({
      scenario_name: scenarioData.scenario_name,
      changes: scenarioData.scenario_inputs,
      change_type: 'percentage',
    });
    if (res.success) {
      fetchSavedHistory();
      alert('Scenario successfully saved to database!');
    }
  };

  const fetchSavedHistory = async () => {
    const res = await getSavedScenarios();
    if (res.success) {
      setSavedScenarios(res.data);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-[10px] font-bold border border-cyan-200 uppercase tracking-widest">
              AI Scenario Simulator
            </span>
            <span className="text-xs text-slate-500 font-semibold">• Non-Mutating Operational Simulation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">What-if Analysis & Scenario Simulation Engine</h1>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
            Simulate operational parameter modifications (electricity, fuel, runtime), compare scenarios side-by-side against baseline emissions, validate production feasibility constraints, analyze sensitivity response curves, and audit saved scenario decisions.
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

      {/* Grid: Scenario Builder on Left, Interactive Simulation Tabs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'single' ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5" /> <span>Single Simulation</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'compare' ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> <span>Multi-Scenario Comparison</span>
            </button>

            <button
              onClick={() => setActiveTab('sensitivity')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'sensitivity' ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> <span>Sensitivity Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'history' ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" /> <span>Saved History</span>
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'single' && (
            <ScenarioResult scenario={singleResult} onSave={handleSaveScenario} />
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
              onFeatureChange={handleSensitivityChange}
              loading={loading}
            />
          )}

          {activeTab === 'history' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <BookmarkCheck className="w-4 h-4 mr-1.5 text-cyan-600" /> Saved What-if Scenario History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] text-slate-600 font-bold uppercase bg-slate-50">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Simulated CO₂</th>
                      <th className="py-2.5 px-3">Change (kg)</th>
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
                          <td className="py-2.5 px-3 text-slate-500 font-sans">{s.created_at?.split('T')[0]}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-500 font-sans">No saved scenarios in database yet.</td>
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
