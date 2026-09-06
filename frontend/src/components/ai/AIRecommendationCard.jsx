import React, { useState } from 'react';
import RecommendationConfidence from './RecommendationConfidence';
import AIRecommendationReason from './AIRecommendationReason';
import RecommendationActions from './RecommendationActions';
import { Package, Repeat, Layers, ArrowUpRight, Sparkles } from 'lucide-react';

// Moved to module scope: these are static constants that don't depend on
// props or state, so they should be created once when the module loads,
// not recreated on every render of every card.
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const formatCurrency = (val) => currencyFormatter.format(val || 0);

const TYPE_BADGES = {
  UPSELL: {
    label: 'Upsell',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ArrowUpRight,
  },
  CROSS_SELL: {
    label: 'Cross-Sell',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Layers,
  },
  COMPLEMENTARY: {
    label: 'Complementary',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Package,
  },
  ALTERNATIVE: {
    label: 'Alternative',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Repeat,
  },
};

export default function AIRecommendationCard({
  recommendation,
  onAddToQuote,
  onViewProduct,
  onDismiss,
}) {
  const [isAdded, setIsAdded] = useState(false);

  const currentType = TYPE_BADGES[recommendation.recommendationType] || TYPE_BADGES.CROSS_SELL;
  const TypeIcon = currentType.icon;

  const handleAdd = () => {
    setIsAdded(true);
    onAddToQuote(recommendation);
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs hover:border-[#F26C4F]/40 transition-colors space-y-3 flex flex-col justify-between">
      {/* Card Header: Type Badge & Confidence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentType.bg}`}
          >
            <TypeIcon className="w-3 h-3" />
            <span>{currentType.label}</span>
          </span>

          <RecommendationConfidence confidence={recommendation.confidence} />
        </div>

        {/* Product Details */}
        <div className="pt-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-[#1F2937] leading-snug">
                {recommendation.productName}
              </h4>
              {recommendation.sku && (
                <span className="text-[10px] font-mono text-[#6B7280]">
                  {recommendation.sku}
                </span>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-extrabold text-[#1F2937] block">
                {formatCurrency(recommendation.suggestedPrice || recommendation.price)}
              </span>
              {recommendation.potentialValue && (
                <span className="text-[10px] font-semibold text-emerald-600 block">
                  Est. {recommendation.potentialValue}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Reason & Explanation */}
        <AIRecommendationReason
          reason={recommendation.pitch || recommendation.reason}
          marginImpact={recommendation.marginImpact}
          promotionTag={recommendation.promotionTag}
          lift={recommendation.lift}
          support={recommendation.support}
        />
      </div>

      {/* Action Buttons */}
      <RecommendationActions
        onAddToQuote={handleAdd}
        onViewProduct={onViewProduct ? () => onViewProduct(recommendation) : undefined}
        onDismiss={onDismiss ? () => onDismiss(recommendation.id) : undefined}
        isAdded={isAdded}
      />
    </div>
  );
}
