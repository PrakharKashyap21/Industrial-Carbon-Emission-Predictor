import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileSpreadsheet, RefreshCw, LayoutGrid, TrendingUp, Layers, Activity } from 'lucide-react';
import {
  getOverview,
  getEmissionTrend,
  getEmissionIntensity,
  getFeatures,
  getAnomalies,
  getOptimizationImpact,
  getInsights,
  getPlantComparison,
} from '../services/analyticsApi';
import { useFilter } from '../context/FilterContext';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import LoadingState from '../components/ui/LoadingState';
import Tabs from '../components/ui/Tabs';

import KPIOverview from '../components/analytics/KPIOverview';
import EmissionTrend from '../components/analytics/EmissionTrend';
import ProductionTrend from '../components/analytics/ProductionTrend';
import EmissionIntensity from '../components/analytics/EmissionIntensity';
import FeatureTrend from '../components/analytics/FeatureTrend';
import AnomalyTimeline from '../components/analytics/AnomalyTimeline';
import ModelInsightsWidget from '../components/analytics/ModelInsights';
import OptimizationImpact from '../components/analytics/OptimizationImpact';
import IndustrialInsights from '../components/analytics/IndustrialInsights';
import PlantComparison from '../components/analytics/PlantComparison';

export const Analytics = () => {
  const { selectedPlantId, dateRange } = useFilter();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics Data States
  const [overview, setOverview] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [intensityData, setIntensityData] = useState(null);
  const [featureData, setFeatureData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [plantComparison, setPlantComparison] = useState(null);

  const getDaysFromFilter = (range) => {
    switch (range) {
      case 'today': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '365d': return 365;
      case 'this_month': return 30;
      case 'last_month': return 60;
      default: return 30;
    }
  };

  const days = getDaysFromFilter(dateRange);
  const plantIdParam = selectedPlantId === 'all' ? null : selectedPlantId;

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);

    const params = { days, plant_id: plantIdParam };

    const [
      ovRes,
      trRes,
      intRes,
      ftRes,
      anRes,
      optRes,
      insRes,
      plRes,
    ] = await Promise.all([
      getOverview(params),
      getEmissionTrend(params),
      getEmissionIntensity(params),
      getFeatures(params),
      getAnomalies(params),
      getOptimizationImpact({ plant_id: plantIdParam }),
      getInsights(params),
      getPlantComparison({ days }),
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
    if (plRes.success) setPlantComparison(plRes.data);
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, [selectedPlantId, dateRange]);

  const tabs = [
    { id: 'overview', label: 'OVERVIEW & KPIS', icon: LayoutGrid },
    { id: 'emissions', label: 'EMISSION TRENDS', icon: TrendingUp },
    { id: 'production', label: 'PRODUCTION & INTENSITY', icon: Layers },
    { id: 'drivers', label: 'ANOMALIES & DRIVERS', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Industrial Carbon Analytics & Trends"
        subtitle="Analyze production-normalized emission intensity (kg CO₂ / unit), time-series trends, feature correlations, and anomaly timelines."
        badge={
          <Badge variant="info" dot>
            Telemetry Analytics
          </Badge>
        }
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={fetchAllAnalytics}
        >
          Refresh
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={FileSpreadsheet}
          onClick={() => navigate('/reports')}
        >
          Export Report
        </Button>
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Unable to load analytics data">
          {error}
        </Alert>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <LoadingState message="Processing multi-plant carbon telemetry analytics..." type="card" />
      ) : (
        <div className="space-y-6">
          {/* Tab 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <KPIOverview overview={overview} />
              <PlantComparison plantData={plantComparison} />
              <IndustrialInsights insights={insights} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EmissionTrend trendData={trendData} />
                <ProductionTrend trendData={trendData} />
              </div>
            </div>
          )}

          {/* Tab 2: EMISSION TRENDS */}
          {activeTab === 'emissions' && (
            <div className="space-y-6">
              <EmissionTrend trendData={trendData} />
              <OptimizationImpact optimizationData={optimizationData} />
            </div>
          )}

          {/* Tab 3: PRODUCTION & INTENSITY */}
          {activeTab === 'production' && (
            <div className="space-y-6">
              <ProductionTrend trendData={trendData} />
              <EmissionIntensity intensityData={intensityData} />
            </div>
          )}

          {/* Tab 4: ANOMALIES & DRIVERS */}
          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeatureTrend featureData={featureData} />
                <AnomalyTimeline anomalyData={anomalyData} />
              </div>
              <ModelInsightsWidget />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
