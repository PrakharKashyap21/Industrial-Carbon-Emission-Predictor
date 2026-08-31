import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPredictions } from '../services/predictionApi';
import { Cpu, Calendar, Filter, ChevronLeft, ChevronRight, RefreshCw, ArrowUpRight, CheckCircle2, Clock, Scale } from 'lucide-react';

export const Predictions = () => {
  const [plantId, setPlantId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    const params = {
      page,
      limit,
      sort_by: sortBy,
    };
    if (plantId) params.plant_id = parseInt(plantId);
    if (statusFilter) params.status = statusFilter;

    const res = await getPredictions(params);
    setLoading(false);
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [plantId, statusFilter, sortBy, page]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Prediction Lifecycle Audit History
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Industrial Prediction Records & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit historical ML predictions, track model version tags (<code className="text-cyan-300 font-mono">ensemble_v1</code>), and compare predictions against actual emissions.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/predictions/analytics"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Operational Analytics →</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filters:</span>
          </div>

          {/* Plant Selector */}
          <select
            value={plantId}
            onChange={(e) => { setPlantId(e.target.value); setPage(1); }}
            className="bg-slate-950 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="">All Industrial Facilities</option>
            <option value="1">Apex Steel Works (Plant 1)</option>
            <option value="2">Titan Cement Plant (Plant 2)</option>
            <option value="3">SynthoChem Industries (Plant 3)</option>
            <option value="4">Vanguard Textile Mill (Plant 4)</option>
            <option value="5">NutriFood Processing Ltd (Plant 5)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="evaluated">Evaluated Only</option>
            <option value="pending_actual">Pending Actual</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="bg-slate-950 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_error">Highest Error</option>
            <option value="lowest_error">Lowest Error</option>
            <option value="highest_predicted">Highest Predicted CO₂</option>
          </select>
        </div>

        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-800 flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading && !data && (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
            <p>Loading prediction history...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-950/40 border-b border-rose-800 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-xs font-sans">
            No predictions found for the selected filters.
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
                  <th className="py-3 px-4">Prediction ID & Timestamp</th>
                  <th className="py-3 px-4">Plant</th>
                  <th className="py-3 px-4 text-right">RF Pred</th>
                  <th className="py-3 px-4 text-right">XGB Pred</th>
                  <th className="py-3 px-4 text-right">Ensemble Pred</th>
                  <th className="py-3 px-4 text-right">Actual CO₂</th>
                  <th className="py-3 px-4 text-right">Abs Error</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.items.map((item) => {
                  const isEvaluated = item.status === 'evaluated';

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-200 flex items-center">
                          <span className="font-mono text-cyan-400 mr-2">#{item.id}</span>
                          <span className="text-slate-400 text-[11px] font-mono">
                            {item.prediction_timestamp.replace('T', ' ').substring(0, 16)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          Version: {item.model_version}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-sans font-medium text-slate-300">
                        Plant #{item.plant_id}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-400">
                        {item.rf_prediction.toLocaleString()} kg
                      </td>

                      <td className="py-3 px-4 text-right text-slate-400">
                        {item.xgb_prediction.toLocaleString()} kg
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-cyan-300">
                        {item.ensemble_prediction.toLocaleString()} kg
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-200">
                        {item.actual_co2 !== null ? `${item.actual_co2.toLocaleString()} kg` : '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {item.absolute_error !== null ? (
                          <span className="font-bold text-emerald-400">
                            {item.absolute_error.toLocaleString()} kg
                            {item.percentage_error !== null && (
                              <span className="text-[10px] opacity-75 ml-1 font-normal">({item.percentage_error}%)</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-sans">
                        {isEvaluated ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Evaluated
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 inline-flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-amber-400" /> Pending Actual
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-sans">
                        <Link
                          to={`/predictions/${item.id}`}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg border border-slate-800 transition-colors text-[11px] inline-flex items-center space-x-1"
                        >
                          <span>Details</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.pagination && data.pagination.total_pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/60">
            <span>
              Page <strong>{data.pagination.page}</strong> of <strong>{data.pagination.total_pages}</strong> ({data.pagination.total} total predictions)
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-200 rounded-xl border border-slate-800 flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </button>

              <button
                disabled={page >= data.pagination.total_pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-200 rounded-xl border border-slate-800 flex items-center"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions;
