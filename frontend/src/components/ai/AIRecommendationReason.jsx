import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Bot } from 'lucide-react';

export default function AIRecommendationReason({ reason, marginImpact, promotionTag, lift, support }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!reason) return null;

  return (
    <div className="space-y-1.5 text-xs">
      <div className="bg-[#F4F5F7]/80 p-2.5 rounded-xl border border-slate-200/70 text-[#1F2937] leading-relaxed">
        <div className="flex items-center space-x-1.5 mb-1 font-semibold text-[#6B7280] text-[10px] uppercase tracking-wider">
          <Bot className="w-3 h-3 text-[#F26C4F]" />
          <span>Why this recommendation?</span>
        </div>
        <p className="text-xs text-[#1F2937]">{reason}</p>
      </div>

      {(marginImpact || promotionTag || lift) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {marginImpact && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              {marginImpact}
            </span>
          )}
          {promotionTag && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FEECE8] text-[#F26C4F] rounded-md border border-[#F26C4F]/20">
              {promotionTag}
            </span>
          )}
          {lift && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 rounded-md">
              Lift: {typeof lift === 'number' ? lift.toFixed(2) : lift}x
            </span>
          )}
        </div>
      )}
    </div>
  );
}
