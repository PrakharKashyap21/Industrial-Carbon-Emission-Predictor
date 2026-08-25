import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const ScenarioWarning = ({ validation }) => {
  if (!validation || !validation.out_of_training_range || !validation.warnings.length) {
    return null;
  }

  return (
    <div className="bg-amber-950/30 border border-amber-800/80 rounded-2xl p-4 space-y-2 text-xs text-amber-200">
      <div className="flex items-center font-bold text-amber-400">
        <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0" />
        Out-of-Training-Distribution Warnings ({validation.warnings.length})
      </div>
      <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-300 font-sans pl-1">
        {validation.warnings.map((warning, idx) => (
          <li key={idx}>{warning}</li>
        ))}
      </ul>
      <div className="text-[10px] text-amber-400/80 flex items-center pt-1 border-t border-amber-900/60">
        <Info className="w-3 h-3 mr-1 shrink-0" />
        <span>Scenario inputs exceeding historical ranges do not reject execution, but prediction confidence may be reduced.</span>
      </div>
    </div>
  );
};

export default ScenarioWarning;
