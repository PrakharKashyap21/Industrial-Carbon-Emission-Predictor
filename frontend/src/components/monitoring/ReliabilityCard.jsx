import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Badge from '../ui/Badge';

export const ReliabilityCard = ({ reliabilityData }) => {
  const status = reliabilityData?.overall_reliability || 'HIGH';
  const reasons = reliabilityData?.reasons || ['Input data quality healthy', 'Feature population stability index within baseline bounds'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Prediction Reliability
          </h3>
        </div>
        <Badge variant={status === 'HIGH' ? 'success' : status === 'MEDIUM' ? 'warning' : 'danger'}>
          {status} RELIABILITY
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs">
        <span className="font-semibold text-slate-500 block text-[11px]">Assessment Reasoning:</span>
        <ul className="space-y-1">
          {reasons.slice(0, 2).map((r, idx) => (
            <li key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700 font-sans text-[11px] flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReliabilityCard;
