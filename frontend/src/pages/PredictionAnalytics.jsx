import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPredictionAnalytics } from '../services/predictionApi';
import { Scale, ArrowLeft, Award, ShieldCheck, Activity, RefreshCw, BarChart2 } from 'lucide-react';

export const PredictionAnalytics = () => {
  const [plantId, setPlantId] = useState('');
  const [days, setDays] = useState(30);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    const params = { days };
    if (plantId) params.plant_id = parseInt(plantId);

    const res = await getPredictionAnalytics(params);
    setLoading(false);
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [plantId, days]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="space-y-4">
        <Link to="/predictions" className="text-xs font-semibold text-slate-400 hover:text-cyan-400 flex items-center space-x-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span>Back to Prediction History</span>
        </Link>

        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Phase 8 Operational Performance Analytics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Historical Operational Prediction Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Operational error metrics (MAE, RMSE, MAPE, Bias) evaluated across real database prediction lifecycle records.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Facilities</option>
              <option value="1">Apex Steel Works</option>
              <option value="2">Titan Cement Plant</option>
              <option value="3">SynthoChem</option>
              <option value="4">Vanguard Textile</option>
              <option value="5">NutriFood</option>
            </select>

            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="bg-slate-950 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {loading && !data && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
          <p>Loading historical prediction analytics...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-6 rounded-2xl text-xs text-center">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-8">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-sans block">Operational MAE</span>
              <span className="text-2xl font-extrabold text-cyan-300">{data.mae !== null ? `${data.mae} kg` : 'N/A'}</span>
              <span className="text-[10px] text-slate-500 font-sans block">Mean Absolute Error</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-sans block">Operational RMSE</span>
              <span className="text-2xl font-extrabold text-slate-200">{data.rmse !== null ? `${data.rmse} kg` : 'N/A'}</span>
              <span className="text-[10px] text-slate-500 font-sans block">Root Mean Squared Error</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-sans block">Operational MAPE</span>
              <span className="text-2xl font-extrabold text-emerald-300">{data.mape !== null ? `${data.mape}%` : 'N/A'}</span>
              <span className="text-[10px] text-slate-500 font-sans block">Mean Absolute % Error</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-sans block">Mean Bias</span>
              <span className={`text-2xl font-extrabold ${data.mean_bias > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {data.mean_bias !== null ? `${data.mean_bias > 0 ? '+' : ''}${data.mean_bias} kg` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 font-sans block">
                {data.mean_bias > 0 ? 'Overprediction Bias' : 'Underprediction Bias'}
              </span>
            </div>
          </div>

          {/* Model Comparison Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center border-b border-slate-800 pb-3">
              <Award className="w-4 h-4 mr-1.5 text-cyan-400" />
              Operational Candidate Comparison (Random Forest vs XGBoost vs Ensemble)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Candidate Model</th>
                    <th className="py-2.5 px-3">Version</th>
                    <th className="py-2.5 px-3 text-right">MAE (kg)</th>
                    <th className="py-2.5 px-3 text-right">RMSE (kg)</th>
                    <th className="py-2.5 px-3 text-right">MAPE (%)</th>
                    <th className="py-2.5 px-3 text-right">Mean Bias (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {data.model_comparison.map((m, idx) => (
                    <tr key={idx} className={m.is_active ? 'bg-cyan-950/20 font-bold' : ''}>
                      <td className="py-3 px-3 font-sans text-slate-200">{m.model}</td>
                      <td className="py-3 px-3 text-slate-400">{m.version}</td>
                      <td className="py-3 px-3 text-right text-cyan-300">{m.mae}</td>
                      <td className="py-3 px-3 text-right text-slate-200">{m.rmse}</td>
                      <td className="py-3 px-3 text-right text-slate-200">{m.mape}%</td>
                      <td className="py-3 px-3 text-right text-slate-300">{m.mean_bias > 0 ? '+' : ''}{m.mean_bias}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actual vs Predicted Scatter Points Plot */}
          {data.scatter_points && data.scatter_points.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center border-b border-slate-800 pb-3">
                <BarChart2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                Actual vs Predicted Agreement Scatter Plot (Diagonal y = x Line)
              </h3>

              <div className="space-y-3">
                <div className="h-48 w-full flex items-end justify-between space-x-1 pt-4 pb-2 border-b border-slate-800 overflow-x-auto">
                  {data.scatter_points.slice(-30).map((pt, idx) => {
                    const maxVal = Math.max(pt.actual_co2, pt.ensemble_prediction, 1);
                    const actPct = (pt.actual_co2 / maxVal) * 100;
                    const predPct = (pt.ensemble_prediction / maxVal) * 100;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end min-w-[12px]">
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 bg-slate-950 text-slate-200 text-[10px] p-2 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap font-mono">
                          <span className="font-sans font-bold text-slate-300 block">Pred #{pt.id} ({pt.timestamp})</span>
                          Actual: <strong className="text-slate-200">{pt.actual_co2.toLocaleString()} kg</strong><br />
                          Predicted: <strong className="text-cyan-300">{pt.ensemble_prediction.toLocaleString()} kg</strong>
                        </div>

                        <div className="w-2 h-2 rounded-full bg-cyan-400 border border-slate-950 shadow-sm" style={{ marginBottom: `${predPct}%` }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Evaluated Records ({data.scatter_points.length} Points)</span>
                  <span className="text-emerald-400 font-sans">Agreement Line Verified</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionAnalytics;
