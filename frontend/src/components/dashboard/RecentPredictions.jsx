import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPredictions } from '../../services/predictionApi';
import { useFilter } from '../../context/FilterContext';
import { Cpu, ArrowUpRight, CheckCircle2, Clock, RefreshCw, AlertCircle } from 'lucide-react';

export const RecentPredictions = () => {
  const { selectedPlantId } = useFilter();
  const plantParam = selectedPlantId === 'all' ? null : parseInt(selectedPlantId, 10);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecent = async () => {
    setLoading(true);
    setError(null);
    const params = { limit: 5, sort_by: 'newest' };
    if (plantParam && !isNaN(plantParam)) {
      params.plant_id = plantParam;
    }
    const res = await getPredictions(params);
    setLoading(false);
    if (res.success && res.data?.items) {
      setItems(res.data.items);
    } else {
      setError(res.error || 'Failed to load recent prediction audit history.');
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [selectedPlantId]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
          <Cpu className="w-4 h-4 mr-1.5 text-cyan-400" />
          Recent Prediction Lifecycle Audit History
        </h3>
        <Link to="/predictions" className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center">
          View All History →
        </Link>
      </div>

      {loading && (
        <div className="space-y-2.5 animate-pulse">
          <div className="h-12 bg-slate-950/80 rounded-xl border border-slate-800/60" />
          <div className="h-12 bg-slate-950/80 rounded-xl border border-slate-800/60" />
          <div className="h-12 bg-slate-950/80 rounded-xl border border-slate-800/60" />
        </div>
      )}

      {error && !loading && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            {error}
          </span>
          <button
            onClick={fetchRecent}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && (!items || items.length === 0) && (
        <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/60 border border-slate-800/50 rounded-xl font-mono">
          No recent prediction audit logs recorded for this facility option.
        </div>
      )}

      {!loading && !error && items && items.length > 0 && (
        <div className="space-y-2.5 text-xs font-mono">
          {items.map((item) => (
            <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5 font-sans">
                <span className="font-bold text-slate-200 block">
                  Prediction #{item.id} <span className="text-[10px] text-slate-500 font-mono">({item.model_version})</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.prediction_timestamp.replace('T', ' ').substring(0, 16)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="font-bold text-cyan-300 block">{item.ensemble_prediction.toLocaleString()} kg</span>
                  <span className="text-[10px] font-sans text-slate-400">
                    {item.actual_co2 !== null ? `Actual: ${item.actual_co2.toLocaleString()} kg` : 'Pending Actual'}
                  </span>
                </div>

                {item.status === 'evaluated' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 hidden sm:inline-flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Evaluated
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-amber-950 text-amber-300 border border-amber-800 hidden sm:inline-flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-amber-400" /> Pending
                  </span>
                )}

                <Link
                  to={`/predictions/${item.id}`}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-lg border border-slate-800 transition-colors shrink-0"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentPredictions;
