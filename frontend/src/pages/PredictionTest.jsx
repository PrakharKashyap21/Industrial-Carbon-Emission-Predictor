import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictCO2Preview } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import Tabs from '../components/ui/Tabs';
import Tooltip from '../components/ui/Tooltip';

import {
  Zap,
  Flame,
  Wind,
  Package,
  Layers,
  Clock,
  Thermometer,
  Gauge,
  Cpu,
  SlidersHorizontal,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Activity,
  Award,
} from 'lucide-react';

export const PredictionTest = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('energy');

  const [formData, setFormData] = useState({
    plant_id: 1,
    electricity_consumption_kwh: 14500,
    diesel_consumption_liters: 650,
    natural_gas_consumption_m3: 2800,
    production_quantity: 2400,
    raw_material_consumption_kg: 5600,
    machine_runtime_hours: 19.5,
    temperature_c: 28.5,
    pressure_bar: 7.4,
    previous_co2_emission_kg: 6800,
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await predictCO2Preview(formData);
    setLoading(false);

    if (res.success) {
      setPrediction(res.data);
    } else {
      setError(res.error);
    }
  };

  const tabs = [
    { id: 'energy', label: 'ENERGY CONSUMPTION', icon: Zap },
    { id: 'production', label: 'PRODUCTION VOLUME', icon: Package },
    { id: 'operations', label: 'OPERATING CONDITIONS', icon: Clock },
  ];

  // Reliability calculation check
  const getReliability = () => {
    if (!prediction) return { text: 'High', variant: 'healthy' };
    if (formData.machine_runtime_hours > 23 || formData.temperature_c > 60) {
      return { text: 'Moderate (High Operating Range)', variant: 'warning' };
    }
    return { text: 'High (Optimal Feature Range)', variant: 'healthy' };
  };

  const reliability = getReliability();

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="CO₂ Emission Prediction Workflow"
        subtitle="Specify plant operating parameters to compute real-time carbon emissions using the RF + XGBoost Weighted Ensemble Model."
        badge={
          <Badge variant="healthy" dot>
            Model Ready (v1.4)
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Categorized Input Form */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Operating Input Parameters</span>
                  </CardTitle>
                  <CardDescription>
                    Grouped by energy, production volume, and machine operational telemetry.
                  </CardDescription>
                </div>
              </div>
              <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mt-4" />
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Tab 1: ENERGY CONSUMPTION */}
                {activeTab === 'energy' && (
                  <div className="space-y-4">
                    <Input
                      label="Electricity Consumption"
                      unit="kWh"
                      name="electricity_consumption_kwh"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.electricity_consumption_kwh}
                      onChange={handleChange}
                      helperText="Total grid electricity consumed during the operating cycle."
                      required
                    />

                    <Input
                      label="Diesel Consumption"
                      unit="Liters"
                      name="diesel_consumption_liters"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.diesel_consumption_liters}
                      onChange={handleChange}
                      helperText="Diesel fuel used for generators, heavy equipment, and backup power."
                      required
                    />

                    <Input
                      label="Natural Gas Consumption"
                      unit="m³"
                      name="natural_gas_consumption_m3"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.natural_gas_consumption_m3}
                      onChange={handleChange}
                      helperText="Volume of natural gas combusted in industrial furnaces and boilers."
                      required
                    />
                  </div>
                )}

                {/* Tab 2: PRODUCTION VOLUME */}
                {activeTab === 'production' && (
                  <div className="space-y-4">
                    <Input
                      label="Production Quantity"
                      unit="Tons"
                      name="production_quantity"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.production_quantity}
                      onChange={handleChange}
                      helperText="Net manufactured output produced during this operating shift."
                      required
                    />

                    <Input
                      label="Raw Material Usage"
                      unit="kg"
                      name="raw_material_consumption_kg"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.raw_material_consumption_kg}
                      onChange={handleChange}
                      helperText="Mass of raw materials fed into the processing machinery."
                      required
                    />

                    <Input
                      label="Prior Period Baseline CO₂"
                      unit="kg"
                      name="previous_co2_emission_kg"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.previous_co2_emission_kg}
                      onChange={handleChange}
                      helperText="Historical emission benchmark used for autoregressive comparison."
                      required
                    />
                  </div>
                )}

                {/* Tab 3: OPERATING CONDITIONS */}
                {activeTab === 'operations' && (
                  <div className="space-y-4">
                    <Input
                      label="Machine Runtime Hours"
                      unit="Hours"
                      name="machine_runtime_hours"
                      type="number"
                      step="0.1"
                      min="0"
                      max="24"
                      value={formData.machine_runtime_hours}
                      onChange={handleChange}
                      helperText="Continuous operational hours recorded for primary heavy machinery (Max 24h)."
                      required
                    />

                    <Input
                      label="Operating Temperature"
                      unit="°C"
                      name="temperature_c"
                      type="number"
                      step="any"
                      value={formData.temperature_c}
                      onChange={handleChange}
                      helperText="Average ambient and furnace operating temperature."
                      required
                    />

                    <Input
                      label="Operating Pressure"
                      unit="bar"
                      name="pressure_bar"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.pressure_bar}
                      onChange={handleChange}
                      helperText="Process pressure maintained across hydraulic lines and turbines."
                      required
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Tab {activeTab === 'energy' ? '1/3' : activeTab === 'production' ? '2/3' : '3/3'}
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    icon={Cpu}
                    className="w-full sm:w-auto"
                  >
                    Calculate Predicted CO₂
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Prediction Output Card & Next Actions */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-emerald-200/80 shadow-md">
            <CardHeader className="bg-emerald-950 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Selected AI Model Output
                </span>
                <span className="text-xs font-mono bg-emerald-900 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full">
                  Ensemble v1.4
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {error && (
                <Alert type="error" title="Prediction Request Failed">
                  {error}
                </Alert>
              )}

              {!prediction && !error && (
                <div className="p-8 text-center text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <p className="text-xs">
                    Fill out operating values on the left and click <strong>Calculate Predicted CO₂</strong> to execute real-time model inference.
                  </p>
                </div>
              )}

              {prediction && (
                <div className="space-y-6">
                  {/* Primary CO2 Callout */}
                  <div className="bg-slate-900 text-white rounded-xl p-6 text-center space-y-2 border border-slate-800 shadow-inner">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                      PREDICTED CO₂ EMISSIONS
                    </span>
                    <div className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">
                      {prediction.ensemble_prediction_kg?.toLocaleString()} <span className="text-lg text-slate-400 font-normal">kg CO₂</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-xs text-slate-400">Model Reliability:</span>
                      <Badge variant={reliability.variant} size="sm">
                        {reliability.text}
                      </Badge>
                    </div>
                  </div>

                  {/* Individual Sub-model Estimates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <span className="text-[11px] text-slate-500 font-medium block">Random Forest</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        {prediction.random_forest_prediction_kg?.toLocaleString()} kg
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        Weight: {((prediction.rf_weight_used || 0.5) * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <span className="text-[11px] text-slate-500 font-medium block">XGBoost Model</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        {prediction.xgboost_prediction_kg?.toLocaleString()} kg
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        Weight: {((1 - (prediction.rf_weight_used || 0.5)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Next Action Buttons Workflow */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Recommended Next Actions
                    </h4>

                    <Button
                      variant="outline"
                      size="md"
                      icon={Lightbulb}
                      className="w-full justify-between"
                      onClick={() => navigate('/explain-prediction', { state: { inputData: formData, prediction } })}
                    >
                      <span>Understand This Prediction (SHAP)</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="md"
                      icon={SlidersHorizontal}
                      className="w-full justify-between"
                      onClick={() => navigate('/what-if', { state: { baselineInputs: formData, baselinePrediction: prediction.ensemble_prediction_kg } })}
                    >
                      <span>Run What-If Scenario Analysis</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      icon={TrendingDown}
                      className="w-full justify-between"
                      onClick={() => navigate('/optimization', { state: { currentInputs: formData } })}
                    >
                      <span>Find Lower-Emission Scenario</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PredictionTest;
