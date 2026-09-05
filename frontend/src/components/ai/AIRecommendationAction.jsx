import React from 'react';
import { Lightbulb, ArrowRight, ShieldCheck, UserCheck, MessageSquare, Edit3 } from 'lucide-react';

export default function AIRecommendationAction({
  action = 'Request manager approval before submitting the quotation.',
  onActionClick,
}) {
  if (!action) return null;

  return (
    <div className="bg-[#FEECE8]/40 border border-[#F26C4F]/30 p-4 rounded-2xl space-y-3">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-[#FEECE8] text-[#F26C4F]">
          <Lightbulb className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
          Recommended Next Action
        </span>
      </div>

      <p className="text-xs text-[#1F2937] font-medium leading-relaxed">
        {action}
      </p>

      {/* Suggested Action Quick Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F26C4F]/20">
        <button
          onClick={() => onActionClick && onActionClick('REQUEST_APPROVAL')}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#F26C4F] hover:bg-[#E0583B] text-white rounded-xl text-xs font-bold transition shadow-2xs"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Request Approval</span>
        </button>

        <button
          onClick={() => onActionClick && onActionClick('REVIEW_DISCOUNT')}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#1F2937] rounded-xl text-xs font-semibold transition"
        >
          <Edit3 className="w-3 h-3 text-[#6B7280]" />
          <span>Review Discount</span>
        </button>

        <button
          onClick={() => onActionClick && onActionClick('CONTACT_CUSTOMER')}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#1F2937] rounded-xl text-xs font-semibold transition"
        >
          <MessageSquare className="w-3 h-3 text-[#6B7280]" />
          <span>Contact Customer</span>
        </button>
      </div>
    </div>
  );
}
