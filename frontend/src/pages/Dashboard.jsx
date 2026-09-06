import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardOverview } from '../services/dashboardApi';
import { checkBackendReadiness } from '../services/api';
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
import { RefreshCw, Cpu, SlidersHorizontal, FileText, Loader2 } from 'lucide-react';

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
  const [isWaking, setIsWaking] = useState(false);
  const [wakingInfo, setWakingInfo] = useState(null);
  const [error, setError] = useState(null);

  // Cancellation ref to prevent duplicate concurrent readiness checks
  const activeCheckIdRef = useRef(0);

  const fetchData = async () => {
    const currentCheckId = ++activeCheckIdRef.current;
    setLoading(true);
    setError(null);
    setIsWaking(false);
    setWakingInfo(null);

    // 1. Lightweight readiness check (warm backend returns immediately)
    const readiness = await checkBackendReadiness({
      maxAttempts: 8,
      retryDelayMs: 3500,
      onStatusUpdate: (status) => {
        if (currentCheckId === activeCheckIdRef.current) {
          setIsWaking(status.isWaking);
          setWakingInfo(status);
        }
      },
      isCancelled: () => currentCheckId !== activeCheckIdRef.current,
    });

    if (currentCheckId !== activeCheckIdRef.current) return;

    setIsWaking(false);
    setWakingInfo(null);

    if (!readiness.ready) {
      setLoading(false);
      setError(readiness.error || 'AI Backend service is unavailable.');
      return;
    }

    // 2. Fetch main dashboard overview payload once backend is ready
    const res = await getDashboardOverview(plantParam, days);

    if (currentCheckId !== activeCheckIdRef.current) return;

    setLoading(false);
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      // Increment check ID to cancel pending retries when dependencies change/unmount
      activeCheckIdRef.current++;
    };
  }, [selectedPlantId, dateRange]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Quick Action Shortcuts */}
      <PageHeader
        title="Industrial Carbon Overview"
        subtitle="Real-time CO₂ emission tracking, ensemble predictive analytics, and plant performance KPIs"
        badge={
          <Badge variant={isWaking ? "warning" : error ? "warning" : "healthy"} dot>
            {isWaking ? "Backend Waking..." : error ? "Service Delayed" : "System Operational"}
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

      {/* Render Cold-Start Waking Notice */}
      {isWaking && (
        <Alert
          type="reliability"
          title={wakingInfo?.message || "AI Backend is starting..."}
        >
          <div className="flex items-center gap-2 mt-0.5">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
            <span>{wakingInfo?.detail || "The backend is waking up. This may take a little longer on the first request."}</span>
          </div>
        </Alert>
      )}

      {/* Error Alert */}
      {error && !isWaking && (
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

      {/* Loading Skeleton (Only during initial boot when no data exists yet) */}
      {loading && !data && !isWaking && (
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
