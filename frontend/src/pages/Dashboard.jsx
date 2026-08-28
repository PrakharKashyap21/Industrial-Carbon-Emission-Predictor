import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardOverview } from '../services/dashboardApi';
import { useFilter } from '../context/FilterContext';
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

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import LoadingState from '../components/ui/LoadingState';
import { RefreshCw, Cpu, SlidersHorizontal, FileText } from 'lucide-react';

export const Dashboard = () => {
  const { selectedPlantId, dateRange } = useFilter();
  const navigate = useNavigate();

  // Convert dateRange string to days count for backend API
  const getDaysFromFilter = (range) => {
    switch (range) {
      case 'today': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case 'this_month': return 30;
      case 'last_month': return 60;
      default: return 30;
    }
  };

  const days = getDaysFromFilter(dateRange);
  const plantParam = selectedPlantId === 'all' ? null : selectedPlantId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const res = await getDashboardOverview(plantParam, days);
    setLoading(false);
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPlantId, dateRange]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Quick Action Shortcuts */}
      <PageHeader
        title="Industrial Carbon Overview"
        subtitle="Real-time CO₂ emission tracking, ensemble predictive analytics, and plant performance KPIs"
        badge={
          <Badge variant="healthy" dot>
            System Operational
          </Badge>
        }
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={fetchData}
        >
          Refresh Data
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={SlidersHorizontal}
          onClick={() => navigate('/what-if')}
        >
          Run What-If
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={Cpu}
          onClick={() => navigate('/prediction-test')}
        >
          New Prediction
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="Unable to load dashboard analytics"
          action={
            <Button variant="outline" size="sm" onClick={fetchData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <LoadingState message="Fetching real-time industrial telemetry & carbon metrics..." type="card" />
      )}

      {/* Main Dashboard Payload */}
      {data && (
        <div className="space-y-6">
          {/* 2. Key Performance Indicators (KPI Grid) */}
          <KPIGrid kpis={data.kpis} />

          {/* 3. Main CO2 Emission & Production Trend */}
          <EmissionTrendChart trends={data.trends} />

          {/* 4. Prediction vs Actual & Resource Consumption Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <PredictionVsActualChart trends={data.trends} />
            </div>
            <div className="lg:col-span-6">
              <ConsumptionChart trends={data.trends} />
            </div>
          </div>

          {/* 5. Intensity Trends & Key Feature Drivers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <EmissionIntensityChart trends={data.trends} />
            </div>
            <div className="lg:col-span-6">
              <FeatureImportanceCard shapDrivers={data.shap_drivers} />
            </div>
          </div>

          {/* 6. Recent Prediction Lifecycle Audit History */}
          <RecentPredictions />

          {/* 7. Model Performance, Data Quality & What-if Quick Entry Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
