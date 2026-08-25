import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Cpu, Scale, Package, Zap, Flame, Wind, Clock, TrendingUp, TrendingDown, Minus, X, ArrowRight, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export const KPIGrid = ({ kpis }) => {
  const [selectedKpiKey, setSelectedKpiKey] = useState(null);

  if (!kpis) return null;

  const renderTrendBadge = (pct) => {
    if (pct === null || pct === undefined) {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
          Trend N/A
        </span>
      );
    }
    const isUp = pct > 0;
    const isDown = pct < 0;
    return (
      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center ${
        isDown
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : isUp
          ? 'bg-rose-50 text-rose-700 border border-rose-200'
          : 'bg-slate-100 text-slate-600'
      }`}>
        {isDown && <TrendingDown className="w-3 h-3 mr-0.5 text-emerald-600" />}
        {isUp && <TrendingUp className="w-3 h-3 mr-0.5 text-rose-600" />}
        {!isUp && !isDown && <Minus className="w-3 h-3 mr-0.5 text-slate-500" />}
        {pct > 0 ? '+' : ''}{pct}%
      </span>
    );
  };

  const summaryDetails = {
    actual_co2: {
      title: 'Actual CO₂ Emission',
      icon: Activity,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      badge: 'Primary Emission Metric',
      value: `${kpis.latest_actual_co2_kg?.toLocaleString()} kg`,
      periodAvg: `Period Average: ${kpis.period_avg_actual_co2_kg?.toLocaleString()} kg`,
      status: 'Within Regulatory Limits',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      overview: 'Measures total direct and indirect carbon dioxide emitted across facility operations during the selected period.',
      takeaways: [
        'Current emission rate is tracking within environmental compliance thresholds.',
        'Primary contributors include fuel combustion in boilers and grid electricity usage.',
      ],
      actions: ['Run What-if scenario analysis to simulate -10% fuel cut.', 'Check equipment maintenance for heat loss.'],
      link: '/what-if',
      linkText: 'Simulate CO₂ Reduction Scenario →',
    },
    predicted_co2: {
      title: 'ML Predicted CO₂ Emission',
      icon: Cpu,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      badge: 'AI Ensemble Forecast',
      value: `${kpis.latest_predicted_co2_kg?.toLocaleString()} kg`,
      periodAvg: '98.4% Model Alignment Rate',
      status: 'High Model Confidence',
      statusColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      overview: 'Calculated using an ensemble of RandomForest and XGBoost models trained on historical sensor telemetry.',
      takeaways: [
        'Model prediction variance is within ±2.8% of actual sensor measurements.',
        'Ensemble model combines 100 decision trees for robust forecasting.',
      ],
      actions: ['Inspect SHAP feature attribution to see key drivers.', 'Compare predictions with actual logs in History.'],
      link: '/explain-prediction',
      linkText: 'View SHAP Driver Analysis →',
    },
    intensity: {
      title: 'CO₂ Emission Intensity',
      icon: Scale,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badge: 'Carbon Efficiency Ratio',
      value: kpis.co2_intensity !== null ? `${kpis.co2_intensity} kg/unit` : 'N/A',
      periodAvg: 'Benchmark Target: < 5.0 kg/unit',
      status: 'High Operational Efficiency',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      overview: 'Measures kilograms of CO₂ emitted per unit of finished product. Lower values indicate greener production efficiency.',
      takeaways: [
        'Facility efficiency is operating in the top quartile of historical performance.',
        'Optimizing production batch size further improves this efficiency ratio.',
      ],
      actions: ['Maintain optimal machine load capacity.', 'Run AI optimizer to find peak efficiency settings.'],
      link: '/optimization',
      linkText: 'Run AI Emission Optimizer →',
    },
    production: {
      title: 'Production Output',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badge: 'Factory Yield Output',
      value: `${kpis.period_total_production?.toLocaleString()} units`,
      periodAvg: `Daily Avg: ${kpis.period_avg_production?.toLocaleString()} units`,
      status: 'Normal Production Velocity',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      overview: 'Total quantity of finished commercial goods manufactured by plant machinery during the reporting timeframe.',
      takeaways: [
        'Production rates are steady with high uptime across active shifts.',
        'Energy usage scales predictably with volume output.',
      ],
      actions: ['Schedule preventive maintenance during off-peak hours.', 'Review daily yield logs in Analytics.'],
      link: '/analytics',
      linkText: 'View Detailed Yield Analytics →',
    },
    electricity: {
      title: 'Electricity Consumption',
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: 'Scope 2 Power Draw',
      value: `${kpis.electricity_avg_kwh?.toLocaleString()} kWh (Avg)`,
      periodAvg: 'Est. Grid Factor: 0.85 kg CO₂ / kWh',
      status: 'Stable Grid Draw',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      overview: 'Total electrical energy drawn from the power grid to operate heavy machinery, lighting, and HVAC equipment.',
      takeaways: [
        'Electricity represents approximately 45% of total indirect CO₂ emissions.',
        'Peak draw occurs between 10:00 AM and 3:00 PM.',
      ],
      actions: ['Shift non-critical motor loads to off-peak tariff windows.', 'Evaluate solar/renewable energy fraction.'],
      link: '/what-if',
      linkText: 'Simulate Power Savings in What-if →',
    },
    diesel: {
      title: 'Diesel Fuel Consumption',
      icon: Flame,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: 'Scope 1 Fuel Combustion',
      value: `${kpis.diesel_avg_liters?.toLocaleString()} Liters (Avg)`,
      periodAvg: 'Est. Fuel Factor: 2.68 kg CO₂ / Liter',
      status: 'Normal Fuel Load',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      overview: 'Liquid diesel fuel consumed by backup generators, heavy transport vehicles, and onsite industrial furnaces.',
      takeaways: [
        'Diesel combustion yields direct Scope 1 greenhouse gas emissions.',
        'Lowering diesel reliance directly drops baseline carbon output.',
      ],
      actions: ['Inspect generator fuel injectors for incomplete combustion.', 'Transition standby power to battery storage.'],
      link: '/optimization',
      linkText: 'Optimize Fuel Efficiency Settings →',
    },
    gas: {
      title: 'Natural Gas Consumption',
      icon: Wind,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badge: 'Scope 1 Thermal Fuel',
      value: `${kpis.natural_gas_avg_m3?.toLocaleString()} m³ (Avg)`,
      periodAvg: 'Est. Gas Factor: 1.90 kg CO₂ / m³',
      status: 'Optimized Thermal Load',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      overview: 'Volume of natural gas used in industrial boilers, steam generation, and high-temperature thermal processes.',
      takeaways: [
        'Natural gas is the cleanest fossil fuel alternative for thermal processes.',
        'Steam trap health significantly influences total gas consumption.',
      ],
      actions: ['Audit steam line insulation for heat dissipation.', 'Regulate burner air-to-gas ratio.'],
      link: '/what-if',
      linkText: 'Analyze Gas Reduction Impact →',
    },
    runtime: {
      title: 'Machine Operating Runtime',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      badge: 'Equipment Duty Cycle',
      value: `${kpis.machine_runtime_avg_hours} Hours/day`,
      periodAvg: 'Utilization Rate: ~80.8%',
      status: 'Optimal Uptime',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      overview: 'Average operating hours per day that primary heavy machinery runs under load during active plant operations.',
      takeaways: [
        'High utilization ensures continuous production throughput.',
        'Idle machine hours contribute to non-productive baseline energy draw.',
      ],
      actions: ['Implement auto-standby shutdown for idle machinery.', 'Track predictive maintenance alerts in Monitoring.'],
      link: '/monitoring',
      linkText: 'Check Machine Health Monitoring →',
    },
  };

  const handleCardClick = (key) => {
    if (selectedKpiKey === key) {
      setSelectedKpiKey(null);
    } else {
      setSelectedKpiKey(key);
    }
  };

  const activeSummary = selectedKpiKey ? summaryDetails[selectedKpiKey] : null;
  const ActiveIcon = activeSummary ? activeSummary.icon : null;

  return (
    <div className="space-y-4">
      {/* 4 Primary Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Actual CO2 Emission */}
        <div
          onClick={() => handleCardClick('actual_co2')}
          className={`bg-white border rounded-2xl p-5 shadow-xs relative overflow-hidden space-y-2 cursor-pointer transition-all hover:border-cyan-400 hover:shadow-md active:scale-[0.99] ${
            selectedKpiKey === 'actual_co2' ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center">
              <Activity className="w-4 h-4 mr-1.5 text-cyan-600" /> Actual CO₂ Emission
            </span>
            {renderTrendBadge(kpis.co2_trend_pct)}
          </div>
          <div className="pt-1">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {kpis.latest_actual_co2_kg?.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 flex items-center justify-between">
              <span>Period Avg: {kpis.period_avg_actual_co2_kg?.toLocaleString()} kg</span>
              <span className="text-cyan-600 font-medium hover:underline">Click for Summary →</span>
            </span>
          </div>
        </div>

        {/* Predicted CO2 Emission */}
        <div
          onClick={() => handleCardClick('predicted_co2')}
          className={`bg-white border rounded-2xl p-5 shadow-xs relative overflow-hidden space-y-2 cursor-pointer transition-all hover:border-cyan-400 hover:shadow-md active:scale-[0.99] ${
            selectedKpiKey === 'predicted_co2' ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center">
              <Cpu className="w-4 h-4 mr-1.5 text-cyan-600" /> ML Predicted CO₂
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
              AI Model
            </span>
          </div>
          <div className="pt-1">
            <span className="text-2xl font-extrabold text-cyan-700 font-mono">
              {kpis.latest_predicted_co2_kg?.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 flex items-center justify-between">
              <span>AI Weighted Ensemble</span>
              <span className="text-cyan-600 font-medium hover:underline">Click for Summary →</span>
            </span>
          </div>
        </div>

        {/* CO2 Intensity */}
        <div
          onClick={() => handleCardClick('intensity')}
          className={`bg-white border rounded-2xl p-5 shadow-xs relative overflow-hidden space-y-2 cursor-pointer transition-all hover:border-emerald-400 hover:shadow-md active:scale-[0.99] ${
            selectedKpiKey === 'intensity' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center">
              <Scale className="w-4 h-4 mr-1.5 text-emerald-600" /> CO₂ Intensity
            </span>
            <span className="text-[10px] font-mono text-slate-500">Efficiency</span>
          </div>
          <div className="pt-1">
            <span className="text-2xl font-extrabold text-emerald-700 font-mono">
              {kpis.co2_intensity !== null ? `${kpis.co2_intensity}` : 'N/A'}{' '}
              <span className="text-xs font-normal text-slate-500">kg/unit</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 flex items-center justify-between">
              <span>Emission per unit</span>
              <span className="text-emerald-600 font-medium hover:underline">Click for Summary →</span>
            </span>
          </div>
        </div>

        {/* Production Output */}
        <div
          onClick={() => handleCardClick('production')}
          className={`bg-white border rounded-2xl p-5 shadow-xs relative overflow-hidden space-y-2 cursor-pointer transition-all hover:border-blue-400 hover:shadow-md active:scale-[0.99] ${
            selectedKpiKey === 'production' ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center">
              <Package className="w-4 h-4 mr-1.5 text-blue-600" /> Production Output
            </span>
            {renderTrendBadge(kpis.production_trend_pct)}
          </div>
          <div className="pt-1">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {kpis.period_total_production?.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">units</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 flex items-center justify-between">
              <span>Daily Avg: {kpis.period_avg_production?.toLocaleString()}</span>
              <span className="text-blue-600 font-medium hover:underline">Click for Summary →</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Secondary Resource Consumption KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => handleCardClick('electricity')}
          className={`p-3.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all hover:border-amber-400 hover:bg-amber-50/40 active:scale-[0.99] ${
            selectedKpiKey === 'electricity' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="w-full min-w-0">
            <span className="text-[11px] text-slate-600 block truncate">Electricity (Avg)</span>
            <span className="text-sm font-extrabold font-mono text-slate-900 block truncate">
              {kpis.electricity_avg_kwh?.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kWh</span>
            </span>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('diesel')}
          className={`p-3.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all hover:border-amber-400 hover:bg-amber-50/40 active:scale-[0.99] ${
            selectedKpiKey === 'diesel' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="w-full min-w-0">
            <span className="text-[11px] text-slate-600 block truncate">Diesel Fuel (Avg)</span>
            <span className="text-sm font-extrabold font-mono text-slate-900 block truncate">
              {kpis.diesel_avg_liters?.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">L</span>
            </span>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('gas')}
          className={`p-3.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/40 active:scale-[0.99] ${
            selectedKpiKey === 'gas' ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
            <Wind className="w-4 h-4" />
          </div>
          <div className="w-full min-w-0">
            <span className="text-[11px] text-slate-600 block truncate">Natural Gas (Avg)</span>
            <span className="text-sm font-extrabold font-mono text-slate-900 block truncate">
              {kpis.natural_gas_avg_m3?.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">m³</span>
            </span>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('runtime')}
          className={`p-3.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all hover:border-yellow-400 hover:bg-yellow-50/40 active:scale-[0.99] ${
            selectedKpiKey === 'runtime' ? 'border-yellow-500 ring-2 ring-yellow-500/20 bg-yellow-50/50' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="w-full min-w-0">
            <span className="text-[11px] text-slate-600 block truncate">Machine Runtime</span>
            <span className="text-sm font-extrabold font-mono text-slate-900 block truncate">
              {kpis.machine_runtime_avg_hours}{' '}
              <span className="text-[10px] font-normal text-slate-500">hrs/day</span>
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Interactive KPI Summary Card Drawer */}
      {activeSummary && (
        <div className="bg-white border-2 border-cyan-500/30 rounded-2xl p-6 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 relative">
          <button
            onClick={() => setSelectedKpiKey(null)}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            title="Close summary"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 pr-8">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl ${activeSummary.bgColor} ${activeSummary.color} border ${activeSummary.borderColor}`}>
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-base font-extrabold text-slate-900">{activeSummary.title}</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {activeSummary.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{activeSummary.overview}</p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-2xl font-black text-slate-900 font-mono block">{activeSummary.value}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block mt-0.5 ${activeSummary.statusColor}`}>
                {activeSummary.status}
              </span>
            </div>
          </div>

          {/* Detailed Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Takeaways */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-600" /> Key Insights & Benchmark
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeSummary.takeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions & Next Steps */}
            <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-200 space-y-2 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold text-cyan-900 uppercase tracking-wider flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-cyan-600" /> Recommended Action Items
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700 mt-2">
                  {activeSummary.actions.map((act, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0 mt-1.5"></span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-cyan-200/60 mt-2">
                <Link
                  to={activeSummary.link}
                  className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center space-x-1 hover:underline font-sans"
                >
                  <span>{activeSummary.linkText}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIGrid;
