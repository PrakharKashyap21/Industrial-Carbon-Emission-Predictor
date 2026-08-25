import React, { useState, useEffect } from 'react';
import { getDashboardOverview } from '../services/dashboardApi';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import KPIGrid from '../components/dashboard/KPIGrid';
import EmissionTrendChart from '../components/dashboard/EmissionTrendChart';
import PredictionVsActualChart from '../components/dashboard/PredictionVsActualChart';
import ConsumptionChart from '../components/dashboard/ConsumptionChart';
import EmissionIntensityChart from '../components/dashboard/EmissionIntensityChart';
import FeatureImportanceCard from '../components/dashboard/FeatureImportanceCard';
import RecentPredictions from '../components/dashboard/RecentPredictions';
import ModelPerformanceCard from '../components/dashboard/ModelPerformanceCard';
import DataQualityCard from '../components/dashboard/DataQualityCard';
import WhatIfEntryPointCard from '../components/dashboard/WhatIfEntryPointCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const Dashboard = () => {
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [days, setDays] = useState(30);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const res = await getDashboardOverview(selectedPlantId, days);
    setLoading(false);
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPlantId, days]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header & Controls */}
      <DashboardHeader
        plant={data?.plant}
        selectedPlantId={selectedPlantId}
        onPlantChange={setSelectedPlantId}
        days={days}
        onDaysChange={setDays}
        onRefresh={fetchData}
        loading={loading}
        lastUpdated={data?.data_quality?.latest_timestamp}
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-6 rounded-2xl text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <strong className="block text-rose-200">Unable to load dashboard data</strong>
              <span>{error}</span>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="px-3.5 py-1.5 bg-rose-900 hover:bg-rose-800 text-white font-semibold text-xs rounded-xl border border-rose-700 transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
          <p className="font-semibold text-slate-300">Loading industrial analytics overview...</p>
        </div>
      )}

      {/* Main Dashboard Payload */}
      {data && (
        <div className="space-y-8">
          {/* 2. KPI Section */}
          <KPIGrid kpis={data.kpis} />

          {/* 3. Main CO2 Emission Trend */}
          <EmissionTrendChart trends={data.trends} />

          {/* 4. Overlay & Resource Consumption Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">
              <PredictionVsActualChart trends={data.trends} />
            </div>
            <div className="lg:col-span-6">
              <ConsumptionChart trends={data.trends} />
            </div>
          </div>

          {/* 5. CO2 Intensity & Global SHAP Drivers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">
              <EmissionIntensityChart trends={data.trends} />
            </div>
            <div className="lg:col-span-6">
              <FeatureImportanceCard shapDrivers={data.shap_drivers} />
            </div>
          </div>

          {/* Recent Prediction Lifecycle Audit History */}
          <RecentPredictions />

          {/* 6. Model Registry, Data Quality & What-if Entry Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <ModelPerformanceCard model={data.model} />
            </div>
            <div className="lg:col-span-4">
              <DataQualityCard dataQuality={data.data_quality} />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <WhatIfEntryPointCard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
