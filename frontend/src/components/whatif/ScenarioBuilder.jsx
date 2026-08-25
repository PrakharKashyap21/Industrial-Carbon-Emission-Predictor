import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, Zap, Fuel, Clock, Package } from 'lucide-react';

export const ScenarioBuilder = ({ onRunSimulation, onBatchCompare, loading }) => {
  const [scenarioName, setScenarioName] = useState('Energy Optimization');
  const [changeType, setChangeType] = useState('percentage'); // percentage or absolute

  // Changes
  const [elecChange, setElecChange] = useState(-10);
  const [dieselChange, setDieselChange] = useState(0);
  const [gasChange, setGasChange] = useState(0);
  const [runtimeChange, setRuntimeChange] = useState(0);
  const [minProduction, setMinProduction] = useState(4800);

  const applyPreset = (presetKey) => {
    setChangeType('percentage');
    if (presetKey === 'energy') {
      setScenarioName('Energy Efficiency (-10% Electricity)');
      setElecChange(-10);
      setDieselChange(0);
      setGasChange(0);
      setRuntimeChange(0);
    } else if (presetKey === 'fuel') {
      setScenarioName('Fuel Optimization (-10% Diesel)');
      setElecChange(0);
      setDieselChange(-10);
      setGasChange(0);
      setRuntimeChange(0);
    } else if (presetKey === 'runtime') {
      setScenarioName('Runtime Optimization (-5% Runtime)');
      setElecChange(0);
      setDieselChange(0);
      setGasChange(0);
      setRuntimeChange(-5);
    } else if (presetKey === 'balanced') {
      setScenarioName('Balanced Optimization (-5% All Energy)');
      setElecChange(-5);
      setDieselChange(-5);
      setGasChange(-5);
      setRuntimeChange(-5);
    }
  };

  const handleRunSingle = (e) => {
    e.preventDefault();
    const changes = {};
    if (elecChange !== 0) changes.electricity_consumption_kwh = parseFloat(elecChange);
    if (dieselChange !== 0) changes.diesel_consumption_liters = parseFloat(dieselChange);
    if (gasChange !== 0) changes.natural_gas_consumption_m3 = parseFloat(gasChange);
    if (runtimeChange !== 0) changes.machine_runtime_hours = parseFloat(runtimeChange);

    onRunSimulation({
      scenario_name: scenarioName,
      changes,
      change_type: changeType,
      constraints: { min_production_output: parseFloat(minProduction) },
    });
  };

  const handleRunBatch = () => {
    onBatchCompare([
      { name: 'Energy Efficiency (-10%)', changes: { electricity_consumption_kwh: -10 } },
      { name: 'Fuel Optimization (-10%)', changes: { diesel_consumption_liters: -10 } },
      { name: 'Runtime Optimization (-5%)', changes: { machine_runtime_hours: -5 } },
      { name: 'Combined Optimization (-10% Elec & Diesel)', changes: { electricity_consumption_kwh: -10, diesel_consumption_liters: -10 } },
    ], { min_production_output: parseFloat(minProduction) });
  };

  return (
    <form onSubmit={handleRunSingle} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Sliders className="w-4 h-4 mr-1.5 text-cyan-600" />
            What-if Scenario Builder & Parameters
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Modify operating parameters (percentage or absolute) to simulate expected CO₂ emissions without altering baseline plant records.
          </p>
        </div>

        {/* Change Type Toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0 font-semibold">
          <button
            type="button"
            onClick={() => setChangeType('percentage')}
            className={`px-3 py-1 rounded-lg transition-colors ${changeType === 'percentage' ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            % Change
          </button>
          <button
            type="button"
            onClick={() => setChangeType('absolute')}
            className={`px-3 py-1 rounded-lg transition-colors ${changeType === 'absolute' ? 'bg-white text-cyan-700 border border-slate-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Absolute Values
          </button>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-600 block">Quick Optimization Presets:</span>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => applyPreset('energy')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-cyan-700 rounded-xl border border-slate-200 transition-colors flex items-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-600" /> <span>Energy -10%</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('fuel')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-amber-700 rounded-xl border border-slate-200 transition-colors flex items-center space-x-1"
          >
            <Fuel className="w-3.5 h-3.5 text-amber-600" /> <span>Fuel -10%</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('runtime')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-emerald-700 rounded-xl border border-slate-200 transition-colors flex items-center space-x-1"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" /> <span>Runtime -5%</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('balanced')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-blue-700 rounded-xl border border-slate-200 transition-colors flex items-center space-x-1"
          >
            <Package className="w-3.5 h-3.5 text-blue-600" /> <span>Balanced Optimization</span>
          </button>
        </div>
      </div>

      {/* Scenario Name Input */}
      <div className="space-y-1.5 text-xs">
        <label className="text-slate-800 font-semibold block">Scenario Name</label>
        <input
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-cyan-500 focus:outline-none shadow-2xs"
        />
      </div>

      {/* Parameter Sliders / Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        {/* Electricity */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between font-sans text-slate-800">
            <span className="font-bold flex items-center"><Zap className="w-3.5 h-3.5 mr-1 text-cyan-600" /> Electricity</span>
            <span className="text-cyan-700 font-mono font-bold">{elecChange > 0 ? `+${elecChange}` : elecChange}{changeType === 'percentage' ? '%' : ' kWh'}</span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={elecChange}
            onChange={(e) => setElecChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
        </div>

        {/* Diesel Fuel */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between font-sans text-slate-800">
            <span className="font-bold flex items-center"><Fuel className="w-3.5 h-3.5 mr-1 text-amber-600" /> Diesel Fuel</span>
            <span className="text-amber-700 font-mono font-bold">{dieselChange > 0 ? `+${dieselChange}` : dieselChange}{changeType === 'percentage' ? '%' : ' L'}</span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={dieselChange}
            onChange={(e) => setDieselChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
        </div>

        {/* Natural Gas */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between font-sans text-slate-800">
            <span className="font-bold flex items-center"><Fuel className="w-3.5 h-3.5 mr-1 text-blue-600" /> Natural Gas</span>
            <span className="text-blue-700 font-mono font-bold">{gasChange > 0 ? `+${gasChange}` : gasChange}{changeType === 'percentage' ? '%' : ' m³'}</span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={gasChange}
            onChange={(e) => setGasChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Machine Runtime */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between font-sans text-slate-800">
            <span className="font-bold flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Machine Runtime</span>
            <span className="text-emerald-700 font-mono font-bold">{runtimeChange > 0 ? `+${runtimeChange}` : runtimeChange}{changeType === 'percentage' ? '%' : ' hrs'}</span>
          </div>
          <input
            type="range"
            min="-25"
            max="25"
            step="1"
            value={runtimeChange}
            onChange={(e) => setRuntimeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      </div>

      {/* Constraints Settings */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
        <label className="text-slate-800 font-semibold block flex items-center">
          <Package className="w-3.5 h-3.5 mr-1.5 text-cyan-600" /> Minimum Production Feasibility Constraint (units)
        </label>
        <input
          type="number"
          min="0"
          value={minProduction}
          onChange={(e) => setMinProduction(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:border-cyan-500 focus:outline-none shadow-2xs"
        />
        <span className="text-[10px] text-slate-500 block">
          Scenarios reducing production below this threshold will be flagged as infeasible.
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>{loading ? 'Simulating...' : 'Run Single Simulation'}</span>
        </button>

        <button
          type="button"
          onClick={handleRunBatch}
          disabled={loading}
          className="w-full sm:flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
        >
          <Sliders className="w-4 h-4" />
          <span>Compare Presets Batch</span>
        </button>
      </div>
    </form>
  );
};

export default ScenarioBuilder;
