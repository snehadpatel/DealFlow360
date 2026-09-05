import React from 'react';
import AIInsightCard from '../ai/AIInsightCard';

export default function AIRiskInsight({ quotationId, dealId, riskLevel }) {
  return (
    <div className="space-y-4">
      <AIInsightCard
        dealId={dealId || quotationId || 'Q-1042'}
        quotationId={quotationId || dealId || 'Q-1042'}
        hideHealth={false}
      />
    </div>
  );
}
