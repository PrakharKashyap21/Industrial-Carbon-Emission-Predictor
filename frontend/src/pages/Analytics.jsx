import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import {
  getOverview,
  getEmissionTrend,
  getEmissionIntensity,
  getFeatures,
  getAnomalies,
  getOptimizationImpact,
  getInsights,
} from '../services/analyticsApi';

import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import KPIOverview from '../components/analytics/KPIOverview';
import EmissionTrend from '../components/analytics/EmissionTrend';
import ProductionTrend from '../components/analytics/ProductionTrend';
import EmissionIntensity from '../components/analytics/EmissionIntensity';
import FeatureTrend from '../components/analytics/FeatureTrend';
import AnomalyTimeline from '../components/analytics/AnomalyTimeline';
import ModelInsights from '../components/analytics/ModelInsights';
import OptimizationImpact from '../components/analytics/OptimizationImpact';
import IndustrialInsights from '../components/analytics/IndustrialInsights';

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [days, setDays] = useState(30);
  const [plantId, setPlantId] = useState(null);

  // Analytics Data States
  const [overview, setOverview] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [intensityData, setIntensityData] = useState(null);
  const [featureData, setFeatureData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchAllAnalytics();
  }, [days, plantId]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);

    const params = { days, plant_id: plantId };

    const [
      ovRes,
      trRes,
      intRes,
      ftRes,
      anRes,
      optRes,
      insRes,
    ] = await Promise.all([
      getOverview(params),
      getEmissionTrend(params),
      getEmissionIntensity(params),
      getFeatures(params),
      getAnomalies(params),
      getOptimizationImpact({ plant_id: plantId }),
      getInsights(params),
    ]);

    setLoading(false);

    if (ovRes.success) setOverview(ovRes.data);
    else setError(ovRes.error);

    if (trRes.success) setTrendData(trRes.data);
    if (intRes.success) setIntensityData(intRes.data);
    if (ftRes.success) setFeatureData(ftRes.data);
    if (anRes.success) setAnomalyData(anRes.data);
    if (optRes.success) setOptimizationData(optRes.data);
    if (insRes.success) setInsights(insRes.data);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 rounded-lg text-[10px] font-bold border border-cyan-800 uppercase tracking-widest flex items-center">
                <BarChart3 className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Phase 12 Analytics Platform
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Industrial Carbon Intelligence</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Advanced Industrial Carbon Analytics & Insights</h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Comprehensive analytics platform providing production-normalized emission intensity (kg CO₂ / unit), time-series emission trends, feature correlations, operational anomaly timelines, model insights, optimization savings impact, and deterministic rule-based industrial insights.
            </p>
          </div>

          <AnalyticsFilters
            days={days}
            setDays={setDays}
            plantId={plantId}
            setPlantId={setPlantId}
            disabled={loading}
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/60 border border-rose-800 rounded-xl p-4 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Loading Skeleton / Spinner */}
      {loading ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs font-mono font-semibold text-cyan-300">Loading Industrial Carbon Analytics Platform Data...</span>
        </div>
      ) : (
        <>
          {/* Top KPI Overview */}
          <KPIOverview overview={overview} />

          {/* Industrial Insights Section */}
          <IndustrialInsights insights={insights} />

          {/* Emission Trends & Production Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EmissionTrend trendData={trendData} />
            <ProductionTrend trendData={trendData} />
          </div>

          {/* Emission Intensity & Feature Correlation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EmissionIntensity intensityData={intensityData} />
            <FeatureTrend featureData={featureData} />
          </div>

          {/* Anomaly Timeline & Model Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnomalyTimeline anomalyData={anomalyData} />
            <ModelInsights />
          </div>

          {/* Optimization Impact Section */}
          <OptimizationImpact optimizationData={optimizationData} />
        </>
      )}
    </div>
  );
};

export default Analytics;
