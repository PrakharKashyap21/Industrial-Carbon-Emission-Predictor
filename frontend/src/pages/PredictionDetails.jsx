import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPredictionById, updatePredictionActual } from '../services/predictionApi';
import { Cpu, ArrowLeft, CheckCircle2, Clock, Scale, HelpCircle, Save, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PredictionDetails = () => {
  const { id } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actualInput, setActualInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    const res = await getPredictionById(id);
    setLoading(false);
    if (res.success) {
      setPrediction(res.data);
      if (res.data.actual_co2 !== null && res.data.actual_co2 !== undefined) {
        setActualInput(res.data.actual_co2.toString());
      }
    } else {
      setError(res.error);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdateActual = async (e) => {
    e.preventDefault();
    const val = parseFloat(actualInput);
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid positive numerical CO₂ emission value.');
      return;
    }
    setUpdating(true);
    setUpdateMsg(null);
    const res = await updatePredictionActual(id, val);
    setUpdating(false);
    if (res.success) {
      setPrediction(res.data);
      setUpdateMsg('Actual CO₂ emission updated successfully! Errors recalculated.');
    } else {
      setError(res.error);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs space-y-2">
        <Cpu className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
        <p>Loading prediction lifecycle details...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="space-y-4">
        <Link to="/predictions" className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" /> <span>Back to Prediction History</span>
        </Link>
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-6 rounded-2xl text-xs">
          {error || 'Prediction record not found'}
        </div>
      </div>
    );
  }

  const {
    plant_id,
    prediction_timestamp,
    reading_timestamp,
    rf_prediction,
    xgb_prediction,
    ensemble_prediction,
    actual_co2,
    signed_error,
    absolute_error,
    percentage_error,
    model_version,
    model_type,
    status,
    input_features,
    shap_explanation,
  } = prediction;

  const isEvaluated = status === 'evaluated';

  // Scaling for visual comparison bars
  const maxBarVal = Math.max(rf_prediction, xgb_prediction, ensemble_prediction, actual_co2 || 0, 1);

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link to="/predictions" className="text-xs font-semibold text-slate-400 hover:text-cyan-400 flex items-center space-x-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span>Back to Prediction History</span>
        </Link>

        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Prediction #{prediction.id}
              </span>
              {isEvaluated ? (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Status: Evaluated
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" /> Status: Pending Actual
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-white">
              Prediction Lifecycle Detail & Model Comparison
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Plant ID: #{plant_id} • Generated: {prediction_timestamp.replace('T', ' ').substring(0, 19)} • Model: {model_version} ({model_type})
            </p>
          </div>
        </div>
      </div>

      {updateMsg && (
        <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-4 rounded-2xl text-xs flex items-center space-x-2 font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{updateMsg}</span>
        </div>
      )}

      {/* Visual Model Output Comparison Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center border-b border-slate-800 pb-3">
          <Cpu className="w-4 h-4 mr-1.5 text-cyan-400" />
          Model Candidate Outputs vs Actual Recorded CO₂
        </h3>

        <div className="space-y-4 pt-1 font-mono text-xs">
          {/* RF */}
          <div className="space-y-1">
            <div className="flex justify-between font-sans text-slate-300">
              <span>Random Forest Regressor (rf_v1)</span>
              <strong className="text-slate-200 font-mono">{rf_prediction.toLocaleString()} kg CO₂</strong>
            </div>
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div className="h-full bg-slate-500 rounded-full" style={{ width: `${(rf_prediction / maxBarVal) * 100}%` }} />
            </div>
          </div>

          {/* XGBoost */}
          <div className="space-y-1">
            <div className="flex justify-between font-sans text-slate-300">
              <span>XGBoost Regressor (xgb_v1)</span>
              <strong className="text-slate-200 font-mono">{xgb_prediction.toLocaleString()} kg CO₂</strong>
            </div>
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(xgb_prediction / maxBarVal) * 100}%` }} />
            </div>
          </div>

          {/* Ensemble */}
          <div className="space-y-1">
            <div className="flex justify-between font-sans text-cyan-400 font-bold">
              <span>Weighted Ensemble Prediction (ensemble_v1)</span>
              <strong className="text-cyan-300 font-mono text-sm">{ensemble_prediction.toLocaleString()} kg CO₂</strong>
            </div>
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full" style={{ width: `${(ensemble_prediction / maxBarVal) * 100}%` }} />
            </div>
          </div>

          {/* Actual */}
          <div className="space-y-1 pt-2 border-t border-slate-800/60">
            <div className="flex justify-between font-sans text-emerald-400 font-bold">
              <span>Actual Recorded CO₂ Emission</span>
              <strong className="text-emerald-300 font-mono text-sm">
                {actual_co2 !== null ? `${actual_co2.toLocaleString()} kg CO₂` : 'Pending Actual'}
              </strong>
            </div>
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full" style={{ width: actual_co2 ? `${(actual_co2 / maxBarVal) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Error Cards & Actual Update Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Error Cards Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center border-b border-slate-800 pb-3">
              <Scale className="w-4 h-4 mr-1.5 text-emerald-400" />
              Operational Evaluation Metrics
            </h3>

            {isEvaluated ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-sans block">Signed Error</span>
                  <span className={`text-lg font-extrabold ${signed_error > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {signed_error > 0 ? '+' : ''}{signed_error} kg
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans block mt-1">
                    {signed_error > 0 ? 'Overpredicted' : 'Underpredicted'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-sans block">Absolute Error (MAE)</span>
                  <span className="text-lg font-extrabold text-cyan-300">
                    {absolute_error} kg
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans block mt-1">
                    |Actual - Predicted|
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-sans block">Percentage Error</span>
                  <span className="text-lg font-extrabold text-emerald-300">
                    {percentage_error !== null ? `${percentage_error}%` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans block mt-1">
                    Relative Error
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 p-6 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                Actual emission data not available yet for this prediction record. Enter actual value to compute operational errors.
              </div>
            )}
          </div>
        </div>

        {/* Update Actual Form Column */}
        <div className="lg:col-span-5">
          <form onSubmit={handleUpdateActual} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center border-b border-slate-800 pb-3">
              <Save className="w-4 h-4 mr-1.5 text-cyan-400" />
              Update Actual Recorded CO₂ Emission
            </h3>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold block">Actual CO₂ Emission (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={actualInput}
                onChange={(e) => setActualInput(e.target.value)}
                placeholder="e.g. 8420.5"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block">
                Enter physical measurement to calculate signed error & transition status to evaluated.
              </span>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{updating ? 'Saving...' : 'Save Actual CO₂ & Calculate Errors'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Local SHAP Explanation Section */}
      {shap_explanation && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center border-b border-slate-800 pb-3">
            <HelpCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
            Why Did the Model Predict {ensemble_prediction.toLocaleString()} kg CO₂? (SHAP Feature Attributions)
          </h3>

          <div className="space-y-2 pt-1 font-mono text-xs">
            {shap_explanation.top_positive?.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-sans font-bold text-slate-200 block">{item.display_name}</span>
                  <span className="text-[10px] text-slate-500 font-sans">{item.description}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-400 block">+{item.shap_value} kg CO₂</span>
                  <span className="text-[10px] text-slate-500 font-sans">Input: {item.input_value} {item.unit}</span>
                </div>
              </div>
            ))}

            {shap_explanation.top_negative?.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-sans font-bold text-slate-200 block">{item.display_name}</span>
                  <span className="text-[10px] text-slate-500 font-sans">{item.description}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">{item.shap_value} kg CO₂</span>
                  <span className="text-[10px] text-slate-500 font-sans">Input: {item.input_value} {item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDetails;
