import React, { useState, useEffect } from 'react';
import {
  getMonitoringOverview,
  getPerformanceMetrics,
  getReliabilityAssessment,
  getMonitoringAlerts,
  runMonitoringCycle,
} from '../services/monitoringApi';
import DataQualityCard from '../components/monitoring/DataQualityCard';
import DriftCard from '../components/monitoring/DriftCard';
import ModelPerformanceCard from '../components/monitoring/ModelPerformanceCard';
import ReliabilityCard from '../components/monitoring/ReliabilityCard';
import MonitoringAlerts from '../components/monitoring/MonitoringAlerts';
import DriftChart from '../components/monitoring/DriftChart';
import { Activity, RefreshCw, Play, ShieldCheck, Clock } from 'lucide-react';

export const ModelMonitoring = () => {
  const [plantId, setPlantId] = useState('');
  const [days, setDays] = useState(30);

  const [overview, setOverview] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [reliability, setReliability] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [runMsg, setRunMsg] = useState(null);

  const fetchMonitoringData = async () => {
    setLoading(true);
    setError(null);
    const params = { days };
    if (plantId) params.plant_id = parseInt(plantId);

    const [ovRes, perfRes, relRes, alertRes] = await Promise.all([
      getMonitoringOverview(params),
      getPerformanceMetrics(params),
      getReliabilityAssessment(params),
      getMonitoringAlerts({ status: 'active', plant_id: plantId ? parseInt(plantId) : undefined }),
    ]);

    setLoading(false);

    if (ovRes.success) setOverview(ovRes.data);
    else setError(ovRes.error);

    if (perfRes.success) setPerformance(perfRes.data);
    if (relRes.success) setReliability(relRes.data);
    if (alertRes.success) setAlerts(alertRes.data);
  };

  useEffect(() => {
    fetchMonitoringData();
  }, [plantId, days]);

  const handleRunCycle = async () => {
    setRunning(true);
    setRunMsg(null);
    const params = { days };
    if (plantId) params.plant_id = parseInt(plantId);

    const res = await runMonitoringCycle(params);
    setRunning(false);
    if (res.success) {
      setRunMsg('System monitoring run executed successfully! Snapshot updated.');
      fetchMonitoringData();
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Phase 9 ML System Operational Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Model Monitoring, Data Drift & Reliability
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Observe input data quality, feature Population Stability Index (PSI), rolling performance degradation, and explainable prediction reliability.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <select
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Facilities</option>
            <option value="1">Apex Steel Works</option>
            <option value="2">Titan Cement Plant</option>
            <option value="3">SynthoChem</option>
            <option value="4">Vanguard Textile</option>
            <option value="5">NutriFood</option>
          </select>

          <button
            onClick={handleRunCycle}
            disabled={running}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Executing...' : 'Run Monitoring Cycle'}</span>
          </button>
        </div>
      </div>

      {runMsg && (
        <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-4 rounded-2xl text-xs flex items-center space-x-2 font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{runMsg}</span>
        </div>
      )}

      {loading && !overview && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
          <p>Loading system monitoring status...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-6 rounded-2xl text-xs text-center">
          {error}
        </div>
      )}

      {overview && (
        <div className="space-y-8">
          {/* Top 4 Monitoring Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataQualityCard overview={overview} />
            <DriftCard overview={overview} />
            <ModelPerformanceCard overview={overview} performance={performance} />
            <ReliabilityCard reliabilityData={reliability} />
          </div>

          {/* Active Alerts Section */}
          <MonitoringAlerts alerts={alerts} onResolve={fetchMonitoringData} />

          {/* Feature Drift PSI & KS Breakdown Chart */}
          <DriftChart features={overview.drift_features} />
        </div>
      )}
    </div>
  );
};

export default ModelMonitoring;
