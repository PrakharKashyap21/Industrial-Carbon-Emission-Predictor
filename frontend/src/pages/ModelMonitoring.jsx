import React, { useState, useEffect } from 'react';
import {
  getMonitoringOverview,
  getPerformanceMetrics,
  getReliabilityAssessment,
  getMonitoringAlerts,
  runMonitoringCycle,
} from '../services/monitoringApi';
import { useFilter } from '../context/FilterContext';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import LoadingState from '../components/ui/LoadingState';

import DataQualityCard from '../components/monitoring/DataQualityCard';
import DriftCard from '../components/monitoring/DriftCard';
import ModelPerformanceCard from '../components/monitoring/ModelPerformanceCard';
import ReliabilityCard from '../components/monitoring/ReliabilityCard';
import MonitoringAlerts from '../components/monitoring/MonitoringAlerts';
import DriftChart from '../components/monitoring/DriftChart';

import { Activity, Play, RefreshCw, CheckCircle2 } from 'lucide-react';

export const ModelMonitoring = () => {
  const { selectedPlantId, dateRange } = useFilter();

  const [overview, setOverview] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [reliability, setReliability] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [runMsg, setRunMsg] = useState(null);

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
  const plantIdParam = selectedPlantId === 'all' ? null : parseInt(selectedPlantId);

  const fetchMonitoringData = async () => {
    setLoading(true);
    setError(null);
    const params = { days };
    if (plantIdParam) params.plant_id = plantIdParam;

    const [ovRes, perfRes, relRes, alertRes] = await Promise.all([
      getMonitoringOverview(params),
      getPerformanceMetrics(params),
      getReliabilityAssessment(params),
      getMonitoringAlerts({ status: 'active', plant_id: plantIdParam || undefined }),
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
  }, [selectedPlantId, dateRange]);

  const handleRunCycle = async () => {
    setRunning(true);
    setRunMsg(null);
    const params = { days };
    if (plantIdParam) params.plant_id = plantIdParam;

    const res = await runMonitoringCycle(params);
    setRunning(false);
    if (res.success) {
      setRunMsg('System monitoring run executed successfully! Health snapshot updated.');
      fetchMonitoringData();
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Model Health, Data Drift & Reliability Governance"
        subtitle="Track telemetry data quality, feature Population Stability Index (PSI), rolling prediction accuracy, and automated alerts."
        badge={
          <Badge variant="healthy" dot>
            Monitoring Active
          </Badge>
        }
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={fetchMonitoringData}
        >
          Refresh
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={Play}
          isLoading={running}
          onClick={handleRunCycle}
        >
          Run Health Audit Cycle
        </Button>
      </PageHeader>

      {/* Audit Cycle Success Toast */}
      {runMsg && (
        <Alert type="success" title="Health Audit Completed">
          {runMsg}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Unable to load monitoring metrics">
          {error}
        </Alert>
      )}

      {/* Loading Skeleton */}
      {loading && !overview ? (
        <LoadingState message="Checking data drift & model stability metrics..." type="card" />
      ) : (
        overview && (
          <div className="space-y-6">
            {/* Top 4 Monitoring Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DataQualityCard overview={overview} />
              <DriftCard overview={overview} />
              <ModelPerformanceCard overview={overview} performance={performance} />
              <ReliabilityCard reliabilityData={reliability} />
            </div>

            {/* Active System Alerts */}
            <MonitoringAlerts alerts={alerts} onResolve={fetchMonitoringData} />

            {/* Feature Drift Chart */}
            <DriftChart features={overview.drift_features} />
          </div>
        )
      )}
    </div>
  );
};

export default ModelMonitoring;
