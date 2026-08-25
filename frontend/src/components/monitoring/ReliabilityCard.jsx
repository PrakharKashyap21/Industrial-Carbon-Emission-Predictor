import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export const ReliabilityCard = ({ reliabilityData }) => {
  const status = reliabilityData?.overall_reliability || 'HIGH';
  const reasons = reliabilityData?.reasons || [];

  let badge = (
    <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center">
      <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" /> HIGH RELIABILITY
    </span>
  );
  if (status === 'MEDIUM') {
    badge = (
      <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-950 text-amber-300 border border-amber-800 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-400" /> MEDIUM RELIABILITY
      </span>
    );
  } else if (status === 'LOW') {
    badge = (
      <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-rose-950 text-rose-300 border border-rose-800 flex items-center">
        <AlertOctagon className="w-4 h-4 mr-1.5 text-rose-400" /> LOW RELIABILITY
      </span>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Prediction Reliability Assessment
          </h3>
        </div>
        {badge}
      </div>

      <div className="space-y-2 text-xs">
        <span className="font-semibold text-slate-400 block">Assessment Reasoning & Observations:</span>
        <ul className="space-y-1.5">
          {reasons.map((r, idx) => (
            <li key={idx} className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800/80 text-slate-300 flex items-start space-x-2 font-mono text-[11px]">
              <span className="text-cyan-400 shrink-0 font-bold">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReliabilityCard;
