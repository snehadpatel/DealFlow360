import React, { useState } from 'react';
import QuotationBuilderSales from '../components/sales/QuotationBuilder';
import AIRecommendationPanel from '../components/ai/AIRecommendationPanel';
import AIInsightCard from '../components/ai/AIInsightCard';

export default function QuotationBuilder() {
  const [cart, setCart] = useState([
    { id: '1', product: 'Enterprise Edge Router X1', productId: 'p1', qty: 5, price: 70000, cost: 45000 },
  ]);
  const [activeQuoteId] = useState('Q-1042');

  const handleAddAiRecommendation = (rec) => {
    const newItem = {
      id: rec.id || `item-${Date.now()}`,
      product: rec.productName,
      productId: rec.productId,
      qty: 1,
      price: rec.suggestedPrice || rec.price || 15000,
      cost: (rec.suggestedPrice || rec.price || 15000) * 0.5,
    };
    setCart((prev) => [...prev, newItem]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Primary Quotation Builder */}
      <QuotationBuilderSales />

      {/* Screen 9: AI Sales Recommendations Component */}
      <AIRecommendationPanel
        quotationId={activeQuoteId}
        cart={cart}
        onAddToQuote={handleAddAiRecommendation}
      />

      {/* Screen 10: AI Risk & Deal Insight Component */}
      <AIInsightCard
        dealId={activeQuoteId}
        quotationId={activeQuoteId}
        onActionClick={(act) => alert(`Executing: ${act}`)}
      />
    </div>
  );
}
