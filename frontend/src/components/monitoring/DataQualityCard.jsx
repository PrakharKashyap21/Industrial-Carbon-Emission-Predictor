import React from 'react';
import { Database } from 'lucide-react';
import Badge from '../ui/Badge';

export const DataQualityCard = ({ overview }) => {
  const status = overview?.overall_data_quality || 'good';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Input Data Quality
          </h3>
        </div>
        <Badge variant={status === 'good' ? 'success' : status === 'warning' ? 'warning' : 'danger'}>
          {status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 block">Evaluated</span>
          <span className="text-sm font-extrabold font-mono text-slate-900">{overview?.total_records || 0}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 block">Missing</span>
          <span className={`text-sm font-extrabold font-mono ${overview?.missing_records > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            {overview?.missing_records || 0}
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 block">Duplicates</span>
          <span className="text-sm font-extrabold font-mono text-slate-700">{overview?.duplicate_records || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default DataQualityCard;
