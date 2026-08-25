import React from 'react';
import { Award, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const RecommendationCard = ({ recommendation }) => {
  if (!recommendation) return null;

  const {
    recommended_candidate_id,
    recommended_changes,
    estimated_reduction_kg,
    estimated_reduction_percentage,
    reliability_status,
    recommendation_reasons,
  } = recommendation;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
        <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-200">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-700 block">Executive Decision-Support Basis</span>
          <h3 className="text-base font-extrabold text-slate-900">Why Was This Operating Scenario Recommended?</h3>
        </div>
      </div>

      <div className="space-y-2 text-xs text-slate-700">
        <ul className="space-y-2 font-sans">
          {recommendation_reasons?.map((reason, idx) => (
            <li key={idx} className="flex items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Sparkles className="w-4 h-4 text-cyan-600 mr-2 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-sans italic">
        * Note: The optimization engine acts strictly as an industrial decision-support system. Final operational parameter adjustments should be validated by plant operations engineers.
      </div>
    </div>
  );
};

export default RecommendationCard;
