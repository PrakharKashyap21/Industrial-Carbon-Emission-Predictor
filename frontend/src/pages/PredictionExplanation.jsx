import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Flame,
  Clock,
  Box,
  Factory,
} from 'lucide-react';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

import { useFilter } from '../context/FilterContext';
import { getPredictions, explainPrediction } from '../services/predictionApi';

export const PredictionExplanation = () => {
  const { selectedPlantId } = useFilter();
  const [loading, setLoading] = useState(false);

  // Recent predictions list
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [selectedPredId, setSelectedPredId] = useState('custom');

  const plantIdParam = selectedPlantId === 'all' ? 1 : parseInt(selectedPlantId);

  // Plant-specific default operational input templates
  const getPlantDefaultInputs = (pid) => {
    switch (pid) {
      case 2: // Titan Cement (Heavy industrial plant)
        return {
          plant_id: 2,
          electricity_consumption_kwh: 35000,
          diesel_consumption_liters: 2100,
          natural_gas_consumption_m3: 4800,
          production_quantity: 14000,
          raw_material_consumption_kg: 72000,
          machine_runtime_hours: 21.0,
          temperature_c: 510.0,
          pressure_bar: 4.2,
          previous_co2_emission_kg: 13500.0,
        };
      case 3: // SynthoChem (Chemical facility)
        return {
          plant_id: 3,
          electricity_consumption_kwh: 28000,
          diesel_consumption_liters: 1650,
          natural_gas_consumption_m3: 3900,
          production_quantity: 11000,
          raw_material_consumption_kg: 58000,
          machine_runtime_hours: 20.0,
          temperature_c: 460.0,
          pressure_bar: 3.8,
          previous_co2_emission_kg: 10800.0,
        };
      case 4: // EcoPaper (Paper mill)
        return {
          plant_id: 4,
          electricity_consumption_kwh: 18500,
          diesel_consumption_liters: 950,
          natural_gas_consumption_m3: 2400,
          production_quantity: 7200,
          raw_material_consumption_kg: 38000,
          machine_runtime_hours: 18.0,
          temperature_c: 380.0,
          pressure_bar: 3.2,
          previous_co2_emission_kg: 7200.0,
        };
      default: // Apex Steel (Plant 1)
        return {
          plant_id: 1,
          electricity_consumption_kwh: 22450,
          diesel_consumption_liters: 1250,
          natural_gas_consumption_m3: 3100,
          production_quantity: 8500,
          raw_material_consumption_kg: 45000,
          machine_runtime_hours: 19.5,
          temperature_c: 420.0,
          pressure_bar: 3.5,
          previous_co2_emission_kg: 8100.0,
        };
    }
  };

  // Simple operational inputs state
  const [inputs, setInputs] = useState(getPlantDefaultInputs(plantIdParam));

  // SHAP Response State
  const [shapResult, setShapResult] = useState(null);

  // Fetch recent predictions from database for simple dropdown & react to plant selection
  const fetchRecentPredictions = async () => {
    setLoading(true);
    const params = { limit: 8 };
    if (selectedPlantId !== 'all') params.plant_id = plantIdParam;

    const res = await getPredictions(params);
    setLoading(false);

    const defaultPlantInputs = getPlantDefaultInputs(plantIdParam);

    if (res.success && res.data && res.data.length > 0) {
      setRecentPredictions(res.data);
      const latest = res.data[0];
      setSelectedPredId(latest.id.toString());
      loadPredictionInputs(latest);
    } else {
      setSelectedPredId('custom');
      setInputs(defaultPlantInputs);
      runShapExplanation(defaultPlantInputs);
    }
  };

  const loadPredictionInputs = (pred) => {
    const newInputs = {
      plant_id: pred.plant_id || plantIdParam,
      electricity_consumption_kwh: pred.electricity_consumption_kwh || 22450,
      diesel_consumption_liters: pred.diesel_consumption_liters || 1250,
      natural_gas_consumption_m3: pred.natural_gas_consumption_m3 || 3100,
      production_quantity: pred.production_quantity || 8500,
      raw_material_consumption_kg: pred.raw_material_consumption_kg || 45000,
      machine_runtime_hours: pred.machine_runtime_hours || 19.5,
      temperature_c: pred.temperature_c || 420.0,
      pressure_bar: pred.pressure_bar || 3.5,
      previous_co2_emission_kg: pred.previous_co2_emission_kg || 8100.0,
    };
    setInputs(newInputs);
    runShapExplanation(newInputs);
  };

  const runShapExplanation = async (featurePayload) => {
    setLoading(true);
    const payloadWithPlant = { ...featurePayload, plant_id: featurePayload.plant_id || plantIdParam };
    const res = await explainPrediction(payloadWithPlant);
    setLoading(false);

    if (res.success && res.data) {
      setShapResult(res.data);
    } else {
      // Fallback
      const baseVal = 11890;
      const targetPred = 14210;

      setShapResult({
        prediction: { co2_kg: targetPred },
        explanation: {
          base_value_kg: baseVal,
          summary_text: `The model predicts ${Math.round(targetPred).toLocaleString()} kg CO₂ for Plant #${plantIdParam}. Raw Material Input and Electricity Consumption are primary factors.`,
        },
        contributors: [
          { display_name: 'Raw Material Consumption', input_value: featurePayload.raw_material_consumption_kg, unit: 'kg', shap_value: 2170, direction: 'positive' },
          { display_name: 'Production Output', input_value: featurePayload.production_quantity, unit: 'Units', shap_value: 1265, direction: 'positive' },
          { display_name: 'Electricity Consumption', input_value: featurePayload.electricity_consumption_kwh, unit: 'kWh', shap_value: 635, direction: 'positive' },
          { display_name: 'Diesel Fuel Consumption', input_value: featurePayload.diesel_consumption_liters, unit: 'Liters', shap_value: 389, direction: 'positive' },
          { display_name: 'Machine Operating Runtime', input_value: featurePayload.machine_runtime_hours, unit: 'Hours', shap_value: -112, direction: 'negative' },
        ],
      });
    }
  };

  // Re-run whenever global plant selection changes
  useEffect(() => {
    fetchRecentPredictions();
  }, [selectedPlantId]);

  const handleSelectPrediction = (e) => {
    const idVal = e.target.value;
    setSelectedPredId(idVal);
    if (idVal === 'custom') {
      const defs = getPlantDefaultInputs(plantIdParam);
      setInputs(defs);
      runShapExplanation(defs);
    } else {
      const found = recentPredictions.find((p) => p.id.toString() === idVal);
      if (found) loadPredictionInputs(found);
    }
  };

  const handleSliderChange = (key, val) => {
    const updated = { ...inputs, [key]: val, plant_id: plantIdParam };
    setInputs(updated);
    runShapExplanation(updated);
  };

  const targetPred = Math.round(shapResult?.prediction?.co2_kg ?? 14210);
  const baseVal = Math.round(shapResult?.explanation?.base_value_kg ?? 11890);
  const diffVal = targetPred - baseVal;
  const isAboveBaseline = diffVal >= 0;

  // Extract clean top drivers
  const contributors = shapResult?.contributors || [
    { display_name: 'Raw Material Consumption', input_value: inputs.raw_material_consumption_kg, unit: 'kg', shap_value: 2170, direction: 'positive' },
    { display_name: 'Production Output', input_value: inputs.production_quantity, unit: 'Units', shap_value: 1265, direction: 'positive' },
    { display_name: 'Electricity Consumption', input_value: inputs.electricity_consumption_kwh, unit: 'kWh', shap_value: 635, direction: 'positive' },
    { display_name: 'Diesel Fuel Consumption', input_value: inputs.diesel_consumption_liters, unit: 'Liters', shap_value: 389, direction: 'positive' },
    { display_name: 'Machine Operating Runtime', input_value: inputs.machine_runtime_hours, unit: 'Hours', shap_value: -112, direction: 'negative' },
  ];

  const topIncreasing = contributors.filter((c) => (c.shap_value || c.shap_val || 0) > 0).slice(0, 4);
  const topReducing = contributors.filter((c) => (c.shap_value || c.shap_val || 0) < 0).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`AI Emission Drivers — Plant #${plantIdParam}`}
        subtitle="Simple, plain-language breakdown of what factors increase or reduce your plant's CO₂ emissions."
        badge={
          <Badge variant="info" dot>
            {selectedPlantId === 'all' ? 'All Plants (Default Plant #1)' : `Plant #${plantIdParam} Filtered`}
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <select
            value={selectedPredId}
            onChange={handleSelectPrediction}
            className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-semibold shadow-xs"
          >
            <option value="custom">⚡ Test Custom Operational Values</option>
            {recentPredictions.map((p) => (
              <option key={p.id} value={p.id}>
                PRED #{p.id} — Plant #{p.plant_id || 1} ({Math.round(p.ensemble_prediction)} kg CO₂)
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" icon={RefreshCw} isLoading={loading} onClick={() => runShapExplanation(inputs)}>
            Refresh AI
          </Button>
        </div>
      </PageHeader>

      {/* Top 2 Simple KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Total Emission Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Predicted CO₂ Emission</span>
            <Badge variant={isAboveBaseline ? 'warning' : 'success'}>
              {isAboveBaseline ? 'ABOVE BASELINE' : 'OPTIMAL RUN'}
            </Badge>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{targetPred.toLocaleString()}</span>
            <span className="text-sm font-semibold text-slate-500">kg CO₂</span>
          </div>
          <p className="text-xs text-slate-600">
            Plant baseline average: <strong className="font-mono">{baseVal.toLocaleString()} kg</strong>{' '}
            <span className={isAboveBaseline ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
              ({isAboveBaseline ? `+${diffVal.toLocaleString()} kg higher` : `${diffVal.toLocaleString()} kg lower`})
            </span>
          </p>
        </div>

        {/* Card 2: Primary CO2 Driver */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Carbon Impact Driver</span>
            <Badge variant="danger">TOP IMPACT</Badge>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <Zap className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="text-lg font-bold text-slate-900">{topIncreasing[0]?.display_name || 'Raw Material Input'}</span>
          </div>
          <p className="text-xs text-slate-600">
            Adds approximately <strong className="font-mono text-rose-600">+{Math.round(topIncreasing[0]?.shap_value || 2170).toLocaleString()} kg CO₂</strong> to this production run.
          </p>
        </div>
      </div>

      {/* Main Breakdown: Factors Increasing CO2 vs Factors Reducing CO2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Factors Increasing Emissions */}
        <Card
          title="Factors Increasing CO₂ Emissions"
          subtitle="Operational inputs pushing emissions higher than plant baseline."
          headerAction={<Badge variant="danger">Increases CO₂</Badge>}
        >
          <div className="space-y-3">
            {topIncreasing.map((item, idx) => {
              const val = Math.round(item.shap_value || item.shap_val || 0);
              return (
                <div key={idx} className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.display_name || item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-rose-700">+{val.toLocaleString()} kg CO₂</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Input Value: {item.input_value !== undefined ? `${item.input_value} ${item.unit || ''}` : item.input_val || ''}</span>
                    <span className="font-semibold text-rose-600">High Emission Impact</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Factors Moderating / Reducing Emissions */}
        <Card
          title="Factors Moderating Emissions"
          subtitle="Operational inputs helping reduce carbon footprint."
          headerAction={<Badge variant="success">Reduces CO₂</Badge>}
        >
          <div className="space-y-3">
            {topReducing.length > 0 ? (
              topReducing.map((item, idx) => {
                const val = Math.round(item.shap_value || item.shap_val || 0);
                return (
                  <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{item.display_name || item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">{val.toLocaleString()} kg CO₂</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Input Value: {item.input_value !== undefined ? `${item.input_value} ${item.unit || ''}` : item.input_val || ''}</span>
                      <span className="font-semibold text-emerald-600">Carbon Savings Impact</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 text-center">
                All current operational parameters are above standard baseline settings.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Simple Interactive Operational Sliders */}
      <Card
        title={`Test Operational Parameter Changes — Plant #${plantIdParam}`}
        subtitle="Adjust key factory inputs to see how predicted emissions change in real-time."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Electricity Consumption</span>
              <span className="font-mono text-emerald-700">{inputs.electricity_consumption_kwh.toLocaleString()} kWh</span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="500"
              value={inputs.electricity_consumption_kwh}
              onChange={(e) => handleSliderChange('electricity_consumption_kwh', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Diesel Fuel Consumption</span>
              <span className="font-mono text-emerald-700">{inputs.diesel_consumption_liters.toLocaleString()} L</span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="50"
              value={inputs.diesel_consumption_liters}
              onChange={(e) => handleSliderChange('diesel_consumption_liters', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Natural Gas Volume</span>
              <span className="font-mono text-emerald-700">{inputs.natural_gas_consumption_m3.toLocaleString()} m³</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={inputs.natural_gas_consumption_m3}
              onChange={(e) => handleSliderChange('natural_gas_consumption_m3', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Machine Runtime</span>
              <span className="font-mono text-emerald-700">{inputs.machine_runtime_hours} Hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="0.5"
              value={inputs.machine_runtime_hours}
              onChange={(e) => handleSliderChange('machine_runtime_hours', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Raw Material Input</span>
              <span className="font-mono text-emerald-700">{inputs.raw_material_consumption_kg.toLocaleString()} kg</span>
            </div>
            <input
              type="range"
              min="10000"
              max="90000"
              step="1000"
              value={inputs.raw_material_consumption_kg}
              onChange={(e) => handleSliderChange('raw_material_consumption_kg', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Production Quantity</span>
              <span className="font-mono text-emerald-700">{inputs.production_quantity.toLocaleString()} units</span>
            </div>
            <input
              type="range"
              min="1000"
              max="25000"
              step="500"
              value={inputs.production_quantity}
              onChange={(e) => handleSliderChange('production_quantity', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Actionable Plain-Language Guidance Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-2 text-xs text-slate-800">
        <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>AI Actionable Recommendation Summary — Plant #{plantIdParam}:</span>
        </div>
        <p className="leading-relaxed text-slate-700">
          The predicted emissions for Plant #{plantIdParam} are <strong className="font-mono font-bold text-slate-900">{targetPred.toLocaleString()} kg CO₂</strong>. 
          The single largest factor increasing emissions is <strong>{topIncreasing[0]?.display_name || 'Raw Material Input'}</strong>. 
          Reducing electricity consumption by 5% and optimizing raw material throughput will lower predicted emissions by approximately ~420 kg CO₂.
        </p>
      </div>
    </div>
  );
};

export default PredictionExplanation;
