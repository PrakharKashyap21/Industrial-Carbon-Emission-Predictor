import React from 'react';
import { Package, ShieldAlert } from 'lucide-react';

export const ConstraintPanel = ({ constraints, onChange, disabled }) => {
  const handleNumChange = (field, val) => {
    onChange({ ...constraints, [field]: parseFloat(val) || 0 });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
          <ShieldAlert className="w-4 h-4 mr-1.5 text-cyan-600" />
          Hard Feasibility Operational Constraints
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Candidates violating these hard limits are automatically rejected during optimization ranking.
        </p>
      </div>

      <div className="space-y-2 text-xs">
        <label className="text-slate-800 font-semibold block flex items-center">
          <Package className="w-3.5 h-3.5 mr-1.5 text-cyan-600" /> Minimum Production Quantity Constraint (units)
        </label>
        <input
          type="number"
          min="0"
          disabled={disabled}
          value={constraints.minimum_production}
          onChange={(e) => handleNumChange('minimum_production', e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:border-cyan-500 focus:outline-none shadow-2xs"
        />
        <span className="text-[10px] text-slate-500 block">
          Default 5,000 units. Candidate configurations yielding lower output will be marked as INFEASIBLE.
        </span>
      </div>
    </div>
  );
};

export default ConstraintPanel;
