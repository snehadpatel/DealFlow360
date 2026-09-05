import React from 'react';
import { Plus, Eye, X, Check } from 'lucide-react';

export default function RecommendationActions({
  onAddToQuote,
  onViewProduct,
  onDismiss,
  isAdded,
}) {
  return (
    <div className="flex items-center space-x-2 pt-2 border-t border-[#E5E7EB]/60">
      <button
        onClick={onAddToQuote}
        disabled={isAdded}
        className={`flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs ${
          isAdded
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
            : 'bg-[#F26C4F] hover:bg-[#E0583B] text-white'
        }`}
      >
        {isAdded ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Added to Quote</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Quote</span>
          </>
        )}
      </button>

      {onViewProduct && (
        <button
          onClick={onViewProduct}
          className="p-2 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-[#6B7280] transition"
          title="View Product Specs"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-2 rounded-xl border border-[#E5E7EB] hover:bg-rose-50 hover:text-rose-600 text-[#6B7280] transition"
          title="Dismiss Recommendation"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
