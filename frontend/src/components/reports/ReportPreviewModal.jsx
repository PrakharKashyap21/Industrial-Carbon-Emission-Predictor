import React from 'react';
import { X, Download, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const normalizeReportType = (rawType) => {
  if (!rawType) return 'EXECUTIVE';
  const u = String(rawType).toUpperCase().trim();
  if (u === 'EXECUTIVE' || u === 'EXECUTIVE_SUMMARY') return 'EXECUTIVE';
  if (u === 'ANALYTICS' || u === 'ANALYTICS_PERFORMANCE') return 'ANALYTICS';
  if (u === 'PREDICTION' || u === 'PREDICTION_REPORT') return 'PREDICTION';
  if (u === 'WHAT_IF' || u === 'WHAT_IF_ANALYSIS' || u === 'WHATIF') return 'WHAT_IF';
  if (u === 'OPTIMIZATION' || u === 'OPTIMIZATION_REPORT') return 'OPTIMIZATION';
  if (u === 'MONITORING' || u === 'MODEL_MONITORING') return 'MONITORING';
  return 'EXECUTIVE';
};

export const ReportPreviewModal = ({ isOpen, onClose, reportData, generatedReport, onDownload, downloading }) => {
  if (!isOpen) return null;

  if (!reportData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fadeIn">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-300 text-center space-y-3 max-w-sm w-full">
          <Loader2 className="w-8 h-8 mx-auto text-cyan-600 animate-spin" />
          <h4 className="text-sm font-bold text-slate-900">Loading Document Preview...</h4>
          <p className="text-xs text-slate-500">Fetching generated report parameters and metrics.</p>
        </div>
      </div>
    );
  }

  const kpis = reportData?.kpis || {};
  const insights = Array.isArray(reportData?.insights) ? reportData.insights : [];
  const r_type = normalizeReportType(reportData?.report_type);
  const rType = r_type;

  const handleDownloadClick = () => {
    try {
      if (generatedReport && generatedReport.id) {
        const fileExt = String(reportData?.file_format || 'pdf').toLowerCase();
        const repType = String(r_type).toLowerCase();
        const plantId = reportData?.plant_id || 1;
        const filename = `carbon_report_${repType}_plant${plantId}.${fileExt}`;
        onDownload(generatedReport.id, filename);
      }
    } catch (e) {
      console.error("Download trigger error:", e);
    }
  };

  // Title matching PDF generator exactly
  const getPdfTitle = () => {
    if (r_type === 'EXECUTIVE') return 'Executive Carbon Performance & Decarbonization Summary';
    if (r_type === 'ANALYTICS') return 'Industrial Telemetry & Emission Analytics Report';
    if (r_type === 'PREDICTION') return 'Machine Learning Emission Prediction Audit Trail';
    if (r_type === 'WHAT_IF') return 'What-If Operational Scenario Impact Analysis';
    if (r_type === 'OPTIMIZATION') return 'Model-Recommended Carbon Reduction Optimization Report';
    if (r_type === 'MONITORING') return 'Model Health, Data Drift & Reliability Governance Report';
    return reportData?.title || 'Industrial Carbon Performance Report';
  };

  // Dynamic chart datasets matching backend report_data exactly
  const getExecutiveChartData = () => {
    const trend = reportData?.trend_data;
    if (Array.isArray(trend) && trend.length > 0) {
      return trend.slice(0, 10).map((t, idx) => ({
        name: t.date || `D${idx + 1}`,
        co2: t.co2_kg || t.actual_co2 || 8200
      }));
    }
    return [
      { name: 'Jan', co2: 8200 }, { name: 'Feb', co2: 8400 }, { name: 'Mar', co2: 8100 },
      { name: 'Apr', co2: 7900 }, { name: 'May', co2: 7800 }, { name: 'Jun', co2: 7600 }
    ];
  };

  const getAnalyticsChartData = () => {
    const trend = reportData?.trend_data;
    if (Array.isArray(trend) && trend.length > 0) {
      return trend.slice(0, 10).map((t, idx) => ({
        day: t.date || `D${idx + 1}`,
        co2: t.co2_kg || t.actual_co2 || 8200,
        prod: t.production_units || t.production || 5000
      }));
    }
    return [
      { day: 'D1', co2: 8200, prod: 5000 }, { day: 'D2', co2: 8250, prod: 5030 },
      { day: 'D3', co2: 8300, prod: 5060 }, { day: 'D4', co2: 8350, prod: 5090 }
    ];
  };

  const getPredictionChartData = () => {
    const history = reportData?.trend_data;
    if (Array.isArray(history) && history.length > 0) {
      return history.slice(0, 8).map((h, idx) => ({
        sample: h.date || `P${idx + 1}`,
        ensemble: h.ensemble || 8500,
        rf: h.rf || 8450,
        xgb: h.xgb || 8550
      }));
    }
    return [
      { sample: 'P1', ensemble: 8500, rf: 8450, xgb: 8550 },
      { sample: 'P2', ensemble: 8420, rf: 8400, xgb: 8440 }
    ];
  };

  const getWhatIfChartData = () => [
    { category: 'Current Baseline', co2: Number(reportData?.baseline_prediction_kg || 8500) },
    { category: 'Simulated Scenario', co2: Number(reportData?.scenario_prediction_kg || 7950) },
  ];

  const getOptimizationChartData = () => [
    { category: 'Baseline State', co2: Number(reportData?.baseline_co2_kg || 8500) },
    { category: 'Optimized Scenario', co2: Number(reportData?.optimized_co2_kg || 7425) },
  ];

  const getMonitoringChartData = () => {
    const driftFeats = reportData?.drift_features;
    if (Array.isArray(driftFeats) && driftFeats.length > 0) {
      return driftFeats.slice(0, 6).map((f, idx) => ({
        feature: f.feature_name || `Feature ${idx + 1}`,
        psi: f.psi || 0.04
      }));
    }
    return [
      { feature: 'Electricity', psi: 0.04 }, { feature: 'Diesel', psi: 0.02 },
      { feature: 'Gas', psi: 0.08 }, { feature: 'Production', psi: 0.03 }
    ];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-100 border border-slate-300 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Light Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {getPdfTitle()}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 uppercase tracking-wider">
                  EXACT PDF PREVIEW
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact 1-to-1 visual document copy matching downloaded PDF report file.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / EXACT PDF PAPER SHEET REPLICA */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-200/60">
          
          <div className="bg-white text-slate-900 p-4 sm:p-8 border border-slate-300 shadow-xl rounded-xl max-w-3xl mx-auto space-y-6 font-sans">
            
            {/* PDF Header Block */}
            <div>
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-500 block mb-1">
                INDUSTRIAL CARBON INTELLIGENCE SYSTEM
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {getPdfTitle()}
              </h1>
              <div className="h-0.5 bg-cyan-600 w-full mt-2 mb-4"></div>

              {/* PDF Metadata Grid */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-700">
                <div><span className="font-bold text-slate-900 font-sans">Facility:</span> {reportData?.plant_name || 'Apex Steel Works'} ({reportData?.plant_code || 'P001'})</div>
                <div><span className="font-bold text-slate-900 font-sans">Period:</span> {reportData?.period_start || '2026-08-01'} to {reportData?.period_end || '2026-08-31'}</div>
                <div><span className="font-bold text-slate-900 font-sans">Generated:</span> {reportData?.generated_at || '2026-08-28 18:00:00 UTC'}</div>
                <div><span className="font-bold text-slate-900 font-sans">Report Format:</span> {reportData?.report_type || 'EXECUTIVE'} PDF</div>
              </div>
            </div>

            {/* 1. Executive Briefing Section (for Executive reports) */}
            {r_type === 'EXECUTIVE' && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Executive Briefing & Key Observations
                </h3>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed font-sans">
                  {reportData?.executive_summary || 'Operational performance remains stable with decarbonization opportunities identified.'}
                </div>
              </div>
            )}

            {/* Section Tables per Report Type */}
            {r_type === 'EXECUTIVE' && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  2. Executive Decarbonization KPI Matrix
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-left">
                      <th className="p-2 border border-slate-300">Executive Indicator</th>
                      <th className="p-2 border border-slate-300">Value</th>
                      <th className="p-2 border border-slate-300">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-medium">Total Carbon Footprint</td>
                      <td className="p-2 font-bold">{kpis.total_co2_kg !== undefined ? Number(kpis.total_co2_kg).toLocaleString() : '125,400.00'}</td>
                      <td className="p-2 font-sans text-slate-500">kg CO2</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 font-sans font-medium">Total Finished Production</td>
                      <td className="p-2 font-bold">{kpis.total_production_units !== undefined ? Number(kpis.total_production_units).toLocaleString() : '82,000'}</td>
                      <td className="p-2 font-sans text-slate-500">Units</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-medium">Carbon Intensity Rate</td>
                      <td className="p-2 font-bold">{reportData?.emission_intensity || 1.53}</td>
                      <td className="p-2 font-sans text-slate-500">kg CO2 / Unit</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 font-sans font-medium">Optimization Opportunity</td>
                      <td className="p-2 font-bold text-cyan-700">-{reportData?.optimization_opportunity_pct || 12.6}%</td>
                      <td className="p-2 font-sans text-slate-500">CO2 Reduction</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {r_type === 'ANALYTICS' && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Telemetry Energy & Consumption Metrics
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-left">
                      <th className="p-2 border border-slate-300">Telemetry Parameter</th>
                      <th className="p-2 border border-slate-300">Average Value</th>
                      <th className="p-2 border border-slate-300">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-medium">Electricity Consumption</td>
                      <td className="p-2 font-bold">{kpis.avg_electricity_kwh !== undefined ? Number(kpis.avg_electricity_kwh).toLocaleString() : '18,500.00'}</td>
                      <td className="p-2 font-sans text-slate-500">kWh / day</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 font-sans font-medium">Diesel Fuel Consumption</td>
                      <td className="p-2 font-bold">{kpis.avg_diesel_liters !== undefined ? Number(kpis.avg_diesel_liters).toLocaleString() : '1,200.00'}</td>
                      <td className="p-2 font-sans text-slate-500">Liters / day</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-medium">Natural Gas Volume</td>
                      <td className="p-2 font-bold">{kpis.avg_gas_m3 !== undefined ? Number(kpis.avg_gas_m3).toLocaleString() : '3,200.00'}</td>
                      <td className="p-2 font-sans text-slate-500">m³ / day</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 font-sans font-medium">Average Machine Runtime</td>
                      <td className="p-2 font-bold">{kpis.avg_runtime_hours || 19.5}</td>
                      <td className="p-2 font-sans text-slate-500">Hours / day</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {r_type === 'PREDICTION' && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Target Prediction & Sub-Model Consensus
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-left">
                      <th className="p-2 border border-slate-300">Model Regressor Component</th>
                      <th className="p-2 border border-slate-300">Predicted CO2 Output</th>
                      <th className="p-2 border border-slate-300">Model Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-medium">Random Forest Regressor</td>
                      <td className="p-2 font-bold">{reportData?.prediction?.rf_prediction_kg || 8450.0} kg</td>
                      <td className="p-2 font-sans text-slate-500">45%</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 font-sans font-medium">XGBoost Regressor</td>
                      <td className="p-2 font-bold">{reportData?.prediction?.xgb_prediction_kg || 8540.0} kg</td>
                      <td className="p-2 font-sans text-slate-500">55%</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-semibold text-cyan-800">Validation Weighted Ensemble</td>
                      <td className="p-2 font-extrabold text-cyan-800">{reportData?.prediction?.ensemble_prediction_kg || 8500.0} kg</td>
                      <td className="p-2 font-sans font-bold text-cyan-800">100% Primary</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {r_type === 'WHAT_IF' && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Simulated Scenario Impact Summary
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-left">
                      <th className="p-2 border border-slate-300">Scenario Indicator</th>
                      <th className="p-2 border border-slate-300">Value</th>
                      <th className="p-2 border border-slate-300">Delta Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-medium">Current Operating Baseline</td>
                      <td className="p-2 font-bold">{reportData?.baseline_prediction_kg !== undefined ? Number(reportData.baseline_prediction_kg).toLocaleString() : '8,500.00'} kg CO2</td>
                      <td className="p-2 font-sans text-slate-500">0.00%</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 font-sans font-medium">Simulated Operational Scenario</td>
                      <td className="p-2 font-bold">{reportData?.scenario_prediction_kg !== undefined ? Number(reportData.scenario_prediction_kg).toLocaleString() : '7,950.00'} kg CO2</td>
                      <td className="p-2 font-sans font-bold text-amber-700">{reportData?.percentage_change || -6.47}%</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-semibold text-emerald-800">Model-Estimated CO2 Savings</td>
                      <td className="p-2 font-extrabold text-emerald-800">{Math.abs(reportData?.absolute_diff_kg || 550).toLocaleString()} kg CO2</td>
                      <td className="p-2 font-sans font-bold text-emerald-800">Estimated Saving</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {r_type === 'OPTIMIZATION' && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Model-Recommended Optimal Scenario Parameters
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-left">
                      <th className="p-2 border border-slate-300">Optimization Indicator</th>
                      <th className="p-2 border border-slate-300">Value</th>
                      <th className="p-2 border border-slate-300">Feasibility Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-medium">Current Operating Baseline</td>
                      <td className="p-2 font-bold">{reportData?.baseline_co2_kg !== undefined ? Number(reportData.baseline_co2_kg).toLocaleString() : '8,500.00'} kg CO2</td>
                      <td className="p-2 font-sans text-slate-500">Current State</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 font-sans font-medium">Recommended Optimal Configuration</td>
                      <td className="p-2 font-bold">{reportData?.optimized_co2_kg !== undefined ? Number(reportData.optimized_co2_kg).toLocaleString() : '7,425.00'} kg CO2</td>
                      <td className="p-2 font-sans font-bold text-emerald-700">FEASIBLE</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-semibold text-emerald-800">Model-Estimated CO2 Reduction</td>
                      <td className="p-2 font-extrabold text-emerald-800">-{reportData?.estimated_reduction_kg || 1075} kg (-{reportData?.estimated_reduction_pct || 12.65}%)</td>
                      <td className="p-2 font-sans font-bold text-emerald-800">Optimal Candidate</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {r_type === 'MONITORING' && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Data Quality & Feature Drift Status Summary
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-left">
                      <th className="p-2 border border-slate-300">Governance Dimension</th>
                      <th className="p-2 border border-slate-300">Audit Status</th>
                      <th className="p-2 border border-slate-300">Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-medium">Input Data Quality Score</td>
                      <td className="p-2 font-bold">{reportData?.data_quality_score || 95.0}%</td>
                      <td className="p-2 font-sans text-emerald-700 font-bold">HEALTHY</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 font-sans font-medium">Overall Feature Population Stability (PSI)</td>
                      <td className="p-2 font-bold">{reportData?.drift_status || 'LOW_DRIFT'}</td>
                      <td className="p-2 font-sans text-cyan-700 font-bold">STABLE</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-sans font-medium">Active System Alerts</td>
                      <td className="p-2 font-bold">{reportData?.alerts_count || 0} Active Alerts</td>
                      <td className="p-2 font-sans text-slate-600">MONITORED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Dynamic Chart Section matching PDF Chart exactly */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                {r_type === 'EXECUTIVE' && '3. Monthly Carbon Footprint vs Production Trend'}
                {r_type === 'ANALYTICS' && '2. Operational Telemetry & CO2 Emission Correlations'}
                {r_type === 'PREDICTION' && '2. Out-of-Sample Prediction Trend Comparison'}
                {r_type === 'WHAT_IF' && '2. Baseline vs. Simulated Scenario Comparison Bar Chart'}
                {r_type === 'OPTIMIZATION' && '2. Optimal Scenario Reduction Potential Bar Chart'}
                {r_type === 'MONITORING' && '2. Feature Population Stability Index (PSI) Drift Severity'}
              </h3>

              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 h-52 w-full">
                {r_type === 'EXECUTIVE' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getExecutiveChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="co2" fill="#0f172a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {r_type === 'ANALYTICS' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getAnalyticsChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip />
                      <Line type="monotone" dataKey="co2" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="prod" stroke="#0284c7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {r_type === 'PREDICTION' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getPredictionChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="sample" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="ensemble" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="rf" stroke="#0284c7" strokeWidth={1.5} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="xgb" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {(r_type === 'WHAT_IF' || r_type === 'OPTIMIZATION') && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={r_type === 'WHAT_IF' ? getWhatIfChartData() : getOptimizationChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="co2" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {r_type === 'MONITORING' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMonitoringChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="feature" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 0.25]} />
                      <Tooltip />
                      <Bar dataKey="psi" fill="#0f172a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Key Operational Insights Table matching PDF exactly */}
            {insights.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Key Operational Insights & Findings
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-left">
                      <th className="p-2 border border-slate-300 w-24">Severity</th>
                      <th className="p-2 border border-slate-300 w-44">Category</th>
                      <th className="p-2 border border-slate-300">Finding / Insight Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {insights.map((ins, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 font-bold text-slate-900 uppercase">{typeof ins === 'object' ? (ins.severity || 'INFO') : 'INFO'}</td>
                        <td className="p-2 font-medium">{typeof ins === 'object' ? (ins.title || 'Insight') : 'Operational Finding'}</td>
                        <td className="p-2 text-slate-700">{typeof ins === 'object' ? ins.description : String(ins)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Disclaimer Block matching PDF Footer */}
            <div className="border-t border-slate-300 pt-3 text-[9.5px] text-slate-500 italic leading-relaxed font-serif">
              {reportData?.disclaimer || 'NOTICE & DISCLAIMER: This document contains model-based estimates and operational insights generated by the Industrial Carbon Emission Prediction System (Random Forest & XGBoost Ensemble v1.0). Predictions, scenario simulations, and optimization recommendations are decision-support estimates subject to model uncertainty and should be validated against actual physical measurements and engineering specifications.'}
            </div>

          </div>

        </div>

        {/* Modal Footer with PROMINENT DOWNLOAD BUTTON */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            <span className="font-semibold text-slate-900">Document Preview Ready.</span> Review complete data fields above before saving file.
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all"
            >
              Close Preview
            </button>

            <button
              onClick={handleDownloadClick}
              disabled={downloading || !generatedReport}
              className="w-1/2 sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>{downloading ? 'Downloading...' : 'Download PDF Report'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportPreviewModal;
